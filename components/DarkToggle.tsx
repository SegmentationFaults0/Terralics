import styles from "../styles/DarkToggle.module.css";
import { useState, useEffect } from "react";

type Theme = "light" | "dark";

let isFirstRender = true;

export default function DarkToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(storedTheme || (prefersDark ? "dark" : "light"));
  }, []);

  useEffect(() => {
    if (isFirstRender) {
      isFirstRender = false;
    } else {
      localStorage.setItem("theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <div className={styles.toggleContainer}>
      <span className={styles.emoji}>🌒</span>
      <label className={styles.toggle}>
        <input
          className={styles.checkbox}
          type="checkbox"
          checked={theme === "light"}
          onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        <div className={styles.switch}></div>
      </label>
      <span className={styles.emoji}>☀️</span>
    </div>
  );
}
