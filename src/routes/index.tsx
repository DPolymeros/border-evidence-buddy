import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/lib/lang";
import { FileText, Compass, BookOpen, Archive } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useLang();
  const cards = [
    { to: "/incident", title: t.home.newIncident, desc: t.home.newIncidentDesc, Icon: FileText },
    { to: "/decision", title: t.home.decisionSupport, desc: t.home.decisionSupportDesc, Icon: Compass },
    { to: "/handbook", title: t.home.handbook, desc: t.home.handbookDesc, Icon: BookOpen },
    { to: "/records", title: t.home.records, desc: t.home.recordsDesc, Icon: Archive },
  ];
  return (
    <div>
      <div className="mb-8 border-l-4 border-primary pl-4">
        <h1 className="text-3xl font-bold text-foreground">{t.appName}</h1>
        <p className="text-muted-foreground mt-1">{t.appSubtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(({ to, title, desc, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group block bg-card border border-border p-6 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="bg-primary text-primary-foreground p-3">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">{title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 p-4 bg-secondary border-l-4 border-accent text-sm text-secondary-foreground">
        {t.disclaimer}
      </div>
    </div>
  );
}
