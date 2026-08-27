import { TreeView } from "./tree-view";

export default async function TreePage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  return <TreeView initialState={state} />;
}
