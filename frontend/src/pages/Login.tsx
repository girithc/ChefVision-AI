import { useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, Loader2, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/Layout";
import { Notice } from "@/components/ui";
import { useApp } from "@/lib/app-context";
import { navigate } from "@/lib/router";

export function Login() {
  const { signIn, authenticating, authError } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await signIn(email.trim(), password)) navigate("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/90 bg-white/80 shadow-[0_30px_100px_-35px_rgba(16,185,129,0.5)] backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-slate-900 p-10 text-white md:flex md:flex-col md:justify-between">
          <Logo className="[&_span]:text-white [&_span:last-child]:text-emerald-300" />
          <div>
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-emerald-300 uppercase">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure restaurant workspace
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight">Inventory clarity starts with every receipt.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">Sign in to review invoice extraction, maintain recipes, plan events, and build a tenant-isolated reorder list.</p>
          </div>
          <p className="text-[11px] text-slate-500">ChefVision AI · MVP workspace</p>
        </section>

        <section className="p-7 sm:p-10">
          <div className="mb-8 md:hidden"><Logo /></div>
          <div className="mb-7">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><LockKeyhole className="h-5 w-5" /></div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">Use your ChefVision account to continue.</p>
          </div>
          {authError && <div className="mb-4"><Notice tone="rose">{authError}</Notice></div>}
          <form className="space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="label">Email</span>
              <input className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input className="input" type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <button type="submit" disabled={authenticating} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60">
              {authenticating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {authenticating ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <a href="#/welcome" className="mt-5 block text-center text-xs font-semibold text-emerald-700 hover:text-emerald-800">Back to product overview</a>
        </section>
      </div>
    </main>
  );
}
