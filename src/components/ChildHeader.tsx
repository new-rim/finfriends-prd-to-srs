import Link from "next/link";
import { WISHLIST_SUMMARY } from "@/fixtures/wishlist";

export function ChildHeader({ title }: { title: string }) {
  const { totalStars } = WISHLIST_SUMMARY;
  return (
    <header className="flex justify-between items-center pb-3 border-b mb-4">
      <div className="flex items-center gap-2">
        <Link href="/child/home" className="text-xs text-muted-foreground hover:text-foreground font-semibold bg-muted px-2 py-1 rounded">
          &larr; 아이 홈
        </Link>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-1.5">
        <Link href="/avatar" className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-full border border-emerald-300 hover:bg-emerald-100">
          <span>🎨</span>
          <span>아바타</span>
        </Link>
        <Link href="/wishlist" className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950 px-2 py-1 rounded-full border border-amber-300 hover:bg-amber-100">
          <span>⭐</span>
          <span>{totalStars}개</span>
        </Link>
      </div>
    </header>
  );
}
