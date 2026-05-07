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
          <p>{t.handbook.isoPhases}</p>
          <ul className="list-disc pl-5 text-muted-foreground">
            <li>Identification</li>
            <li>Collection</li>
            <li>Acquisition</li>
            <li>Preservation</li>
          </ul>
          <p className="text-muted-foreground italic">{t.handbook.placeholder}</p>
        </Section>
        <Section title={t.handbook.acpo}>
          <ol className="list-decimal pl-5 space-y-1">
            <li>No action should change data which may subsequently be relied upon in court.</li>
            <li>A person must be competent to access original data.</li>
            <li>An audit trail of all processes applied to evidence should be created.</li>
            <li>The case officer has overall responsibility for compliance.</li>
          </ol>
          <p className="text-muted-foreground italic">{t.handbook.placeholder}</p>
        </Section>
        <Section title={t.handbook.devices}>
          <p className="text-muted-foreground italic">{t.handbook.placeholder}</p>
        </Section>
        <Section title={t.handbook.glossary}>
          <p className="text-muted-foreground italic">{t.handbook.placeholder}</p>
        </Section>
      </div>
    </div>
  );
}
