"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Giriş yapılamadı.");
        return;
      }
      router.refresh();
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090614] px-4 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#100b23] p-7">
        <div className="mb-6 flex items-center gap-3">
          <img src="/DivavisionLogo.png" alt="DivavisionVote" className="h-14 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-black">DivavisionVote</h1>
            <p className="text-xs text-violet-300">ADMIN PANEL</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold">Admin giriş</h2>
        <p className="mt-2 text-sm text-gray-400">Devam etmek için yönetici şifresini gir.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label htmlFor="admin-password" className="block text-sm font-semibold">Yönetici şifresi</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="w-full rounded-xl border border-white/10 bg-[#151027] px-4 py-3 text-white outline-none focus:border-violet-400" />
          {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-violet-600 px-4 py-3 font-bold transition hover:bg-violet-500 disabled:opacity-60">
            {loading ? "Giriş yapılıyor..." : "Giriş yap"}
          </button>
        </form>
      </section>
    </main>
  );
}
