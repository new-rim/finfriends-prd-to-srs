/** ④ 위시리스트 계약 — 계획 §15.1 */
export type WishlistItem = {
  id: string;
  name: string;
  category: string;
  requiredStars: number;
  currentStars: number;
  imageUrl?: string;
  isUnlocked: boolean;
};

export type WishlistSummary = {
  totalStars: number;
  activeItem: WishlistItem;
};
