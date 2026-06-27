import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/* -------------------- Theme -------------------- */

export type Theme = "light" | "dark";

type ThemeCtx = {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeCtx | null>(null);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem("dc.theme");
  return v === "dark" ? "dark" : "light";
}

function applyThemeClass(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", t === "dark");
  root.style.colorScheme = t;
}

/* -------------------- Locale (EN / Bangla Gen-Z) -------------------- */

export type Locale = "en" | "bn";

type LocaleCtx = {
  locale: Locale;
  toggle: () => void;
  set: (l: Locale) => void;
  t: (key: TKey) => string;
  tList: (key: TListKey) => string[];
};

const LocaleContext = createContext<LocaleCtx | null>(null);

/** Bangla copy is intentionally Gen-Z / colloquial — short, punchy, banglish-vibes. */
const dict = {
  // header
  "nav.browse": { en: "Browse drama", bn: "ড্রামা ঘাঁটো" },
  "nav.open": { en: "Open a case", bn: "কেস খোলো" },
  "nav.tagline": { en: "The Internet's Courtroom", bn: "ইন্টারনেটের কোর্টরুম" },

  // hero
  "hero.badge": { en: "Court is now in session", bn: "কোর্ট এখন বসেছে" },
  "hero.title.a": { en: "Settle the argument", bn: "ঝগড়াটা মিটাও" },
  "hero.title.b": { en: "once and for all.", bn: "একদম শেষবারের মতো।" },
  "hero.sub": {
    en: "The internet's most brutally honest courtroom. Drop your drama, get an AI verdict, share the receipts.",
    bn: "ইন্টারনেটের সবচেয়ে সাভেজ কোর্টরুম। তোমার ড্রামা ফেলো, AI জাজের রায় নাও, screenshot ছাড়ো।",
  },
  "hero.cta.open": { en: "Open a Case", bn: "কেস খোলো" },
  "hero.cta.browse": { en: "Browse Drama", bn: "ড্রামা দেখো" },
  "hero.stat.courts": { en: "Courtrooms", bn: "কোর্ট" },
  "hero.stat.judges": { en: "Judge styles", bn: "জাজ স্টাইল" },
  "hero.stat.petty": { en: "Pettiness", bn: "প্যাঁচ" },

  // feed
  "feed.kicker": { en: "Docket", bn: "আজকের লিস্ট" },
  "feed.title": { en: "Live court feed", bn: "লাইভ কোর্ট ফিড" },
  "feed.viewAll": { en: "View all", bn: "সব দেখো" },
  "feed.empty.title": { en: "The docket is empty. For now.", bn: "এখনো কেউ কেস ফেলেনি।" },
  "feed.empty.body": { en: "Be the first to file a case and break the internet a little.", bn: "তুমিই প্রথম হও, ইন্টারনেট একটু কাঁপাও।" },
  "feed.empty.cta": { en: "Open the first case", bn: "প্রথম কেসটা খোলো" },

  // categories
  "cat.kicker": { en: "Choose your courtroom", bn: "কোর্ট বাছো" },
  "cat.title": { en: "Six courts. Endless drama.", bn: "ছয়টা কোর্ট। শেষ নাই ড্রামা।" },
  "cat.enter": { en: "Enter courtroom", bn: "ঢোকো" },

  // how it works
  "how.kicker": { en: "How it works", bn: "কিভাবে কাজ করে" },
  "how.title": { en: "Three steps to the truth.", bn: "তিন স্টেপে সত্যি।" },
  "how.s1.title": { en: "File the case", bn: "কেস ফাইল করো" },
  "how.s1.body": { en: "Pick a courtroom. Pick a side. Tell us what happened — receipts welcome.", bn: "কোর্ট বাছো, সাইড নাও, ঘটনা বলো — screenshot দিলে আরো ভালো।" },
  "how.s2.title": { en: "AI judge rules", bn: "AI জাজ রায় দেয়" },
  "how.s2.body": { en: "Pick a judge personality. The AI delivers a verdict with red flag, delulu and survival scores.", bn: "জাজের মুড বাছো। AI রেড ফ্ল্যাগ, দেলুলু, সারভাইভাল স্কোর সহ রায় দেবে।" },
  "how.s3.title": { en: "Jury weighs in", bn: "জুরি ভোট দেয়" },
  "how.s3.body": { en: "Share the link. Friends, strangers, exes — the internet decides.", bn: "লিংক ছাড়ো। বন্ধু, আননোন, প্রাক্তন — সবাই ভোট দেবে।" },

  // CTA
  "cta.title": { en: "Got something you can't stop arguing about?", bn: "এমন কিছু আছে যেটা নিয়ে ঝগড়া থামছেই না?" },
  "cta.sub": { en: "Court is in session 24/7. No appointment. No lawyer. Just receipts.", bn: "কোর্ট ২৪/৭ খোলা। অ্যাপয়েন্টমেন্ট লাগবে না, উকিল লাগবে না — শুধু screenshot।" },
  "cta.btn": { en: "Open my case", bn: "আমার কেস খোলো" },

  // footer
  "footer.tag": { en: "AI verdicts on real-life pettiness. Built for the group chat.", bn: "জীবনের প্যাঁচ নিয়ে AI রায়। গ্রুপ চ্যাটের জন্য বানানো।" },
  "footer.courts": { en: "Courtrooms", bn: "কোর্টরুম" },
  "footer.fine": { en: "Fine print", bn: "ছোট অক্ষর" },
  "footer.legal": {
    en: "Verdicts are AI-generated entertainment, not legal advice. Don't outsource your relationship to a language model.",
    bn: "রায়গুলা AI-এর মজা, কোনো লিগ্যাল অ্যাডভাইস না। সম্পর্ক একটা মডেলের হাতে ছেড়ে দিও না।",
  },
  "footer.made": { en: "Made with vibes", bn: "ভাইব দিয়ে বানানো" },

  // toggles
  "toggle.lang.en": { en: "EN", bn: "EN" },
  "toggle.lang.bn": { en: "বাংলা", bn: "বাংলা" },
} satisfies Record<string, { en: string; bn: string }>;

type TKey = keyof typeof dict;

const lists = {
  "marquee.items": {
    en: [
      "He left me on read for 14 hours",
      "My roommate ate my labeled leftovers",
      "She replied 'k' to my paragraph",
      "My friend invited my ex to MY birthday",
      "Group chat is plotting without me",
      "He picked his squad over our date night",
      "My mom liked my ex's IG post",
      "Best friend ghosted after I lent her $400",
    ],
    bn: [
      "১৪ ঘণ্টা সিন করে রাখছে",
      "রুমমেট আমার নাম লেখা খাবার খাইছে",
      "আমার প্যারাগ্রাফের রিপ্লাই 'k'",
      "বন্ধু আমার ex-কে আমার বার্থডেতে ডাকছে",
      "গ্রুপ চ্যাটে আমাকে বাদ দিয়ে প্ল্যান",
      "ডেট নাইট ছেড়ে ও বন্ধুদের সাথে গেছে",
      "মা আমার ex-এর IG পোস্টে লাইক দিছে",
      "৪০০ টাকা ধার দেয়ার পর বেস্ট ফ্রেন্ড ghost",
    ],
  },
} satisfies Record<string, { en: string[]; bn: string[] }>;

type TListKey = keyof typeof lists;

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem("dc.locale");
  return v === "bn" ? "bn" : "en";
}

/* -------------------- Provider -------------------- */

export function AppProviders({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [locale, setLocale] = useState<Locale>("en");

  // Hydrate from storage on mount
  useEffect(() => {
    const t = readStoredTheme();
    const l = readStoredLocale();
    setTheme(t);
    setLocale(l);
    applyThemeClass(t);
    document.documentElement.lang = l === "bn" ? "bn" : "en";
  }, []);

  const setT = useCallback((t: Theme) => {
    setTheme(t);
    applyThemeClass(t);
    try { window.localStorage.setItem("dc.theme", t); } catch {}
  }, []);
  const toggleT = useCallback(() => setT(theme === "dark" ? "light" : "dark"), [theme, setT]);

  const setL = useCallback((l: Locale) => {
    setLocale(l);
    document.documentElement.lang = l === "bn" ? "bn" : "en";
    try { window.localStorage.setItem("dc.locale", l); } catch {}
  }, []);
  const toggleL = useCallback(() => setL(locale === "en" ? "bn" : "en"), [locale, setL]);

  const themeValue = useMemo(() => ({ theme, set: setT, toggle: toggleT }), [theme, setT, toggleT]);

  const localeValue = useMemo<LocaleCtx>(() => ({
    locale,
    set: setL,
    toggle: toggleL,
    t: (k) => dict[k][locale] ?? dict[k].en,
    tList: (k) => lists[k][locale] ?? lists[k].en,
  }), [locale, setL, toggleL]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <LocaleContext.Provider value={localeValue}>
        {children}
      </LocaleContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme outside AppProviders");
  return ctx;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale outside AppProviders");
  return ctx;
}