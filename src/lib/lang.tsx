import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, type Lang, type Translations } from "./translations";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Translations };
const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("el");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("bdea_lang") : null;
    if (saved === "en" || saved === "el") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("bdea_lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
