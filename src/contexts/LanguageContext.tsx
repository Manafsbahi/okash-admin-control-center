
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define our supported languages
export type Language = "ar" | "en";

// Create a context for our language state
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations for our application
const translations: Record<Language, Record<string, string>> = {
  ar: {
    "app.name": "إدارة أوكاش",
    "app.login": "تسجيل الدخول",
    "app.email": "البريد الإلكتروني",
    "app.password": "كلمة المرور",
    "app.login.button": "تسجيل الدخول",
    "app.login.error": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    "app.dashboard": "لوحة القيادة",
    "app.customers": "العملاء",
    "app.transactions": "المعاملات",
    "app.ads": "الإعلانات",
    "app.cards": "البطاقات",
    "app.exchange": "سعر الصرف",
    "app.admin": "الإدارة",
    "app.total.balance": "إجمالي الأرصدة",
    "app.total.bank.transfers": "إجمالي التحويلات المصرفية",
    "app.total.cash.deposits": "إجمالي الإيداعات النقدية",
    "app.active.customers": "العملاء النشطون",
    "app.current.exchange.rate": "سعر الصرف الحالي",
    "app.recent.transactions": "المعاملات الأخيرة",
    "app.view.all": "عرض الكل",
    "app.search": "بحث",
    "app.date": "التاريخ",
    "app.amount": "المبلغ",
    "app.type": "النوع",
    "app.status": "الحالة",
    "app.no.transactions": "لا توجد معاملات حديثة",
  },
  en: {
    "app.name": "OKash Management",
    "app.login": "Login",
    "app.email": "Email",
    "app.password": "Password",
    "app.login.button": "Login",
    "app.login.error": "Invalid email or password",
    "app.dashboard": "Dashboard",
    "app.customers": "Customers",
    "app.transactions": "Transactions",
    "app.ads": "Ads",
    "app.cards": "Cards",
    "app.exchange": "Exchange",
    "app.admin": "Administration",
    "app.total.balance": "Total Balance",
    "app.total.bank.transfers": "Total Bank Transfers",
    "app.total.cash.deposits": "Total Cash Deposits",
    "app.active.customers": "Active Customers",
    "app.current.exchange.rate": "Current Exchange Rate",
    "app.recent.transactions": "Recent Transactions",
    "app.view.all": "View All",
    "app.search": "Search",
    "app.date": "Date",
    "app.amount": "Amount",
    "app.type": "Type",
    "app.status": "Status",
    "app.no.transactions": "No recent transactions",
  },
};

// Provider component for language context
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get the language from localStorage, default to Arabic
    const savedLanguage = localStorage.getItem("okash-language");
    return (savedLanguage === "ar" || savedLanguage === "en") ? savedLanguage : "ar";
  });

  // Set the language in localStorage when it changes
  useEffect(() => {
    localStorage.setItem("okash-language", language);
    // Set the dir attribute on the html element
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  // Translation function
  const t = (key: string) => {
    return translations[language][key] || key;
  };

  // Set language and update localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  // Check if the current language is RTL
  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
