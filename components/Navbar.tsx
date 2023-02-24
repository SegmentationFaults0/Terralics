import styles from "../styles/Navbar.module.css";
import ToggleSwitch from "./ToggleSwitch";

export default function LoadingAnimation() {
  return (
    <div className={styles.navbar}>
      <object data="/logo_text_white_box.svg" className={styles.title}></object>
      <ToggleSwitch />
    </div>
  );
}
