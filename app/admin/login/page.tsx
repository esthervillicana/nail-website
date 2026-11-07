
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .maybeSingle();

    if (adminError || !admin) {
      await supabase.auth.signOut();
      setError("This account does not have administrator access.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-black/70 p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-semibold text-white">
          Admin Login
        </h1>

        <p className="mb-8 text-center text-sm text-gray-400">
          Sign in to manage your appointments.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#c6a53a]"            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#c6a53a]"            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
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
            }}          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
