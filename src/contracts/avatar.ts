/**
 * 아바타 꾸미기 계약 (Avatar Contract)
 */
export interface AvatarItem {
  id: string;
  name: string;
  category: "HEAD" | "EYE" | "CLOTHES" | "STICKER";
  priceStars: number;
  icon: string;
  isUnlocked: boolean;
}

export interface AvatarState {
  equippedHeadId: string | null;
  equippedEyeId: string | null;
  equippedClothesId: string | null;
  equippedStickerId: string | null;
}
