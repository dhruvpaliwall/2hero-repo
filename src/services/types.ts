import type { Market } from "../data/catalog";

export const videoCategories = [
  "How to Use",
  "Installation Guide",
  "Repair and Troubleshooting",
  "Cleaning and Maintenance",
  "Product Features and Benefits",
  "Social Media / Instagram Reels",
  "Product Promotional Videos",
  "Frequently Asked Questions",
  "Product Comparison",
  "Unboxing and First-Time Setup",
] as const;

export type VideoCategory = (typeof videoCategories)[number];
export type Audience = "Customer" | "Technician" | "Retailer" | "Internal Team";
export type Tone = "Professional" | "Educational" | "Promotional" | "Friendly";
export type Channel = "YouTube" | "Instagram Reel" | "Product page" | "Retailer portal";
export type Format = "16:9" | "9:16" | "1:1";

export type Recommendation = {
  id: string;
  title: string;
  category: VideoCategory;
  audience: Audience;
  problem: string;
  objective: string;
  duration: string;
  market: Market;
  language: string;
  channel: Channel;
  priority: "High" | "Medium" | "Explore";
  reason: string;
  verification?: string;
};

export type VideoConfig = {
  category: VideoCategory;
  market: Market;
  language: string;
  duration: number;
  format: Format;
  audience: Audience;
  tone: Tone;
  voiceover: "Male" | "Female" | "No Voiceover";
  subtitles: boolean;
  channel: Channel;
};

export type Scene = {
  number: number;
  duration: number;
  visual: string;
  narration: string;
  overlay: string;
  transition: string;
  asset: string;
};

export type GeneratedVideo = {
  title: string;
  description: string;
  videoUrl: string;
  sourceUrl: string;
  narration: string;
  scenes: Scene[];
  music: string;
  callToAction: string;
};
