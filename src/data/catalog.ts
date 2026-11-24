export type Market = {
  id: string;
  country: string;
  region: string;
  languages: string[];
  channels: string[];
  availability: string;
  marketNote: string;
  contentRequirements: string;
};

export type Product = {
  pnc: string;
  name: string;
  category: string;
  model: string;
  description: string;
  image: string;
  accent: string;
  features: string[];
  specifications: { label: string; value: string }[];
  documentation: string[];
  markets: Market[];
  verifiedFeatures: string[];
  demoNote: string;
};

const marketProfiles = [
  { id: "it", country: "Italy", region: "Southern Europe", language: "Italian", channels: ["YouTube", "Instagram Reel", "Product page", "Retailer portal"] },
  { id: "de", country: "Germany", region: "Central Europe", language: "German", channels: ["YouTube", "Product page", "Retailer portal"] },
  { id: "uk", country: "United Kingdom", region: "Northern Europe", language: "English", channels: ["YouTube", "Instagram Reel", "Product page"] },
  { id: "hu", country: "Hungary", region: "Central Europe", language: "Hungarian", channels: ["YouTube", "Product page", "Retailer portal"] },
  { id: "fr", country: "France", region: "Western Europe", language: "French", channels: ["YouTube", "Product page", "Retailer portal"] },
  { id: "es", country: "Spain", region: "Southern Europe", language: "Spanish", channels: ["YouTube", "Instagram Reel", "Product page"] },
  { id: "pl", country: "Poland", region: "Central Europe", language: "Polish", channels: ["YouTube", "Product page", "Retailer portal"] },
  { id: "se", country: "Sweden", region: "Northern Europe", language: "Swedish", channels: ["YouTube", "Instagram Reel", "Product page"] },
  { id: "no", country: "Norway", region: "Northern Europe", language: "Norwegian", channels: ["YouTube", "Product page", "Retailer portal"] },
] as const;

const marketReviewNotes: Record<string, string> = {
  it: "Use Italian product naming and review local control-panel terminology.",
  de: "Review local control-panel and programme labels.",
  uk: "Confirm the current UK model variant and terminology.",
  hu: "Use Hungarian product naming and review local control-panel terminology.",
  fr: "Use French product naming and review local terminology.",
  es: "Use Spanish product naming and review local programme labels.",
  pl: "Use Polish product naming and review local control-panel terminology.",
  se: "Use Swedish product naming and review the local model variant.",
  no: "Use Norwegian product naming and confirm the local model variant.",
};

function createDemoMarkets(category: string): Market[] {
  const productDifference: Record<string, string> = {
    "Washing machine": "Programme names and control-panel layouts may vary by market.",
    Refrigerator: "Configuration, dimensions, and included accessories may vary by market.",
    Dishwasher: "Built-in dimensions and connection requirements must be verified against the local installation guide.",
  };
  return marketProfiles.map((profile) => ({
    id: profile.id,
    country: profile.country,
    region: profile.region,
    languages: [profile.language],
    channels: [...profile.channels],
    availability: "Available · Simulated demo data",
    marketNote: `${productDifference[category] ?? "Product details may vary by market"} ${marketReviewNotes[profile.id]}`,
    contentRequirements: `${profile.language} narration and subtitles; verify local product details and approved documentation before publishing.`,
  }));
}

export const products: Product[] = [
  {
    pnc: "914550123",
    name: "PureWash 800 Front Load Washer",
    category: "Washing machine",
    model: "EW8F8412Q",
    description:
      "A connected front-load washing machine designed to make everyday laundry simpler, with steam care and adaptive wash features.",
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=85",
    accent: "#dce9f4",
    features: ["Steam care", "Adaptive wash", "Woolmark-certified cycles", "App connectivity"],
    specifications: [
      { label: "Capacity", value: "10 kg" },
      { label: "Energy rating", value: "A" },
      { label: "Spin speed", value: "1,400 rpm" },
      { label: "Product type", value: "Front load" },
    ],
    documentation: ["User manual · PDF", "Installation guide · PDF", "Product information sheet"],
    markets: createDemoMarkets("Washing machine"),
    verifiedFeatures: ["Steam care", "Adaptive wash", "Woolmark-certified cycles", "App connectivity"],
    demoNote: "All catalogue values are simulated for this prototype and are not verified Electrolux product claims.",
  },
  {
    pnc: "925060789",
    name: "Cooling 700 French Door Refrigerator",
    category: "Refrigerator",
    model: "EFL7FD23X",
    description:
      "A French door refrigerator concept with flexible storage zones and a clean, contemporary finish.",
    image:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1200&q=85",
    accent: "#e5e9ef",
    features: ["Flexible storage zones", "Water dispenser", "Fast-freeze mode", "Door-open alert"],
    specifications: [
      { label: "Total volume", value: "530 L" },
      { label: "Configuration", value: "French door" },
      { label: "Finish", value: "Stainless steel" },
      { label: "Product type", value: "Freestanding" },
    ],
    documentation: ["User manual · PDF", "Product information sheet"],
    markets: createDemoMarkets("Refrigerator"),
    verifiedFeatures: ["Flexible storage zones", "Water dispenser", "Fast-freeze mode", "Door-open alert"],
    demoNote: "All catalogue values are simulated for this prototype and are not verified Electrolux product claims.",
  },
  {
    pnc: "911740456",
    name: "CleanPro 600 Built-in Dishwasher",
    category: "Dishwasher",
    model: "EBC6D14S",
    description:
      "A built-in dishwasher concept with flexible loading and a selection of everyday cleaning programmes.",
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85",
    accent: "#e6e9e3",
    features: ["Flexible baskets", "Quick wash programme", "Delay start", "Machine-care reminder"],
    specifications: [
      { label: "Place settings", value: "14" },
      { label: "Installation", value: "Built-in" },
      { label: "Noise level", value: "44 dB" },
      { label: "Product type", value: "Full size" },
    ],
    documentation: ["User manual · PDF", "Installation guide · PDF", "Product information sheet"],
    markets: createDemoMarkets("Dishwasher"),
    verifiedFeatures: ["Flexible baskets", "Quick wash programme", "Delay start", "Machine-care reminder"],
    demoNote: "All catalogue values are simulated for this prototype and are not verified Electrolux product claims.",
  },
];

export function normalizePnc(value: string): string {
  return value.replace(/\D/g, "");
}

export function getProductByPnc(pnc: string): Product | undefined {
  const normalized = normalizePnc(pnc);
  return products.find((product) => product.pnc === normalized);
}
