import styles from "../styles/ToggleSwitch.module.css";
import { ChangeEventHandler } from "react";

const toggleTheme: ChangeEventHandler<HTMLInputElement> = (e) => {
  const targetTheme = e.target.checked ? "light" : "dark";
  localStorage.setItem("theme", targetTheme);
  document.documentElement.setAttribute("data-theme", targetTheme);
};

export default function ToggleSwitch() {
  return (
    <div className={styles.toggleContainer}>
      <span className={styles.emoji}>🌒</span>
      <label className={styles.toggle}>
        <input
          className={styles.checkbox}
          type="checkbox"
          onChange={toggleTheme}
        />
        <div className={styles.switch}></div>
      </label>
      <span className={styles.emoji}>☀️</span>
    </div>
  );
}
