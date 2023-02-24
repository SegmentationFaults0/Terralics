type Geometry = {
  date: string;
  type: "Point" | "Polygon";
  coordinates: [number, number];
};

type Category = {
  id: number;
  title: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  categories: Category[];
  geometries: Geometry[];
};
