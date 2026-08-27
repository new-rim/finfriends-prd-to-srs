import { RetroView } from "./retro-view";

export default async function RetroPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  return <RetroView initialState={state} />;
}
