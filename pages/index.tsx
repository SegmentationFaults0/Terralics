import type { Event } from "../interfaces";
import useSwr from "swr";
import Sphere from "../components/Sphere";
import ExplanationPage from "../components/ExplanationPage";
import Navbar from "../components/Navbar";
import styles from "../styles/Home.module.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Index() {
  const { data, error, isLoading } = useSwr<Event[]>("/api/events", fetcher);

  if (error) return <div>Failed to load event data</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div>
      <div className={styles.loadingScreen}>
        <img src="/globe-logo.png" alt="logo" className={styles.logo} />
      </div>
      <div>
        <Navbar />
        <Sphere />
      </div>
      <ExplanationPage />
    </div>
  );
}
