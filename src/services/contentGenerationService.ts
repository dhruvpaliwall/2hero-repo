import type { Product } from "../data/catalog";
import type { GeneratedVideo, Scene, VideoConfig } from "./types";

const bynderVideoByCategory: Record<string, { videoUrl: string; sourceUrl: string }> = {
  "Washing machine": {
    videoUrl: "/videos/2408168YGI-mov.mp4",
    sourceUrl: "https://electrolux.bynder.com/asset/9fb0c6fc-1a4b-448a-be5b-647e328cd8ac/Online_Desk_MP4_HDReady/2408168YGI-mov.mp4",
  },
  Refrigerator: {
    videoUrl: "/videos/2023929592-mov.mp4",
    sourceUrl: "https://electrolux.bynder.com/asset/16e8ab4a-e43f-4e4f-b0ec-acf5197ad16d/Online_Desk_MP4_HDReady/2023929592-mov.mp4",
  },
  Dishwasher: {
    videoUrl: "/videos/2022823144-mov.mp4",
    sourceUrl: "https://electrolux.bynder.com/asset/ae083562-d12c-4071-a2e2-94a18de5b8ae/Online_Desk_MP4_HDReady/2022823144-mov.mp4",
  },
};

type LocalizedContent = {
  introduction: (productName: string, feature: string) => string;
  usage: (feature: string) => string;
  safety: string;
  marketVariation: string;
  manual: string;
  technician: string;
  callToAction: string;
  title: (category: string, productCategory: string) => string;
};

const localizedContent: Record<string, LocalizedContent> = {
  English: {
    introduction: (name, feature) => `Meet ${name}. In this quick guide, we’ll explore ${feature}.`,
    usage: (feature) => `See how ${feature} can support your everyday routine.`,
    safety: "This overview does not provide procedures; follow the approved local product manual.",
    marketVariation: "Guidance can vary by model; please refer to the local product manual.",
    manual: "For full details, check the local user manual for your product.",
    technician: "For technical details, refer to the approved local service documentation.",
    callToAction: "Explore your user manual",
    title: (category, productCategory) => `${category}: ${productCategory} quick guide`,
  },
  German: {
    introduction: (name, feature) => `Lernen Sie ${name} kennen. Wir zeigen Ihnen heute ${feature}.`,
    usage: (feature) => `Entdecken Sie, wie ${feature} den Alltag unterstützen kann.`,
    safety: "Diese Übersicht enthält keine Arbeitsschritte. Bitte beachten Sie die freigegebene lokale Anleitung.",
    marketVariation: "Die Hinweise können je nach Modell abweichen. Bitte beachten Sie die lokale Anleitung.",
    manual: "Alle Details finden Sie in der lokalen Bedienungsanleitung Ihres Produkts.",
    technician: "Technische Informationen finden Sie in der freigegebenen lokalen Servicedokumentation.",
    callToAction: "Bedienungsanleitung ansehen",
    title: (_category, productCategory) => `${productCategory}: einfach erklärt`,
  },
  French: {
    introduction: (name, feature) => `Découvrez ${name}. Aujourd'hui, nous vous présentons ${feature}.`,
    usage: (feature) => `Découvrez comment ${feature} peut vous accompagner au quotidien.`,
    safety: "Cet aperçu ne fournit pas de procédure. Consultez le manuel local approuvé.",
    marketVariation: "Les consignes peuvent varier selon le modèle. Consultez le manuel local.",
    manual: "Consultez le manuel d'utilisation local pour connaître tous les détails.",
    technician: "Pour les informations techniques, consultez la documentation de service locale approuvée.",
    callToAction: "Voir le manuel d'utilisation",
    title: (_category, productCategory) => `${productCategory} : le guide essentiel`,
  },
  Italian: {
    introduction: (name, feature) => `Scopri ${name}. Oggi vediamo ${feature}.`,
    usage: (feature) => `Scopri come ${feature} può aiutarti nella vita quotidiana.`,
    safety: "Questa panoramica non fornisce istruzioni operative. Consulta il manuale locale approvato.",
    marketVariation: "Le indicazioni possono variare in base al modello. Consulta il manuale locale.",
    manual: "Per tutti i dettagli, consulta il manuale d'uso locale del prodotto.",
    technician: "Per i dettagli tecnici, consulta la documentazione di assistenza locale approvata.",
    callToAction: "Consulta il manuale d'uso",
    title: (_category, productCategory) => `${productCategory}: guida rapida`,
  },
  Hungarian: {
    introduction: (name, feature) => `Ismerje meg a(z) ${name} készüléket. Ma a(z) ${feature} funkciót mutatjuk be.`,
    usage: (feature) => `Fedezze fel, hogyan segítheti a mindennapokban a(z) ${feature}.`,
    safety: "Ez az áttekintés nem tartalmaz munkafolyamatokat. Kérjük, kövesse a jóváhagyott helyi útmutatót.",
    marketVariation: "Az útmutatás modellenként eltérhet. Kérjük, tekintse meg a helyi útmutatót.",
    manual: "A részletekért tekintse meg a termék helyi használati útmutatóját.",
    technician: "Műszaki információkért tekintse meg a jóváhagyott helyi szervizdokumentációt.",
    callToAction: "Használati útmutató megtekintése",
    title: (_category, productCategory) => `Termékbemutató: ${productCategory}`,
  },
  Spanish: {
    introduction: (name, feature) => `Descubre ${name}. Hoy te mostramos ${feature}.`,
    usage: (feature) => `Descubre cómo ${feature} puede ayudarte en tu día a día.`,
    safety: "Este resumen no incluye procedimientos. Consulta el manual local aprobado.",
    marketVariation: "Las indicaciones pueden variar según el modelo. Consulta el manual local.",
    manual: "Consulta el manual de usuario local para obtener todos los detalles.",
    technician: "Para información técnica, consulta la documentación de servicio local aprobada.",
    callToAction: "Consulta el manual de usuario",
    title: (_category, productCategory) => `${productCategory}: guía rápida`,
  },
  Polish: {
    introduction: (name, feature) => `Poznaj ${name}. Dziś pokażemy Ci ${feature}.`,
    usage: (feature) => `Zobacz, jak ${feature} może ułatwić codzienne czynności.`,
    safety: "Ten materiał nie zawiera procedur. Skorzystaj z zatwierdzonej lokalnej instrukcji.",
    marketVariation: "Wskazówki mogą się różnić w zależności od modelu. Sprawdź lokalną instrukcję.",
    manual: "Szczegóły znajdziesz w lokalnej instrukcji obsługi produktu.",
    technician: "Informacje techniczne znajdziesz w zatwierdzonej lokalnej dokumentacji serwisowej.",
    callToAction: "Zobacz instrukcję obsługi",
    title: (_category, productCategory) => `${productCategory}: krótki przewodnik`,
  },
  Swedish: {
    introduction: (name, feature) => `Upptäck ${name}. I dag visar vi ${feature}.`,
    usage: (feature) => `Se hur ${feature} kan hjälpa dig i vardagen.`,
    safety: "Den här översikten innehåller inga arbetsmoment. Följ den godkända lokala manualen.",
    marketVariation: "Anvisningarna kan variera mellan modeller. Läs den lokala manualen.",
    manual: "Läs produktens lokala användarmanual för fullständig information.",
    technician: "Teknisk information finns i den godkända lokala servicedokumentationen.",
    callToAction: "Läs användarmanualen",
    title: (_category, productCategory) => `${productCategory}: en snabbguide`,
  },
  Norwegian: {
    introduction: (name, feature) => `Bli kjent med ${name}. I dag ser vi nærmere på ${feature}.`,
    usage: (feature) => `Se hvordan ${feature} kan være nyttig i hverdagen.`,
    safety: "Denne oversikten inneholder ingen fremgangsmåter. Følg den godkjente lokale håndboken.",
    marketVariation: "Veiledningen kan variere etter modell. Se den lokale håndboken.",
    manual: "Se produktets lokale brukerhåndbok for fullstendig informasjon.",
    technician: "Teknisk informasjon finnes i den godkjente lokale servicedokumentasjonen.",
    callToAction: "Se brukerhåndboken",
    title: (_category, productCategory) => `${productCategory}: en kort guide`,
  },
};

function narrationFor(product: Product, feature: string, config: VideoConfig): string[] {
  const locale = localizedContent[config.language] ?? localizedContent.English;
  const isGuidance = ["Installation Guide", "Repair and Troubleshooting", "Cleaning and Maintenance"].includes(config.category);
  return [
    locale.introduction(product.name, feature),
    isGuidance ? locale.safety : locale.usage(feature),
    locale.marketVariation,
    config.audience === "Technician" ? locale.technician : locale.manual,
  ];
}

export function generateVideo(product: Product, config: VideoConfig): GeneratedVideo {
  const media = bynderVideoByCategory[product.category];
  if (!media) throw new Error(`No Bynder video is configured for ${product.category}.`);
  const feature = product.verifiedFeatures[0] ?? product.category;
  const lines = narrationFor(product, feature, config);
  const instagram = config.channel === "Instagram Reel";
  const safeDuration = Math.max(15, config.duration);
  const durations = [0.2, 0.3, 0.3, 0.2].map((share) => Math.round(safeDuration * share));
  durations[durations.length - 1] += safeDuration - durations.reduce((sum, duration) => sum + duration, 0);
  const scenes: Scene[] = [
    {
      number: 1,
      duration: durations[0],
      visual: "Open on the product in a bright, uncluttered home setting. Introduce the product with a gentle camera push-in.",
      narration: lines[0],
      overlay: product.name,
      transition: "Soft cut",
      asset: "Approved product hero image or short product clip",
    },
    {
      number: 2,
      duration: durations[1],
      visual: `Show a close-up of the product and a simple graphic callout for ${feature}. Avoid showing unverified controls or steps.`,
      narration: lines[1],
      overlay: feature,
      transition: "Match cut",
      asset: "Verified product detail image; feature visual pending local approval",
    },
    {
      number: 3,
      duration: durations[2],
      visual: "Show a customer using the product in an everyday setting. Keep the shot illustrative rather than instructional.",
      narration: lines[2],
      overlay: config.market.country,
      transition: "Dissolve",
      asset: "Market-approved lifestyle clip or image",
    },
    {
      number: 4,
      duration: durations[3],
      visual: "End on the product hero shot with a readable call to action and space for localized brand end-card.",
      narration: lines[3],
      overlay: (localizedContent[config.language] ?? localizedContent.English).callToAction,
      transition: "Fade out",
      asset: "Approved end-card and local user-manual link",
    },
  ];
  const locale = localizedContent[config.language] ?? localizedContent.English;
  return {
    title: locale.title(config.category, product.category),
    description: `${config.duration}-second ${config.format} ${config.channel} storyboard for ${config.market.country}, narrated in ${config.language}. Audience: ${config.audience}; tone: ${config.tone}; voiceover: ${config.voiceover}. ${config.subtitles ? "Localized subtitles included." : "Subtitles not requested."} The preview plays the existing Bynder source clip; it does not trim or render a new video.`,
    videoUrl: media.videoUrl,
    sourceUrl: media.sourceUrl,
    narration: lines.join("\n\n"),
    scenes: scenes.map((scene) => ({
      ...scene,
      visual: instagram ? `${scene.visual} Compose for a vertical ${config.format} frame.` : scene.visual,
    })),
    music: "Light, modern instrumental bed · low intensity under narration",
    callToAction: scenes[3].overlay,
  };
}
