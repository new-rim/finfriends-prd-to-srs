import type { AvatarItem } from "@/contracts/avatar";

export const AVATAR_ITEMS: AvatarItem[] = [
  { id: "head-crown", name: "새싹 왕관", category: "HEAD", priceStars: 3, icon: "👑", isUnlocked: true },
  { id: "head-cap", name: "모험가 모자", category: "HEAD", priceStars: 5, icon: "🧢", isUnlocked: false },
  { id: "eye-glasses", name: "별빛 안경", category: "EYE", priceStars: 5, icon: "👓", isUnlocked: true },
  { id: "eye-[star]", name: "반짝 눈빛", category: "EYE", priceStars: 2, icon: "✨", isUnlocked: true },
  { id: "clothes-tshirt", name: "초록 새싹 티", category: "CLOTHES", priceStars: 4, icon: "👕", isUnlocked: true },
  { id: "clothes-[hero]", name: "영웅 망토", category: "CLOTHES", priceStars: 8, icon: "🦸", isUnlocked: false },
  { id: "sticker-rainbow", name: "무지개 스티커", category: "STICKER", priceStars: 3, icon: "🌈", isUnlocked: true },
  { id: "sticker-clover", name: "행운의 클로버", category: "STICKER", priceStars: 2, icon: "🍀", isUnlocked: true },
];
