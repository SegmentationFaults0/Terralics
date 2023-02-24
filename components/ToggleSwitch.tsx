import styles from "../styles/ToggleSwitch.module.css";
import { ChangeEventHandler } from "react";

const setDark = () => {
  localStorage.setItem("theme", "dark");

  document.documentElement.setAttribute("data-theme", "dark");
};

const setLight = () => {
  localStorage.setItem("theme", "light");
  document.documentElement.setAttribute("data-theme", "light");
};

const toggleTheme: ChangeEventHandler<HTMLInputElement> = (e) => {
  if (e.target.checked) {
    setLight();
  } else {
    setDark();
  }
};

export default function ToggleSwitch() {
  return (
    <label className={styles.toggle}>
      <input
        className={styles.checkbox}
        type="checkbox"
        onChange={toggleTheme}
      />
      <div className={styles.switch}></div>
    </label>
  );
}
