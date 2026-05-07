import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LangProvider, useLang } from "@/lib/lang";

function Header() {
  const { lang, setLang, t } = useLang();
  const location = useLocation();
  const link = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`px-3 py-2 text-sm font-medium transition-colors ${
          active ? "text-primary border-b-2 border-primary" : "text-foreground/70 hover:text-foreground"
        }`}
      >
        {label}
      </Link>
    );
  };
  return (
    <header className="bg-primary text-primary-foreground border-b-4 border-accent">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-primary-foreground text-primary font-bold px-2 py-1 text-sm tracking-wider">
            {t.acronym}
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">{t.appName}</div>
            <div className="text-xs text-primary-foreground/70">{t.appSubtitle}</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-sm font-medium">
            {t.prototypeBadge}
          </span>
          <div className="flex border border-primary-foreground/30">
            <button
              onClick={() => setLang("el")}
              className={`px-2 py-1 text-xs font-semibold ${lang === "el" ? "bg-primary-foreground text-primary" : "text-primary-foreground"}`}
            >
              EL
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1 text-xs font-semibold ${lang === "en" ? "bg-primary-foreground text-primary" : "text-primary-foreground"}`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto">
          {link("/", t.nav.home)}
          {link("/incident", t.nav.newIncident)}
          {link("/decision", t.nav.decisionSupport)}
          {link("/handbook", t.nav.handbook)}
          {link("/records", t.nav.records)}
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border bg-secondary mt-12">
      <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-muted-foreground text-center">
        {t.footer}
      </div>
    </footer>
  );
}

export function AppShell() {
  return (
    <LangProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          <Outlet />
        </main>
        <Footer />
      </div>
    </LangProvider>
  );
}
