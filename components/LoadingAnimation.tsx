import styles from "../styles/LoadingAnimation.module.css";
import GlobeLogo from "../public/globe-logo.svg";
import Image from "next/image";

export default function LoadingAnimation() {
  return (
    <div className={styles.loadingBackground}>
      <Image
        src={GlobeLogo}
        alt="lobe logo"
        height={175}
        width={175}
        className={styles.logo}
      />
    </div>
  );
}
