import type { Event } from "../interfaces";
import useSwr from "swr";
import Sphere from "../components/Sphere";
import ExplanationPage from "../components/ExplanationPage";
import Navbar from "../components/Navbar";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Index() {
  const { data, error, isLoading } = useSwr<Event[]>("/api/events", fetcher);

  if (error) return <div>Failed to load event data</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div>
      <div>
        <Sphere />
      </div>
      <ExplanationPage />
    </div>
  );
}
