import styles from "../styles/Navbar.module.css";
import ToggleSwitch from "./ToggleSwitch";

export default function LoadingAnimation() {
  return (
    <div className={styles.navbar}>
      <h1 className={styles.title}>Terralics</h1>
      <ToggleSwitch />
    </div>
  );
}
