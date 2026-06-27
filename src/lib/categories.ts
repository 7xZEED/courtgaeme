import {
  Heart,
  Flame,
  Users,
  Handshake,
  MessageSquare,
  Gamepad2,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "bf_gf"
  | "situationship"
  | "friend"
  | "ex_to_ex"
  | "group_chat"
  | "gaming";

export type Category = {
  id: CategoryId;
  slug: string;
  label: string;
  short: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind utility class against custom color token */
  accentClass: string;
  /** raw oklch for inline styles / gradient mixing */
  accentVar: string;
  badge: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "bf_gf",
    slug: "bf-gf",
    label: "BF / GF Court",
    short: "Relationship",
    tagline: "He said. She said. We decide.",
    description: "Couple fights, jealousy, the eternal text-back debate.",
    icon: Heart,
    accentClass: "text-cat-bf-gf",
    accentVar: "var(--cat-bf-gf)",
    badge: "💔",
  },
  {
    id: "situationship",
    slug: "situationship",
    label: "Situationship Court",
    short: "Situationship",
    tagline: "What ARE you two, exactly?",
    description: "Undefined, chaotic, mutually delulu.",
    icon: Flame,
    accentClass: "text-cat-situationship",
    accentVar: "var(--cat-situationship)",
    badge: "🔥",
  },
  {
    id: "friend",
    slug: "friend",
    label: "Friend Court",
    short: "Friend",
    tagline: "Best friend or worst person?",
    description: "Betrayals, plus-one drama, who-paid-for-what.",
    icon: Users,
    accentClass: "text-cat-friend",
    accentVar: "var(--cat-friend)",
    badge: "👯",
  },
  {
    id: "ex_to_ex",
    slug: "ex-to-ex",
    label: "Ex to Ex Court",
    short: "Ex to Ex",
    tagline: "Both sides of the story. One verdict.",
    description: "Two people, one case. Share the link, let them speak.",
    icon: Handshake,
    accentClass: "text-cat-family",
    accentVar: "var(--cat-family)",
    badge: "💬",
  },
  {
    id: "group_chat",
    slug: "group-chat",
    label: "Group Chat Court",
    short: "Group Chat",
    tagline: "Screenshots will be entered as evidence.",
    description: "Subtweets, side chats, the dreaded left-on-read.",
    icon: MessageSquare,
    accentClass: "text-cat-group-chat",
    accentVar: "var(--cat-group-chat)",
    badge: "💬",
  },
  {
    id: "gaming",
    slug: "gaming",
    label: "Gaming Court",
    short: "Gaming",
    tagline: "Throw the round. Catch the verdict.",
    description: "Squad wipes, kill steals, mic etiquette violations.",
    icon: Gamepad2,
    accentClass: "text-cat-gaming",
    accentVar: "var(--cat-gaming)",
    badge: "🎮",
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<string, Category>;

export type JudgePersonality = "brutal" | "genz" | "wise" | "chaotic";

export const JUDGES: { id: JudgePersonality; label: string; tagline: string; emoji: string }[] = [
  { id: "brutal", label: "The Brutally Honest Judge", tagline: "No sugar. No mercy. Just receipts.", emoji: "🔪" },
  { id: "genz", label: "The Gen-Z Judge", tagline: "It's giving guilty, bestie.", emoji: "💅" },
  { id: "wise", label: "The Wise Judge", tagline: "Both can be true. One is more true.", emoji: "🧘" },
  { id: "chaotic", label: "The Chaotic Judge", tagline: "Vibes-based ruling. Buckle up.", emoji: "🃏" },
];

export const JUDGE_BY_ID = Object.fromEntries(JUDGES.map((j) => [j.id, j])) as Record<
  JudgePersonality,
  (typeof JUDGES)[number]
>;