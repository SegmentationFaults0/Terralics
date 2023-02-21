import styles from "../styles/LoadingAnimation.module.css";

export default function LoadingAnimation() {
  return (
    <div className={styles.lds_ripple}>
      <div></div>
      <div></div>
    </div>
  );
}
