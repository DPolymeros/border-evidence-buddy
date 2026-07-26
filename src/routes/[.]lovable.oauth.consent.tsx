import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authOauth = () => (supabase.auth as any).oauth as {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

type Search = { authorization_id: string; next?: string };

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Search => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } as never });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await authOauth().getAuthorizationDetails(id);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="max-w-md mx-auto mt-12 p-6">
      <h1 className="text-lg font-semibold">Authorization error</h1>
      <p className="text-sm text-muted-foreground mt-2">{String((error as Error)?.message ?? error)}</p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData() as { client?: { name?: string } } | null;
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    setErr(null);
    const oauth = authOauth();
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorization_id)
      : await oauth.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setErr(error.message ?? String(error)); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setErr("No redirect URL returned."); return; }
    window.location.href = target;
  }

  return (
    <main className="max-w-md mx-auto mt-12">
      <div className="bg-card border-2 border-primary">
        <div className="bg-primary text-primary-foreground px-4 py-3">
          <h1 className="font-semibold">Connect {clientName} to BDEA</h1>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm">
            {clientName} will be able to call BDEA's tools while you are signed in — read and write
            your own incident records, and use decision-support and handbook lookups.
          </p>
          <p className="text-xs text-muted-foreground">
            This does not bypass BDEA's per-user data isolation; each caller only sees rows owned
            by your account.
          </p>
          {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
          <div className="flex gap-2">
            <button disabled={busy} onClick={() => decide(true)}
              className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground disabled:opacity-50">
              Approve
            </button>
            <button disabled={busy} onClick={() => decide(false)}
              className="flex-1 px-4 py-2 text-sm border border-border bg-background disabled:opacity-50">
              Deny
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
