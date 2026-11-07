"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Availability = {
  id: number;
  weekday: number;
  start_time: string;
  end_time: string;
  active: boolean;
};

type BlockedTime = {
  id: number;
  blocked_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};

const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AvailabilityPage() {
  const router = useRouter();

  const [availability, setAvailability] = useState<Availability[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [weekday, setWeekday] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const [blockedDate, setBlockedDate] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [blockedStart, setBlockedStart] = useState("12:00");
  const [blockedEnd, setBlockedEnd] = useState("13:00");
  const [reason, setReason] = useState("");

  useEffect(() => {
    async function checkAdminAndLoad() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      await Promise.all([
        loadAvailability(),
        loadBlockedTimes(),
      ]);

      setLoading(false);
    }

    checkAdminAndLoad();
  }, [router]);

  async function loadAvailability() {
    const { data, error } = await supabase
      .from("weekly_availability")
      .select("id, weekday, start_time, end_time, active")
      .order("weekday")
      .order("start_time");

    if (error) {
      setError(error.message);
      return;
    }

    setAvailability(data ?? []);
  }

  async function loadBlockedTimes() {
    const { data, error } = await supabase
      .from("blocked_times")
      .select("id, blocked_date, start_time, end_time, reason")
      .order("blocked_date")
      .order("start_time");

    if (error) {
      setError(error.message);
      return;
    }

    setBlockedTimes(data ?? []);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (startTime >= endTime) {
      setError("The ending time must be later than the starting time.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("weekly_availability")
      .insert({
        weekday: Number(weekday),
        start_time: startTime,
        end_time: endTime,
        active: true,
      });

    if (error) {
      setError(error.message);
    } else {
      await loadAvailability();
      setMessage("Working hours added successfully.");
    }

    setSaving(false);
  }

  async function handleToggle(item: Availability) {
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("weekly_availability")
      .update({ active: !item.active })
      .eq("id", item.id);

    if (error) {
      setError(error.message);
    } else {
      await loadAvailability();
      setMessage("Availability updated.");
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this time window?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("weekly_availability")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      await loadAvailability();
      setMessage("Working hours deleted.");
    }
  }

  async function handleAddBlockedTime(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!blockedDate) {
      setError("Please select a date.");
      return;
    }

    if (!allDay && blockedStart >= blockedEnd) {
      setError("The ending time must be later than the starting time.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("blocked_times")
      .insert({
        blocked_date: blockedDate,
        start_time: allDay ? null : blockedStart,
        end_time: allDay ? null : blockedEnd,
        reason: reason.trim() || null,
      });

    if (error) {
      setError(error.message);
    } else {
      await loadBlockedTimes();
      setBlockedDate("");
      setReason("");
      setAllDay(true);
      setMessage("Date blocked successfully.");
    }

    setSaving(false);
  }

  async function handleDeleteBlockedTime(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this blocked time?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("blocked_times")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      await loadBlockedTimes();
      setMessage("Blocked time removed.");
    }
  }

  function formatDate(date: string) {
    return new Date(`${date}T12:00:00`).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading availability...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <a
          href="/admin"
          className="text-sm text-white transition hover:text-[#c6a53a] hover:underline"
        >
          ← Back to Dashboard
        </a>

        <h1 className="mt-6 text-3xl font-semibold text-white">
          Availability
        </h1>

        <p className="mt-2 text-gray-400">
          Manage your regular working hours and specific unavailable dates.
        </p>

        {error && (
          <p className="mt-5 text-sm text-red-400">{error}</p>
        )}

        {message && (
          <p className="mt-5 text-sm text-green-400">{message}</p>
        )}

        {/* Weekly availability */}
        <section className="mt-10 rounded-xl border border-white/20 bg-white/5 p-6">
          <h2 className="mb-5 text-xl font-semibold text-white">
            Add Working Hours
          </h2>

          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Day
              </label>
              <select
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-[#38291F] px-3 py-3 text-white outline-none transition focus:border-[#c6a53a]"
              >
                {weekdays.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full rounded-lg border border-white/20 bg-[#38291F] px-3 py-3 text-white outline-none transition focus:border-[#c6a53a]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full rounded-lg border border-white/20 bg-[#38291F] px-3 py-3 text-white outline-none transition focus:border-[#c6a53a]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                style={{
                  background: `linear-gradient(
                    115deg,
                    #6e5a17 0%,
                    #a8872a 20%,
                    #c6a53a 40%,
                    #f2e3a2 50%,
                    #c6a53a 60%,
                    #a8872a 80%,
                    #6e5a17 100%
                  )`,
                }}
              >
                {saving ? "Adding..." : "Add Hours"}
              </button>
            </div>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-xl font-semibold text-white">
            Your Weekly Schedule
          </h2>

          {availability.length === 0 ? (
            <p className="rounded-xl border border-white/20 p-6 text-gray-400">
              No working hours added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {weekdays.map((day, index) => {
                const dayEntries = availability.filter(
                  (item) => item.weekday === index
                );

                if (dayEntries.length === 0) return null;

                return (
                  <div
                    key={day}
                    className="rounded-xl border border-white/20 bg-white/5 p-5"
                  >
                    <h3 className="mb-4 font-semibold text-white">
                      {day}
                    </h3>

                    <div className="space-y-3">
                      {dayEntries.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-white">
                              {item.start_time.slice(0, 5)} –{" "}
                              {item.end_time.slice(0, 5)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.active ? "Available" : "Inactive"}
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleToggle(item)}
                              className="text-sm text-white transition hover:text-[#c6a53a] hover:underline"
                            >
                              {item.active ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-sm text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Date-specific blocks */}
        <section className="mt-12 rounded-xl border border-white/20 bg-white/5 p-6">
          <h2 className="mb-2 text-xl font-semibold text-white">
            Block a Date or Time
          </h2>

          <p className="mb-6 text-sm text-gray-400">
            Make yourself unavailable on a specific date without changing
            your regular weekly schedule.
          </p>

          <form
            onSubmit={handleAddBlockedTime}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Date
              </label>
              <input
                type="date"
                value={blockedDate}
                onChange={(e) => setBlockedDate(e.target.value)}
                required
                className="w-full rounded-lg border border-white/20 bg-[#38291F] px-3 py-3 text-white outline-none transition focus:border-[#c6a53a]"              />
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="h-4 w-4 accent-[#c6a53a]"
              />
              Block the entire day
            </label>

            {!allDay && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={blockedStart}
                    onChange={(e) => setBlockedStart(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/20 bg-[#38291F] px-3 py-3 text-white outline-none transition focus:border-[#c6a53a]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={blockedEnd}
                    onChange={(e) => setBlockedEnd(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/20 bg-[#38291F] px-3 py-3 text-white outline-none transition focus:border-[#c6a53a]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Reason (optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Vacation, personal appointment"
                className="w-full rounded-lg border border-white/20 bg-[#38291F] px-3 py-3 text-white outline-none transition focus:border-[#c6a53a]"
              />
              <p className="mt-2 text-xs text-gray-500">
                This reason is only visible to you in the admin dashboard.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{
                background: `linear-gradient(
                  115deg,
                  #6e5a17 0%,
                  #a8872a 20%,
                  #c6a53a 40%,
                  #f2e3a2 50%,
                  #c6a53a 60%,
                  #a8872a 80%,
                  #6e5a17 100%
                )`,
              }}
            >
              {saving ? "Saving..." : "Block Date"}
            </button>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-xl font-semibold text-white">
            Blocked Dates
          </h2>

          {blockedTimes.length === 0 ? (
            <p className="rounded-xl border border-white/20 p-6 text-gray-400">
              No dates or times blocked.
            </p>
          ) : (
            <div className="space-y-4">
              {blockedTimes.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/20 bg-white/5 p-5"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {formatDate(item.blocked_date)}
                    </p>

                    <p className="mt-1 text-sm text-white">
                      {item.start_time && item.end_time
                        ? `${item.start_time.slice(0, 5)} – ${item.end_time.slice(0, 5)}`
                        : "Entire day"}
                    </p>

                    {item.reason && (
                      <p className="mt-1 text-sm text-gray-400">
                        {item.reason}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteBlockedTime(item.id)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}