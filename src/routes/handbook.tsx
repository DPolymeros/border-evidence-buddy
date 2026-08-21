import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/handbook")({
  component: HandbookPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <h2 className="bg-secondary px-4 py-2 font-semibold text-secondary-foreground border-b border-border">{title}</h2>
      <div className="p-4 text-sm space-y-2">{children}</div>
    </section>
  );
}

function HandbookPage() {
  const { t } = useLang();
  return (
    <div>
      <div className="mb-6 border-l-4 border-primary pl-4">
        <h1 className="text-2xl font-bold">{t.handbook.title}</h1>
      </div>
      <div className="grid gap-4">
        <Section title={t.handbook.iso}>
          <p>{t.handbook.isoBody}</p>
        </Section>
        <Section title={t.handbook.acpo}>
          <ol className="list-decimal pl-5 space-y-1">
            {t.handbook.acpoList.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </Section>
        <Section title={t.handbook.devices}>
          <div className="space-y-4">
            {Object.entries(t.deviceTypes).map(([key, label]) => (
              <div key={key}>
                <h3 className="font-semibold">{label}</h3>
                <p className="text-muted-foreground">
                  {t.handbook.deviceGuides[key as keyof typeof t.handbook.deviceGuides]}
                </p>
              </div>
            ))}
          </div>
        </Section>
        <Section title={t.handbook.glossary}>
          <dl className="space-y-2">
            {t.handbook.glossaryList.map((g, i) => (
              <div key={i}>
                <dt className="font-semibold">{g.term}</dt>
                <dd className="text-muted-foreground">{g.def}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </div>
  );
}
