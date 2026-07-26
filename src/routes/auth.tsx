import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/records" });
  },
  component: AuthPage,
});

const inputCls =
  "w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary";

function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/records" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        navigate({ to: "/records" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/records" });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErr(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) setErr(result.error.message ?? String(result.error));
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="mb-6 border-l-4 border-primary pl-4">
        <h1 className="text-2xl font-bold">{mode === "signin" ? t.auth.signIn : t.auth.signUp}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.auth.subtitle}</p>
      </div>

      <div className="bg-card border border-border p-6 space-y-4">
        <button type="button" onClick={google} disabled={busy}
          className="w-full px-4 py-2 text-sm border border-border bg-background hover:border-primary">
          {t.auth.google}
        </button>
        <div className="text-center text-xs text-muted-foreground">{t.auth.or}</div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide">{t.auth.email}</span>
            <input type="email" required className={inputCls + " mt-1"} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide">{t.auth.password}</span>
            <input type="password" required minLength={6} className={inputCls + " mt-1"} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button type="submit" disabled={busy} className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground disabled:opacity-50">
            {busy ? "…" : mode === "signin" ? t.auth.signIn : t.auth.signUp}
          </button>
        </form>
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-xs text-primary underline">
          {mode === "signin" ? t.auth.toSignUp : t.auth.toSignIn}
        </button>
      </div>
    </div>
  );
}
