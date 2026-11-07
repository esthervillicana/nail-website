
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Appointment = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_id: string;
  service_price: number;
  duration_minutes: number;
  nail_length: string;
  nail_style: string;
  comments: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "approved" | "declined" | "cancelled";
  inspiration_photos: string[];
  created_at: string;
  services: {
    name: string;
  } | null;
};

type PhotoLink = {
  path: string;
  url: string;
};

const statuses = ["pending", "approved", "declined", "cancelled"] as const;

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminAppointmentsPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [photoLinks, setPhotoLinks] = useState<Record<string, PhotoLink[]>>({});
  const [activeStatus, setActiveStatus] =
    useState<(typeof statuses)[number]>("pending");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data: admin, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !admin) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setAuthorized(true);
      await loadAppointments();
    }

    checkAdmin();
  }, [router]);

  async function loadAppointments() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        service_id,
        service_price,
        duration_minutes,
        nail_length,
        nail_style,
        comments,
        appointment_date,
        start_time,
        end_time,
        status,
        inspiration_photos,
        created_at,
        services ( name )
      `)
      .order("appointment_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      setError(error.message);
      setAppointments([]);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as Appointment[];
    setAppointments(rows);

    const links: Record<string, PhotoLink[]> = {};

    for (const appointment of rows) {
      const paths = appointment.inspiration_photos ?? [];

      const results = await Promise.all(
        paths.map(async (path) => {
          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("appointment-inspiration")
              .createSignedUrl(path, 3600);

          if (signedError || !signedData) return null;

          return {
            path,
            url: signedData.signedUrl,
          };
        })
      );

      links[appointment.id] = results.filter(
        (item): item is PhotoLink => item !== null
      );
    }

    setPhotoLinks(links);
    setLoading(false);
  }


async function updateStatus(
  appointmentId: string,
  newStatus: Appointment["status"]
) {
  const confirmed = window.confirm(
    `Are you sure you want to ${newStatus} this appointment?`
  );

  if (!confirmed) return;

  setUpdatingId(appointmentId);
  setError("");

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: newStatus })
    .eq("id", appointmentId);

  if (updateError) {
    setError(updateError.message);
    setUpdatingId("");
    return;
  }

  // Send an email after a successful approval or decline.
    if (
    newStatus === "approved" ||
    newStatus === "declined" ||
    newStatus === "cancelled"
    ) { 
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError("Appointment updated, but no email could be sent because your session expired.");
    } else {
        const emailResponse = await fetch("/api/send-appointment-email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ appointmentId }),
        });

        if (!emailResponse.ok) {
        const result = await emailResponse.json();
        setError(
            `Appointment updated, but email notification failed: ${result.error}`
        );
      }
    }
  }

  await loadAppointments();
  setUpdatingId("");
}

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  const filteredAppointments = appointments.filter(
    (appointment) => appointment.status === activeStatus
  );

  const counts = {
    pending: appointments.filter((a) => a.status === "pending").length,
    approved: appointments.filter((a) => a.status === "approved").length,
    declined: appointments.filter((a) => a.status === "declined").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  if (loading && !authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Checking administrator access...</p>
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#edbcf0]">
              Appointments
            </h1>
            <p className="mt-2 text-gray-400">
              Review and manage customer requests.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              Log Out
            </button>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`rounded-xl border p-4 text-left transition ${
                activeStatus === status
                  ? "border-[#edbcf0] bg-[#edbcf0]/10"
                  : "border-white/15 bg-white/5 hover:bg-white/10"
              }`}
            >
              <p className="text-sm capitalize text-gray-400">{status}</p>
              <p className="mt-1 text-2xl font-semibold">
                {counts[status]}
              </p>
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-5 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold capitalize">
            {activeStatus} Appointments
          </h2>

          <button
            onClick={loadAppointments}
            disabled={loading}
            className="text-sm text-[#edbcf0] transition hover:underline disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-400">
            Loading appointments...
          </p>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-xl border border-white/15 bg-white/5 p-10 text-center">
            <p className="text-gray-300">
              No {activeStatus} appointments yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="rounded-2xl border border-white/15 bg-white/5 p-6"
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {appointment.customer_name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {appointment.customer_email}
                    </p>
                    {appointment.customer_phone && (
                      <p className="mt-1 text-sm text-gray-400">
                        {appointment.customer_phone}
                      </p>
                    )}
                  </div>

                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs capitalize text-[#edbcf0]">
                    {appointment.status}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Service
                    </p>
                    <p className="mt-1 font-medium">
                      {appointment.services?.name ?? appointment.service_id}
                    </p>
                    <p className="text-sm text-gray-400">
                      ${Number(appointment.service_price).toFixed(2)} ·{" "}
                      {appointment.duration_minutes} minutes
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Requested appointment
                    </p>
                    <p className="mt-1 font-medium">
                      {formatDate(appointment.appointment_date)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatTime(appointment.start_time)} –{" "}
                      {formatTime(appointment.end_time)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Nail details
                    </p>
                    <p className="mt-1">
                      {appointment.nail_length} ·{" "}
                      {appointment.nail_style === "full-color"
                        ? "Full Color"
                        : "Custom Design"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Request submitted
                    </p>
                    <p className="mt-1 text-sm">
                      {new Date(appointment.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {appointment.comments && (
                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      Customer comments
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-300">
                      {appointment.comments}
                    </p>
                  </div>
                )}

                {(photoLinks[appointment.id]?.length ?? 0) > 0 && (
                  <div className="mt-5">
                    <p className="mb-3 text-xs uppercase tracking-wider text-gray-500">
                      Inspiration photos
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {photoLinks[appointment.id].map((photo) => (
                        <a
                          key={photo.path}
                          href={photo.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={photo.url}
                            alt="Customer inspiration"
                            className="h-24 w-24 rounded-lg border border-white/15 object-cover transition hover:opacity-80"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {appointment.status === "pending" && (
                  <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                    <button
                      onClick={() =>
                        updateStatus(appointment.id, "approved")
                      }
                      disabled={updatingId === appointment.id}
                      className="rounded-lg border border-[#64d2f1]/50 bg-[#64d2f1]/10 px-5 py-2 text-sm text-[#64d2f1] transition hover:bg-[#64d2f1]/20 disabled:opacity-50"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(appointment.id, "declined")
                      }
                      disabled={updatingId === appointment.id}
                      className="rounded-lg border border-red-400/40 bg-red-400/10 px-5 py-2 text-sm text-red-400 transition hover:bg-red-400/20 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {appointment.status === "approved" && (
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <button
                      onClick={() =>
                        updateStatus(appointment.id, "cancelled")
                      }
                      disabled={updatingId === appointment.id}
                      className="rounded-lg border border-red-400/40 px-5 py-2 text-sm text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}

                {updatingId === appointment.id && (
                  <p className="mt-3 text-sm text-gray-400">
                    Updating appointment...
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

