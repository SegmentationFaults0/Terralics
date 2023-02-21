import type { Event } from "../interfaces";
import useSwr from "swr";
import Cube from "../components/Cube";
import styles from "../styles/Home.module.css";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Index() {
  const { data, error, isLoading } = useSwr<Event[]>("/api/events", fetcher);

  if (error) return <div>Failed to load users</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Terralics</h1>
      <Cube />
    </div>
  );
}
