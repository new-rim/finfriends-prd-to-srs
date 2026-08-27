/** ④ 위시리스트 픽스처 — scenario.ts에서 파생 (계획 §15.1) */
import { TOTAL_STARS, WISHLIST_ITEM } from "./scenario";
import type { WishlistSummary } from "@/contracts/wishlist";

export const WISHLIST_SUMMARY: WishlistSummary = {
  totalStars: TOTAL_STARS,
  activeItem: WISHLIST_ITEM,
};
