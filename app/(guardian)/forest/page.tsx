import { ForestView } from "./forest-view";

export default async function ForestPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const resolvedParams = await searchParams;
  return <ForestView initialState={resolvedParams?.state} />;
}
