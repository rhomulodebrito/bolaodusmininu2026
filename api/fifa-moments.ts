import { fetchFifaMoments } from "../server/fifaMoments";

export default async function handler(_req: any, res: any) {
  res.status(200).json({ moments: await fetchFifaMoments() });
}
