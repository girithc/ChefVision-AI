import { useState, type FormEvent } from "react";
import { LogIn } from "lucide-react";

import { Logo } from "@/components/Layout";
import { Button, Card, Notice } from "@/components/ui";
import * as api from "@/lib/api";
import { useApp } from "@/lib/app-context";
import { navigate } from "@/lib/router";

// Demo accounts seeded by server/sql/001_init.sql
const DEMO_ACCOUNTS = [
  { email: "owner@chefvision.test", role: "owner" as const },
  { email: "admin@chefvision.test", role: "admin" as const },
];
const DEMO_RESTAURANT_ID = "11111111-1111-1111-1111-111111111111";

export function Login() {
  const { signIn } = useApp();
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState("secret");
  const [error, setError] = useState<string | null>(null);
  const [offlineOffer, setOfflineOffer] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setOfflineOffer(false);
    try {
      const result = await api.login(email, password);
      signIn({ token: result.token, role: result.role, restaurantId: result.restaurantId, email });
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof api.ApiError) {
        setError(err.message);
        // Vite's proxy answers 5xx when the backend is down
        setOfflineOffer(err.status >= 500);
      } else {
        setError("Could not reach the ChefVision API.");
        setOfflineOffer(true);
      }
    } finally {
      setBusy(false);
    }
  }

  function continueOffline() {
    const demo = DEMO_ACCOUNTS.find((account) => account.email === email) ?? DEMO_ACCOUNTS[0];
    signIn({ token: null, role: demo.role, restaurantId: DEMO_RESTAURANT_ID, email: demo.email });
    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Logo className="mb-8" />
      <Card className="w-full max-w-sm p-6">
        <h1 className="font-display text-xl font-bold text-slate-900">Sign in</h1>
        <p className="mb-5 text-sm text-slate-500">Access your restaurant workspace.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <Notice tone="rose">{error}</Notice>}
          <Button type="submit" icon={LogIn} className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          {offlineOffer && (
            <Button variant="secondary" className="w-full" onClick={continueOffline}>
              Continue in offline demo mode
            </Button>
          )}
        </form>
        <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <div className="mb-1 font-semibold">Demo accounts (password: secret)</div>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => setEmail(account.email)}
              className="block font-mono text-brand-700 hover:underline"
            >
              {account.email} <span className="text-slate-400">({account.role})</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
