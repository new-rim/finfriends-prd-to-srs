import Link from "next/link";
import { PENDING_APPROVALS } from "@/fixtures/scenario";

export function GuardianHeader({ title }: { title: string }) {
  return (
    <header className="flex justify-between items-center pb-3 border-b mb-4">
      <div className="flex items-center gap-2">
        <Link href="/guardian/home" className="text-xs text-emerald-800 dark:text-emerald-200 font-semibold bg-emerald-100 dark:bg-emerald-950 px-2 py-1 rounded border border-emerald-300">
          &larr; 부모 홈
        </Link>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
      <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-1 rounded border border-emerald-300">
        승인대기 {PENDING_APPROVALS}건
      </span>
    </header>
  );
}
