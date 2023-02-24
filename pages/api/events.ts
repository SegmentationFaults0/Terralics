import type { NextApiRequest, NextApiResponse } from "next";
import type { Event } from "../../interfaces/index";
import { selectProps } from "../../util/objects";

type Error = {
  error: string;
};

/**
 * @todo: caching the results
 * @todo: add a logging service
 */

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Event[] | Error>
) {
  try {
    const response = await fetch(
      `https://eonet.gsfc.nasa.gov/api/v2.1/events?limit=10&status=open&api_key=${process.env.NASA_API_KEY}`
    );
    const { events: rawEvents } = await response.json();
    const events: Event[] = rawEvents.map(
      selectProps("id", "title", "description", "categories", "geometries")
    );

    res.status(200).json(events);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "oh no!" });
  }
}
