import type { User } from "../interfaces";
import useSwr from "swr";
import Sphere from "../components/Sphere";
import ExplanationPage from "../components/ExplanationPage";
import Navbar from "../components/Navbar";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Index() {
  const { data, error, isLoading } = useSwr<User[]>("/api/users", fetcher);

  if (error) return <div>Failed to load users</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  return (
    <div>
      <div>
        <Navbar />
        <Sphere />
      </div>
      <ExplanationPage />
    </div>
  );
}
