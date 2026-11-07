"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

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
      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading || !authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Checking administrator access...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-400">
              Manage your nail business.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:border-[#c6a53a] hover:bg-white/10 focus:border-[#c6a53a] active:border-[#c6a53a]"
          >
            Log Out
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <a
            href="/admin/appointments"
            className="rounded-xl border border-white/20 bg-white/5 p-6 transition hover:border-[#c6a53a] hover:bg-white/10 focus:border-[#c6a53a] active:border-[#c6a53a]"
          >
            <h2 className="text-xl font-semibold text-white">
              Appointments
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Review and manage appointment requests.
            </p>
            <p className="mt-5 text-sm text-white">
              Manage Appointments →
            </p>
          </a>

          <a
            href="/admin/availability"
            className="rounded-xl border border-white/20 bg-white/5 p-6 transition hover:border-[#c6a53a] hover:bg-white/10 focus:border-[#c6a53a] active:border-[#c6a53a]"
          >
            <h2 className="text-xl font-semibold text-white">
              Availability
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Set your working hours and block unavailable dates.
            </p>
            <p className="mt-5 text-sm text-white">
              Manage Availability →
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}