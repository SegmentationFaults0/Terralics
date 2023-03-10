import styles from "../styles/Navbar.module.css";
import DarkToggle from "./DarkToggle";
import Boxlogo from "../public/logo_text_white_box.svg";
import Image from "next/image";

export default function LoadingAnimation() {
  return (
    <div className={styles.navbar}>
      <Image
        src={Boxlogo}
        alt="terralics logo"
        height={50}
        className={styles.title}
      />
      <DarkToggle />
    </div>
  );
}
