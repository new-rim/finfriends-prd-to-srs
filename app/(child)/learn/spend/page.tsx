import { LearnView } from "./learn-view";

export default async function LearnSpendPage({
  searchParams,
}: {
  searchParams: Promise<{ picked?: string }>;
}) {
  const { picked } = await searchParams;
  return <LearnView initialPicked={picked ?? null} />;
}
