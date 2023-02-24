import styles from "../styles/ToggleSwitch.module.css";

export default function ToggleSwitch() {
  return (
    <label className={styles.toggle}>
      <input className={styles.checkbox} type="checkbox" />
      <div className={styles.switch}></div>
    </label>
  );
}
