"use client";
import { createContext, useContext, useState, useEffect } from "react";

export interface AppTheme {
  name: string;
  colors: { 
    background: string ,
    text: string ,
    border: string ,
    primary: string ,
    card: string ,
    dropdownBackground: string ,
    disabledBackground: string ,
    disabledText: string ,
    textBackground: string ,
    headerBackground: string ,
    optionBackground: string ,
  };
}

const lightTheme: AppTheme = {
  name: "روشن",
  colors: {
    headerBackground: "#90A4AE",
    background: "#CFD8DC",
    dropdownBackground: "#fff",
    text: "#fff",
    border: "rgb(64, 64, 78)",
    primary: "#90A4AE",
    disabledBackground: "#f0f0f0",
    disabledText: "#999",
    textBackground: "#ffffffff",
    optionBackground: "#d5d5d5ff",
    card: "#455A64",
  },
};

const darkTheme: AppTheme = {
  name: "تاریک",
  colors: {
    headerBackground: "#011f4b",
    background: "#0e1f47cc",
    textBackground: "rgba(13,26,58,0.8)",
    dropdownBackground: "rgba(14, 31, 71, 1)",
    text: "#fff",
    border: "#a7f2ffff",
    primary: "#007bff",
    disabledBackground: "#292424",
    disabledText: "#666",
    card: "#6497b1",
    optionBackground: "rgba(28, 48, 96, 0.9)",
  },
};

const ThemeContext = createContext<{
  theme: AppTheme;
  toggleTheme: () => void;
}>({ theme: lightTheme, toggleTheme: () => {} });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  // مقدار اولیه را از localStorage یا ترجیح سیستم بخوان
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      // اگر ذخیره نشده، از سیستم پیروی کن
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const theme = isDark ? darkTheme : lightTheme;

  // اعمال متغیرهای CSS
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-background", theme.colors.background);
    root.style.setProperty("--color-text", theme.colors.text);
    root.style.setProperty("--color-border", theme.colors.border);
    root.style.setProperty("--color-primary", theme.colors.primary);
    root.style.setProperty("--color-card", theme.colors.card);
    root.style.setProperty(
      "--color-textBackground",
      theme.colors.textBackground,
    );
    root.style.setProperty(
      "--color-dropdownBackground",
      theme.colors.dropdownBackground,
    );
    root.style.setProperty(
      "--color-optionBackground",
      theme.colors.optionBackground,
    );
    root.style.setProperty(
      "--color-disabledBackground",
      theme.colors.disabledBackground,
    );
    root.style.setProperty("--color-disabledText", theme.colors.disabledText);
    root.style.setProperty(
      "--color-headerBackground",
      theme.colors.headerBackground,
    );
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
