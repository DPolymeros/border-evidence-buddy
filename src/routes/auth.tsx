import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useLang } from "@/lib/lang";

type AuthSearch = {
  redirect?: string;
  deviceType?: string;
  power?: "yes" | "no" | "unknown";
  encryption?: "yes" | "no" | "unknown";
};

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): AuthSearch => ({
    redirect: s.redirect === "incident" ? "incident" : undefined,
    deviceType: typeof s.deviceType === "string" ? s.deviceType : undefined,
    power: (["yes", "no", "unknown"].includes(s.power as string) ? s.power : undefined) as AuthSearch["power"],
    encryption: (["yes", "no", "unknown"].includes(s.encryption as string) ? s.encryption : undefined) as AuthSearch["encryption"],
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      if (search.redirect === "incident") {
        throw redirect({
          to: "/incident",
          search: { deviceType: search.deviceType, power: search.power, encryption: search.encryption },
        });
      }
      throw redirect({ to: "/records" });
    }
  },
  component: AuthPage,
});

const inputCls =
  "w-full border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary";

function AuthPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const goNext = () => {
    if (search.redirect === "incident") {
      navigate({
        to: "/incident",
        search: { deviceType: search.deviceType, power: search.power, encryption: search.encryption },
      });
    } else {
      navigate({ to: "/records" });
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) goNext();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, search]);

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
        goNext();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        goNext();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErr(null);
    if (search.redirect === "incident") {
      sessionStorage.setItem(
        "bdea_auth_redirect",
        JSON.stringify({ deviceType: search.deviceType, power: search.power, encryption: search.encryption })
      );
    }
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
        <p className="text-xs text-muted-foreground bg-secondary border-l-4 border-accent p-3">{t.auth.whySignIn}</p>
        <button type="button" onClick={google} disabled={busy}
          className="w-full px-4 py-2 text-sm border border-border bg-background hover:border-primary">
          {t.auth.google}
        </button>
        <div className="text-center text-xs text-muted-foreground">{t.auth.or}</div>
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className={`text-xs font-medium tracking-wide ${lang === "el" ? "" : "uppercase"}`}>{t.auth.email}</span>
            <input type="email" required className={inputCls + " mt-1"} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className={`text-xs font-medium tracking-wide ${lang === "el" ? "" : "uppercase"}`}>{t.auth.password}</span>
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
