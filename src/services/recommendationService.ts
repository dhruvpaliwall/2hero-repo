import type { Market, Product } from "../data/catalog";
import { videoCategories, type Channel, type Recommendation, type VideoCategory } from "./types";

const categoryForProduct: Record<string, VideoCategory[]> = {
  "Washing machine": [
    "How to Use",
    "Product Features and Benefits",
    "Cleaning and Maintenance",
    "Installation Guide",
    "Frequently Asked Questions",
    "Social Media / Instagram Reels",
    "Product Promotional Videos",
    "Unboxing and First-Time Setup",
    "Repair and Troubleshooting",
    "Product Comparison",
  ],
  Refrigerator: [
    "How to Use",
    "Product Features and Benefits",
    "Cleaning and Maintenance",
    "Installation Guide",
    "Frequently Asked Questions",
    "Product Promotional Videos",
    "Social Media / Instagram Reels",
    "Unboxing and First-Time Setup",
    "Repair and Troubleshooting",
    "Product Comparison",
  ],
  Dishwasher: [
    "Installation Guide",
    "How to Use",
    "Cleaning and Maintenance",
    "Product Features and Benefits",
    "Frequently Asked Questions",
    "Unboxing and First-Time Setup",
    "Social Media / Instagram Reels",
    "Product Promotional Videos",
    "Repair and Troubleshooting",
    "Product Comparison",
  ],
};

const marketOpeners: Record<string, string> = {
  it: "Use Italian narration and locally reviewed product terminology.",
  de: "Use German narration and locally reviewed control-panel terminology.",
  uk: "Use UK English and confirm local programme naming.",
  fr: "Use French narration and locally approved product naming.",
  hu: "Use Hungarian narration and locally reviewed product terminology.",
  es: "Use Spanish narration and locally reviewed programme naming.",
  pl: "Use Polish narration and locally reviewed product terminology.",
  se: "Use Swedish narration and locally reviewed product naming.",
  no: "Use Norwegian narration and locally reviewed product naming.",
};

export function generateRecommendations(product: Product, markets: Market[]): Recommendation[] {
  const categories = categoryForProduct[product.category] ?? videoCategories;
  return markets.flatMap((market) =>
    categories.map((category, index) => {
      const needsVerification = ["Installation Guide", "Repair and Troubleshooting"].includes(category);
      const feature = product.verifiedFeatures[index % product.verifiedFeatures.length];
      const channel: Channel = category === "Social Media / Instagram Reels"
        ? "Instagram Reel"
        : index % 2 === 0 ? "YouTube" : "Product page";
      const isFeatureVideo = category === "Product Features and Benefits";
      const isHowTo = category === "How to Use";
      const priority = index < 2 ? "High" : index < 5 ? "Medium" : "Explore";
      return {
        id: `${market.id}-${index}`,
        title: isHowTo
          ? `${product.category} essentials · ${market.country}`
          : isFeatureVideo
            ? `A closer look at ${feature} · ${market.country}`
            : `${category} · ${market.country}`,
        category,
        audience: category === "Repair and Troubleshooting" ? "Technician" : "Customer",
        problem: isHowTo
          ? "Help customers feel confident getting started with their product."
          : isFeatureVideo
            ? `Customers may not know how ${feature.toLowerCase()} can fit into everyday use.`
            : needsVerification
              ? "Customers need clear, market-specific guidance grounded in approved documentation."
              : `Answer a common ${product.category.toLowerCase()} question with clear, helpful content.`,
        objective: isHowTo ? "Build product confidence and reduce setup questions." :
          category === "Social Media / Instagram Reels" ? "Earn attention with a concise, mobile-first product story." :
            needsVerification ? "Direct customers to accurate, approved guidance." : `Increase engagement with ${product.category.toLowerCase()} content.`,
        duration: channel === "Instagram Reel" ? "30 sec" : "60–90 sec",
        market,
        language: market.languages[0],
        channel,
        priority,
        reason: isFeatureVideo
          ? `Recommended because “${feature}” is listed in this demo product record. ${marketOpeners[market.id] ?? ""}`
          : `${marketOpeners[market.id] ?? ""} Tailored for ${market.country} and ${market.languages.join(" / ")}.`,
        ...(needsVerification
          ? { verification: "Human review required: use the approved local manual. No repair or installation steps are generated from missing data." }
          : {}),
      };
    }),
  );
}
