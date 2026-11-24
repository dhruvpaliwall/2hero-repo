import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clapperboard,
  Clock3,
  FileText,
  Film,
  Globe2,
  LayoutDashboard,
  ListFilter,
  Menu,
  MessageSquareText,
  Play,
  Plus,
  RotateCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Subtitles,
  X,
} from "lucide-react";
import type { Market, Product } from "./data/catalog";
import { fetchDemoProducts, fetchMarkets, fetchProduct } from "./services/catalogueApi";
import { generateVideo } from "./services/contentGenerationService";
import { generateRecommendations } from "./services/recommendationService";
import {
  type Audience,
  type Channel,
  type Format,
  type GeneratedVideo,
  type Recommendation,
  type Tone,
  type VideoCategory,
  videoCategories,
} from "./services/types";

type Screen = "Overview" | "Product discovery" | "Markets & opportunities" | "Video studio" | "My projects";
type ProjectStatus = "Pending review" | "Approved";
type Project = {
  id: string;
  product: Product;
  market: Market;
  language: string;
  category: VideoCategory;
  createdAt: string;
  status: ProjectStatus;
  video: GeneratedVideo;
};

const navigation: { name: Screen; icon: typeof LayoutDashboard }[] = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Product discovery", icon: Search },
  { name: "Markets & opportunities", icon: Globe2 },
  { name: "Video studio", icon: Clapperboard },
  { name: "My projects", icon: Film },
];

const channelOptions: Channel[] = ["YouTube", "Instagram Reel", "Product page", "Retailer portal"];
const audienceOptions: Audience[] = ["Customer", "Technician", "Retailer", "Internal Team"];
const toneOptions: Tone[] = ["Professional", "Educational", "Promotional", "Friendly"];
const formatOptions: Format[] = ["16:9", "9:16", "1:1"];
const demoPnc = "914550123";

function App() {
  const [screen, setScreen] = useState<Screen>("Overview");
  const [product, setProduct] = useState<Product | null>(null);
  const [exploredProducts, setExploredProducts] = useState<string[]>([]);
  const [pnc, setPnc] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [activeMarketId, setActiveMarketId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [selectedRecommendationId, setSelectedRecommendationId] = useState("");
  const [category, setCategory] = useState<VideoCategory>("How to Use");
  const [language, setLanguage] = useState("English");
  const [duration, setDuration] = useState(30);
  const [format, setFormat] = useState<Format>("9:16");
  const [audience, setAudience] = useState<Audience>("Customer");
  const [tone, setTone] = useState<Tone>("Educational");
  const [voiceover, setVoiceover] = useState<"Male" | "Female" | "No Voiceover">("Female");
  const [subtitles, setSubtitles] = useState(true);
  const [channel, setChannel] = useState<Channel>("Instagram Reel");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedVideo | null>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeMarket = product?.markets.find((market) => market.id === activeMarketId) ?? product?.markets[0];
  const recommendations = useMemo(
    () => product
      ? generateRecommendations(product, product.markets.filter((market) => selectedMarkets.includes(market.id)))
      : [],
    [product, selectedMarkets],
  );
  const filteredRecommendations = categoryFilter === "All categories"
    ? recommendations
    : recommendations.filter((recommendation) => recommendation.category === categoryFilter);
  const selectedRecommendation = recommendations.find((item) => item.id === selectedRecommendationId);
  const awaitingApproval = projects.filter((project) => project.status === "Pending review").length;
  const marketCount = product?.markets.length ?? 9;

  async function searchProduct(value = pnc, requestedCategory = "", requestedMarket = "") {
    setSearching(true);
    setSearchError("");
    setProduct(null);
    setGenerated(null);
    try {
      const result = await fetchProduct(value);
      const marketData = await fetchMarkets(result.pnc);
      const loadedProduct = { ...result, markets: marketData };
      if (requestedCategory && loadedProduct.category !== requestedCategory) {
        setSearchError(`The PNC matches ${loadedProduct.category}, not ${requestedCategory}.`);
        return;
      }
      if (requestedMarket && !loadedProduct.markets.some((market) => market.id === requestedMarket)) {
        setSearchError(`This product is not listed for ${requestedMarket.toUpperCase()} in the demo catalogue.`);
        return;
      }
      setProduct(loadedProduct);
      setExploredProducts((current) => current.includes(result.pnc) ? current : [...current, result.pnc]);
      setPnc(result.pnc);
      const initialMarkets = requestedMarket
        ? [requestedMarket]
        : loadedProduct.markets.length > 1
          ? loadedProduct.markets.slice(0, 2).map((market) => market.id)
          : loadedProduct.markets.map((market) => market.id);
      setSelectedMarkets(initialMarkets);
      setActiveMarketId(initialMarkets[0] ?? loadedProduct.markets[0]?.id ?? "");
      setLanguage(loadedProduct.markets.find((market) => market.id === initialMarkets[0])?.languages[0] ?? "English");
      setSelectedRecommendationId(`${initialMarkets[0]}-0`);
      setScreen("Product discovery");
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Product catalogue request failed.");
    } finally {
      setSearching(false);
    }
  }

  function toggleMarket(marketId: string) {
    setSelectedMarkets((current) => {
      if (current.includes(marketId)) {
        const next = current.filter((id) => id !== marketId);
        if (activeMarketId === marketId && next[0]) setActiveMarketId(next[0]);
        return next;
      }
      return [...current, marketId];
    });
  }

  function chooseRecommendation(recommendation: Recommendation) {
    setSelectedRecommendationId(recommendation.id);
    setActiveMarketId(recommendation.market.id);
    setCategory(recommendation.category);
    setLanguage(recommendation.language);
    setChannel(recommendation.channel);
    setDuration(recommendation.channel === "Instagram Reel" ? 30 : 60);
    setFormat(recommendation.channel === "Instagram Reel" ? "9:16" : "16:9");
    setScreen("Video studio");
  }

  function updateProjectVideo(updated: GeneratedVideo) {
    setGenerated(updated);
    setProjects((current) => current.map((project) =>
      project.video === generated ? { ...project, video: updated } : project,
    ));
  }

  async function createVideo() {
    if (!product || !activeMarket) return;
    setGenerating(true);
    setGenerated(null);
    setActiveScene(0);
    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 7000));
      const result = generateVideo(product, {
        category,
        market: activeMarket,
        language,
        duration,
        format,
        audience,
        tone,
        voiceover,
        subtitles,
        channel,
      });
      const project: Project = {
        id: `${Date.now()}`,
        product,
        market: activeMarket,
        language,
        category,
        createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        status: "Pending review",
        video: result,
      };
      setGenerated(result);
      setProjects((current) => [project, ...current]);
    } finally {
      setGenerating(false);
    }
  }

  function saveNarration(value: string) {
    if (!generated) return;
    updateProjectVideo({ ...generated, narration: value });
  }

  function regenerateScene(index: number) {
    if (!generated) return;
    const scene = generated.scenes[index];
    const alternatives = [
      "Use a wider shot to establish the home setting, then gently reveal the product.",
      "Use a close detail with a simple, legible callout. Keep the product controls true to the approved image.",
      "Show a warm, authentic everyday moment without implying undocumented product capabilities.",
    ];
    const updatedScenes = generated.scenes.map((item, itemIndex) => itemIndex === index
      ? { ...item, visual: alternatives[(scene.number + index) % alternatives.length] }
      : item);
    updateProjectVideo({ ...generated, scenes: updatedScenes });
  }

  function setProjectStatus(id: string, status: ProjectStatus) {
    setProjects((current) => current.map((project) => project.id === id ? { ...project, status } : project));
  }

  function downloadText(filename: string, content: string, mime = "text/plain") {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportSubtitles() {
    if (!generated) return;
    const subtitlesText = generated.scenes.map((scene, index) => {
      const start = generated.scenes.slice(0, index).reduce((sum, item) => sum + item.duration, 0);
      const end = start + scene.duration;
      const time = (seconds: number) => {
        const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
        const remaining = String(seconds % 60).padStart(2, "0");
        return `${hours}:${minutes}:${remaining},000`;
      };
      return `${index + 1}\n${time(start)} --> ${time(end)}\n${scene.narration}`;
    }).join("\n\n");
    downloadText(`${generated.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.srt`, subtitlesText);
  }

  const productIsLoaded = Boolean(product);

  return (
    <div className="app-shell">
      {mobileMenuOpen && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-branding"><img className="brand-logo" src="/elux-group-logo.jpg" alt="Electrolux Group" /><span className="brand-product">VIDEO STUDIO</span></div>
          <button className="mobile-close icon-button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}><X size={18} /></button>
        </div>
        <div className="workspace-switch"><img className="workspace-logo" src="/elux-group-logo.jpg" alt="" /><span><b>Electrolux Group</b><small>Content workspace</small></span><ChevronDown size={15} /></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav">
          {navigation.map(({ name, icon: Icon }) => (
            <button key={name} className={`nav-item ${screen === name ? "nav-item-active" : ""}`} onClick={() => { setScreen(name); setMobileMenuOpen(false); }}>
              <Icon size={18} strokeWidth={1.8} /><span>{name}</span>
              {name === "My projects" && projects.length > 0 && <span className="nav-count">{projects.length}</span>}
              {name === "Markets & opportunities" && productIsLoaded && <span className="nav-count">1</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help"><div className="help-icon"><CircleHelp size={17} /></div><div><b>Need a hand?</b><span>Visit the studio guide</span></div><ArrowUpRight size={14} /></div>
          <div className="profile"><div className="avatar">AM</div><div className="profile-info"><b>Alex Morgan</b><span>Content strategist</span></div><Settings2 size={17} /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><b>{screen}</b></div>
          <div className="topbar-actions"><span className="demo-pill"><span /> DEMO ENVIRONMENT</span><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><div className="top-avatar">AM</div></div>
        </header>
        {screen === "Overview" && <Dashboard projects={projects} exploredCount={exploredProducts.length} awaitingApproval={awaitingApproval} marketCount={marketCount} onNavigate={setScreen} onSearch={searchProduct} searching={searching} />}
        {screen === "Product discovery" && (
          <ProductDiscovery
            product={product}
            pnc={pnc}
            searching={searching}
            searchError={searchError}
            onPncChange={setPnc}
            onSearch={searchProduct}
            onSelectMarket={(id) => { setActiveMarketId(id); setSelectedMarkets((current) => current.includes(id) ? current : [...current, id]); }}
            onNavigate={setScreen}
          />
        )}
        {screen === "Markets & opportunities" && (
          <Opportunities
            product={product}
            selectedMarkets={selectedMarkets}
            activeMarketId={activeMarketId}
            categoryFilter={categoryFilter}
            recommendations={filteredRecommendations}
            onToggleMarket={toggleMarket}
            onSetActiveMarket={setActiveMarketId}
            onSetCategoryFilter={setCategoryFilter}
            onChooseRecommendation={chooseRecommendation}
            onNavigate={setScreen}
          />
        )}
        {screen === "Video studio" && (
          <VideoStudio
            product={product}
            markets={product?.markets ?? []}
            activeMarket={activeMarket}
            selectedRecommendation={selectedRecommendation}
            category={category}
            language={language}
            duration={duration}
            format={format}
            audience={audience}
            tone={tone}
            voiceover={voiceover}
            subtitles={subtitles}
            channel={channel}
            generated={generated}
            generating={generating}
            activeScene={activeScene}
            onSetCategory={setCategory}
            onSetMarket={(market) => { setActiveMarketId(market.id); if (!market.languages.includes(language)) setLanguage(market.languages[0]); }}
            onSetLanguage={setLanguage}
            onSetDuration={setDuration}
            onSetFormat={setFormat}
            onSetAudience={setAudience}
            onSetTone={setTone}
            onSetVoiceover={setVoiceover}
            onSetSubtitles={setSubtitles}
            onSetChannel={setChannel}
            onGenerate={createVideo}
            onSetActiveScene={setActiveScene}
            onRegenerateScene={regenerateScene}
            onSaveNarration={saveNarration}
            onExportScript={() => generated && downloadText("video-script.txt", `${generated.title}\n\n${generated.narration}`)}
            onExportSubtitles={exportSubtitles}
            onNavigate={setScreen}
          />
        )}
        {screen === "My projects" && <Projects projects={projects} onSetStatus={setProjectStatus} onNavigate={setScreen} />}
      </main>
    </div>
  );
}

function Dashboard({
  projects,
  exploredCount,
  awaitingApproval,
  marketCount,
  onNavigate,
  onSearch,
  searching,
}: {
  projects: Project[];
  exploredCount: number;
  awaitingApproval: number;
  marketCount: number;
  onNavigate: (screen: Screen) => void;
  onSearch: (pnc: string) => void;
  searching: boolean;
}) {
  const categories = [
    { name: "How to Use", count: "Most selected", color: "blue" },
    { name: "Product Features", count: "High engagement", color: "violet" },
    { name: "Installation Guide", count: "Growing", color: "green" },
    { name: "Instagram Reels", count: "Trending", color: "orange" },
  ];
  return (
    <div className="page dashboard-page">
      <div className="page-heading heading-with-action">
        <div><div className="eyebrow"><span className="live-dot" /> CONTENT INTELLIGENCE PLATFORM</div><h1>Good morning, Alex <span className="wave">✳</span></h1><p>Turn product knowledge into content that works in every market.</p></div>
        <button className="button button-primary" onClick={() => onNavigate("Product discovery")}><Plus size={17} /> Create a video</button>
      </div>
      <section className="hero-card">
        <div className="hero-content">
          <div className="hero-kicker"><Sparkles size={14} /> YOUR AI CONTENT WORKSPACE</div>
          <h2>One product.<br /><span>Multiple markets.</span></h2>
          <p>Unlimited video possibilities. Discover product opportunities and create localized videos for every customer, market and moment.</p>
          <button className="button button-white" disabled={searching} onClick={() => onSearch(demoPnc)}>Explore a product <ArrowRight size={16} /></button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-product-card"><img src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=700&q=80" alt="" /><span className="hero-image-label">PUREWASH 800</span></div>
          <div className="hero-float float-market"><Globe2 size={15} /> <span>4 markets</span></div>
          <div className="hero-float float-ai"><Sparkles size={15} /> <span>AI opportunities</span></div>
        </div>
      </section>
      <section className="metric-grid">
        <MetricCard label="Products explored" value={exploredCount ? String(exploredCount).padStart(2, "0") : "—"} change={exploredCount ? "In this session" : "Start with a PNC"} icon={Search} color="blue" />
        <MetricCard label="Videos generated" value={String(projects.length).padStart(2, "0")} change={projects.length ? `${projects.length} video variation${projects.length === 1 ? "" : "s"}` : "Ready to create"} icon={Clapperboard} color="violet" />
        <MetricCard label="Markets supported" value={String(marketCount).padStart(2, "0")} change="Across the demo catalogue" icon={Globe2} color="green" />
        <MetricCard label="Awaiting approval" value={String(awaitingApproval).padStart(2, "0")} change={awaitingApproval ? "Review required" : "You're all caught up"} icon={Clock3} color="orange" />
      </section>
      <section className="dashboard-lower">
        <div className="panel recent-panel">
          <div className="panel-heading"><div><h3>Recent video projects</h3><p>Your latest creative work</p></div><button className="text-button" onClick={() => onNavigate("My projects")}>View all <ArrowRight size={15} /></button></div>
          {projects.length === 0 ? (
            <div className="empty-projects"><div className="empty-icon"><Film size={20} /></div><div><b>Your next great video starts with a product</b><p>Search a PNC to discover market-specific video ideas.</p></div><button className="button button-outline button-small" onClick={() => onNavigate("Product discovery")}>Find a product <ArrowRight size={14} /></button></div>
          ) : projects.slice(0, 3).map((project) => <ProjectRow key={project.id} project={project} />)}
        </div>
        <div className="panel categories-panel">
          <div className="panel-heading"><div><h3>Popular categories</h3><p>Content opportunities to explore</p></div><button className="icon-button subtle" onClick={() => onNavigate("Markets & opportunities")} aria-label="Explore categories"><ArrowRight size={16} /></button></div>
          <div className="category-list">{categories.map((item, index) => <button className="popular-category" key={item.name} onClick={() => onNavigate("Markets & opportunities")}><span className={`category-icon ${item.color}`}><span>{["01", "02", "03", "04"][index]}</span></span><span className="category-copy"><b>{item.name}</b><small>{item.count}</small></span><ArrowUpRight size={15} /></button>)}</div>
        </div>
      </section>
      <div className="bottom-note"><ShieldCheck size={15} /> All product facts are marked for demo or human verification before publishing.</div>
    </div>
  );
}

function MetricCard({ label, value, change, icon: Icon, color }: { label: string; value: string; change: string; icon: typeof Search; color: string }) {
  return <div className="metric-card"><div className={`metric-icon ${color}`}><Icon size={18} /></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-change">{change}</div></div>;
}

function ProductDiscovery({
  product,
  pnc,
  searching,
  searchError,
  onPncChange,
  onSearch,
  onSelectMarket,
  onNavigate,
}: {
  product: Product | null;
  pnc: string;
  searching: boolean;
  searchError: string;
  onPncChange: (value: string) => void;
  onSearch: (pnc: string, category?: string, market?: string) => void;
  onSelectMarket: (id: string) => void;
  onNavigate: (screen: Screen) => void;
}) {
  const [searchCategory, setSearchCategory] = useState("");
  const [searchMarket, setSearchMarket] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  useEffect(() => {
    let active = true;
    fetchDemoProducts()
      .then((items) => {
        if (active) setCatalogProducts(items);
      })
      .catch((error: unknown) => {
        if (active) setCatalogError(error instanceof Error ? error.message : "Could not load the demo catalogue.");
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => { active = false; };
  }, []);
  const browseCategories = ["Washing machine", "Refrigerator", "Dishwasher"];
  const visibleProducts = catalogProducts.filter((item) => !searchCategory || item.category === searchCategory);
  return (
    <div className="page">
      <PageTitle eyebrow="PRODUCT CATALOGUE" title="Product discovery" description="Start with a product. Find the stories worth telling." />
      <div className="search-panel panel">
        <div className="search-prompt"><span className="search-prompt-icon"><Search size={19} /></span><div><b>Find a product by PNC</b><p>Search the demo product catalogue to see verified-in-demo product details and available markets.</p></div></div>
        <form className="pnc-form" onSubmit={(event) => { event.preventDefault(); onSearch(pnc, searchCategory, searchMarket); }}>
          <label htmlFor="pnc-search">PRODUCT NUMBER CODE (PNC)</label>
          <div className="pnc-input-row"><div className="input-wrap"><Search size={17} /><input id="pnc-search" value={pnc} onChange={(event) => onPncChange(event.target.value)} placeholder="e.g. 914 550 123" /><span className="input-hint">Try 914 550 123</span></div><button className="button button-primary" type="submit" disabled={searching || !pnc.trim()}>{searching ? <><span className="button-spinner" /> Searching</> : <>Find product <ArrowRight size={16} /></>}</button></div>
          <div className="search-filters"><label>OPTIONAL CATEGORY<select value={searchCategory} onChange={(event) => setSearchCategory(event.target.value)}><option value="">All categories</option><option>Washing machine</option><option>Refrigerator</option><option>Dishwasher</option></select></label><label>OPTIONAL TARGET MARKET<select value={searchMarket} onChange={(event) => setSearchMarket(event.target.value)}><option value="">All markets</option><option value="it">Italy</option><option value="de">Germany</option><option value="uk">United Kingdom</option><option value="hu">Hungary</option><option value="fr">France</option><option value="es">Spain</option><option value="pl">Poland</option><option value="se">Sweden</option><option value="no">Norway</option></select></label></div>
          {searchError && <div className="inline-error"><X size={15} /> {searchError}</div>}
        </form>
        <div className="demo-products"><span>DEMO PNCs</span>{[["914 550 123", "Washer"], ["925 060 789", "Refrigerator"], ["911 740 456", "Dishwasher"]].map(([number, name]) => <button key={number} onClick={() => { onPncChange(number); onSearch(number); }} disabled={searching}><b>{number}</b><span>{name}</span></button>)}</div>
      </div>
      <section className="category-browser panel">
        <div className="category-browser-heading"><div><span className="eyebrow">EXPLORE THE CATALOGUE</span><h3>Browse products by category</h3><p>Choose a product to see its details and available markets.</p></div><span className="catalogue-count">{visibleProducts.length} demo product{visibleProducts.length === 1 ? "" : "s"}</span></div>
        <div className="category-browser-filters"><button className={!searchCategory ? "category-filter-active" : ""} aria-pressed={!searchCategory} onClick={() => setSearchCategory("")}>All products <span>{catalogProducts.length}</span></button>{browseCategories.map((item) => <button key={item} className={searchCategory === item ? "category-filter-active" : ""} aria-pressed={searchCategory === item} onClick={() => setSearchCategory(item)}>{item}<span>{catalogProducts.filter((product) => product.category === item).length}</span></button>)}</div>
        {catalogLoading && <div className="catalogue-message"><span className="button-spinner" /> Loading demo products…</div>}
        {!catalogLoading && catalogError && <div className="inline-error"><X size={15} /> {catalogError}</div>}
        {!catalogLoading && !catalogError && visibleProducts.length === 0 && <div className="catalogue-message">No demo products are available in this category.</div>}
        {!catalogLoading && !catalogError && visibleProducts.length > 0 && <div className="browse-product-grid">{visibleProducts.map((item) => <article className="browse-product-card" key={item.pnc}>
          <div className="browse-product-image"><img src={item.image} alt={item.name} /><span>{item.category}</span></div>
          <div className="browse-product-content"><span className="browse-product-pnc">PNC {item.pnc}</span><h4>{item.name}</h4><p>{item.markets.length} simulated European markets</p><button className="button button-outline button-small" disabled={searching} onClick={() => { onPncChange(item.pnc); onSearch(item.pnc); }}>View product <ArrowRight size={14} /></button></div>
        </article>)}</div>}
      </section>
      {!product && <div className="product-placeholder panel"><div className="placeholder-art"><div className="placeholder-circle"><Search size={27} /></div><span className="placeholder-line line-wide" /><span className="placeholder-line" /><span className="placeholder-line line-short" /></div><div><span className="placeholder-tag">YOUR PRODUCT, UNDERSTOOD</span><h3>Product knowledge, ready for its close-up.</h3><p>Enter a PNC or choose one of the sample products above to explore product details and supported markets.</p></div><div className="placeholder-steps"><span><i>01</i> Identify a product</span><span><i>02</i> Discover its markets</span><span><i>03</i> Find its next story</span></div></div>}
      {product && <ProductDetails product={product} onSelectMarket={onSelectMarket} onNavigate={onNavigate} />}
    </div>
  );
}

function ProductDetails({ product, onSelectMarket, onNavigate }: { product: Product; onSelectMarket: (id: string) => void; onNavigate: (screen: Screen) => void }) {
  return (
    <div className="product-result">
      <div className="result-banner"><div className="result-banner-copy"><span className="status-dot" /> PRODUCT MATCH FOUND <span className="data-demo-label">SIMULATED CATALOGUE DATA</span></div><span className="result-pnc">PNC&nbsp; {product.pnc}</span></div>
      <div className="product-main-card panel">
        <div className="product-photo"><img src={product.image} alt={product.name} /><span className="photo-tag">DEMO PRODUCT IMAGE</span></div>
        <div className="product-overview">
          <div className="product-type-label">{product.category.toUpperCase()} <span /> MODEL {product.model}</div>
          <h2>{product.name}</h2><p>{product.description}</p>
          <div className="feature-tags">{product.features.map((feature) => <span key={feature}><Check size={12} /> {feature}</span>)}</div>
          <div className="product-market-row"><div className="market-stack">{product.markets.slice(0, 4).map((market) => <span key={market.id} className={`market-avatar ${market.id}`} title={market.country}>{market.id.toUpperCase()}</span>)}</div><span><b>{product.markets.length} markets</b> supported in demo catalogue</span><button className="text-button" onClick={() => onNavigate("Markets & opportunities")}>View markets <ArrowRight size={14} /></button></div>
        </div>
      </div>
      <div className="product-details-grid">
        <section className="panel detail-panel"><div className="panel-heading"><div><h3>Technical specifications</h3><p>Simulated product catalogue values</p></div><span className="verified-tag"><CheckCircle2 size={13} /> DEMO VERIFIED</span></div><div className="spec-grid">{product.specifications.map((spec) => <div key={spec.label}><span>{spec.label}</span><b>{spec.value}</b></div>)}</div></section>
        <section className="panel detail-panel"><div className="panel-heading"><div><h3>Product documentation</h3><p>Available demo assets</p></div><FileText size={17} className="muted-icon" /></div><div className="documentation-list">{product.documentation.map((doc) => <div key={doc}><span className="doc-icon"><FileText size={14} /></span><b>{doc}</b><ArrowUpRight size={14} /></div>)}</div></section>
      </div>
      <div className="data-warning"><ShieldCheck size={16} /><div><b>Demo data — human verification required</b><p>{product.demoNote} Confirm current market-specific product details and approved documentation before publishing.</p></div><button className="button button-primary button-small" onClick={() => onNavigate("Markets & opportunities")}>Explore opportunities <ArrowRight size={14} /></button></div>
      <div className="available-market-strip"><div><h3>Available markets</h3><p>Select markets to tailor your video recommendations.</p></div>{product.markets.map((market) => <button className="market-mini-card" key={market.id} onClick={() => { onSelectMarket(market.id); onNavigate("Markets & opportunities"); }}><MarketFlag market={market} /><span><b>{market.country}</b><small>{market.languages.join(" · ")}</small></span><ArrowRight size={14} /></button>)}</div>
    </div>
  );
}

function Opportunities({
  product,
  selectedMarkets,
  activeMarketId,
  categoryFilter,
  recommendations,
  onToggleMarket,
  onSetActiveMarket,
  onSetCategoryFilter,
  onChooseRecommendation,
  onNavigate,
}: {
  product: Product | null;
  selectedMarkets: string[];
  activeMarketId: string;
  categoryFilter: string;
  recommendations: Recommendation[];
  onToggleMarket: (id: string) => void;
  onSetActiveMarket: (id: string) => void;
  onSetCategoryFilter: (category: string) => void;
  onChooseRecommendation: (recommendation: Recommendation) => void;
  onNavigate: (screen: Screen) => void;
}) {
  if (!product) return <EmptyState title="Discover a product before exploring markets" description="Search a PNC to see the markets where a product is available and generate relevant video opportunities." action="Find a product" onAction={() => onNavigate("Product discovery")} />;
  const selectedCount = product.markets.filter((market) => selectedMarkets.includes(market.id)).length;
  return (
    <div className="page opportunities-page">
      <PageTitle eyebrow="MARKET INTELLIGENCE" title="Markets & opportunities" description="Local context changes the story. Select your markets to see what matters there." />
      <div className="opportunity-product panel"><img src={product.image} alt="" /><div><span className="tiny-label">CURRENT PRODUCT</span><b>{product.name}</b><small>PNC {product.pnc} · {product.category}</small></div><button className="text-button" onClick={() => onNavigate("Product discovery")}>Change product <ArrowRight size={14} /></button></div>
      <section className="markets-section">
        <div className="section-title-row"><div><h3>Select target markets <span className="section-count">{selectedCount} selected</span></h3><p>Availability and requirements are based on simulated demo catalogue data.</p></div><span className="source-note"><ShieldCheck size={14} /> Demo data · verify before publishing</span></div>
        <div className="market-grid">{product.markets.map((market) => <MarketCard key={market.id} market={market} selected={selectedMarkets.includes(market.id)} active={activeMarketId === market.id} onToggle={() => onToggleMarket(market.id)} onOpen={() => onSetActiveMarket(market.id)} />)}</div>
      </section>
      <section className="recommendations-section">
        <div className="section-title-row"><div><div className="ai-eyebrow"><Sparkles size={14} /> AI OPPORTUNITY DISCOVERY</div><h3>Stories this product could tell</h3><p>Recommendations are grounded in the selected product record and market context.</p></div><button className="button button-outline" onClick={() => onNavigate("Video studio")}><Clapperboard size={16} /> Open video studio</button></div>
        {selectedCount === 0 ? <div className="no-market-note"><Globe2 size={18} /> Select at least one market to see localized recommendations.</div> : <>
          <div className="filter-toolbar"><label><ListFilter size={15} /><select value={categoryFilter} onChange={(event) => onSetCategoryFilter(event.target.value)}><option>All categories</option>{videoCategories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label><span>{recommendations.length} opportunities across {selectedCount} market{selectedCount === 1 ? "" : "s"}</span></div>
          <div className="recommendation-grid">{recommendations.map((recommendation) => <RecommendationCard key={recommendation.id} recommendation={recommendation} onChoose={() => onChooseRecommendation(recommendation)} />)}</div>
        </>}
      </section>
    </div>
  );
}

function MarketCard({ market, selected, active, onToggle, onOpen }: { market: Market; selected: boolean; active: boolean; onToggle: () => void; onOpen: () => void }) {
  return <div className={`market-card panel ${selected ? "market-selected" : ""} ${active ? "market-active" : ""}`}>
    <div className="market-card-top"><MarketFlag market={market} /><button className={`market-check ${selected ? "checked" : ""}`} aria-label={`${selected ? "Remove" : "Select"} ${market.country}`} onClick={onToggle}>{selected && <Check size={13} />}</button></div>
    <h4>{market.country}</h4><span className="market-region">{market.region}</span><span className="availability"><i /> {market.availability}</span>
    <div className="market-card-divider" /><div className="market-meta"><span>LANGUAGES</span><b>{market.languages.join(" · ")}</b></div><div className="market-meta"><span>CHANNELS</span><b>{market.channels.slice(0, 2).join(" · ")}{market.channels.length > 2 && ` +${market.channels.length - 2}`}</b></div>
    <p className="market-difference"><MessageSquareText size={13} /> {market.marketNote}</p>
    <div className="market-requirement-inline"><span>LOCALIZED CONTENT</span><p>{market.contentRequirements}</p></div>
    <button className="market-requirements" onClick={onOpen}><span>{active ? "Selected for video creation" : "Use this market"}</span><ArrowRight size={14} /></button>
  </div>;
}

function RecommendationCard({ recommendation, onChoose }: { recommendation: Recommendation; onChoose: () => void }) {
  const priorityClass = recommendation.priority.toLowerCase();
  return <article className="recommendation-card panel">
    <div className="recommendation-top"><span className="rec-category">{recommendation.category}</span><span className={`priority ${priorityClass}`}><i /> {recommendation.priority} priority</span></div>
    <h4>{recommendation.title}</h4><p className="rec-problem">{recommendation.problem}</p>
    <div className="rec-reason"><Sparkles size={13} /><span>{recommendation.reason}</span></div>
    {recommendation.verification && <div className="rec-verification"><ShieldCheck size={14} /> {recommendation.verification}</div>}
    <div className="rec-info-grid"><div><span>FOR</span><b>{recommendation.audience}</b></div><div><span>MARKET</span><b>{recommendation.market.country}</b></div><div><span>LANGUAGE</span><b>{recommendation.language}</b></div><div><span>FORMAT</span><b>{recommendation.duration}</b></div></div>
    <div className="rec-card-footer"><span>{recommendation.channel}</span><button onClick={onChoose}>Create this video <ArrowRight size={14} /></button></div>
  </article>;
}

function VideoStudio({
  product,
  markets,
  activeMarket,
  selectedRecommendation,
  category,
  language,
  duration,
  format,
  audience,
  tone,
  voiceover,
  subtitles,
  channel,
  generated,
  generating,
  activeScene,
  onSetCategory,
  onSetMarket,
  onSetLanguage,
  onSetDuration,
  onSetFormat,
  onSetAudience,
  onSetTone,
  onSetVoiceover,
  onSetSubtitles,
  onSetChannel,
  onGenerate,
  onSetActiveScene,
  onRegenerateScene,
  onSaveNarration,
  onExportScript,
  onExportSubtitles,
  onNavigate,
}: {
  product: Product | null;
  markets: Market[];
  activeMarket: Market | undefined;
  selectedRecommendation: Recommendation | undefined;
  category: VideoCategory;
  language: string;
  duration: number;
  format: Format;
  audience: Audience;
  tone: Tone;
  voiceover: "Male" | "Female" | "No Voiceover";
  subtitles: boolean;
  channel: Channel;
  generated: GeneratedVideo | null;
  generating: boolean;
  activeScene: number;
  onSetCategory: (category: VideoCategory) => void;
  onSetMarket: (market: Market) => void;
  onSetLanguage: (language: string) => void;
  onSetDuration: (duration: number) => void;
  onSetFormat: (format: Format) => void;
  onSetAudience: (audience: Audience) => void;
  onSetTone: (tone: Tone) => void;
  onSetVoiceover: (voiceover: "Male" | "Female" | "No Voiceover") => void;
  onSetSubtitles: (subtitles: boolean) => void;
  onSetChannel: (channel: Channel) => void;
  onGenerate: () => void;
  onSetActiveScene: (scene: number) => void;
  onRegenerateScene: (index: number) => void;
  onSaveNarration: (narration: string) => void;
  onExportScript: () => void;
  onExportSubtitles: () => void;
  onNavigate: (screen: Screen) => void;
}) {
  if (!product) return <EmptyState title="Your studio is ready for its first product" description="Start by identifying a product. Then choose a market and turn an opportunity into a localized storyboard." action="Find a product" onAction={() => onNavigate("Product discovery")} />;
  return (
    <div className="page studio-page">
      <PageTitle eyebrow="AI VIDEO WORKSPACE" title="Video studio" description="Configure once. Create a version for every audience." action={<span className="simulated-badge"><span /> SIMULATED AI · NO API KEY NEEDED</span>} />
      <div className="studio-context panel"><div className="studio-context-product"><img src={product.image} alt="" /><span><small>PRODUCT</small><b>{product.name}</b><i>PNC {product.pnc}</i></span></div><span className="context-divider" /><div className="context-market"><Globe2 size={17} /><span><small>CREATING FOR</small><b>{activeMarket?.country ?? "Select market"}</b></span></div><span className="context-divider" /><div className="context-context"><Sparkles size={16} /><span>{selectedRecommendation ? `Based on: ${selectedRecommendation.title}` : "AI content generation · product-grounded"}</span></div><button className="text-button" onClick={() => onNavigate("Markets & opportunities")}>Change <ArrowRight size={14} /></button></div>
      <div className="studio-layout">
        <section className="studio-config panel">
          <div className="studio-panel-heading"><span className="step-number">01</span><div><h3>Video configuration</h3><p>Set up your localized variation</p></div></div>
          <label className="field-label">VIDEO TYPE</label>
          <select className="field-select" value={category} onChange={(event) => onSetCategory(event.target.value as VideoCategory)}>{videoCategories.map((item) => <option key={item}>{item}</option>)}</select>
          <div className="form-two-col"><div><label className="field-label">TARGET MARKET</label><select className="field-select" value={activeMarket?.id ?? ""} onChange={(event) => { const market = markets.find((item) => item.id === event.target.value); if (market) onSetMarket(market); }}>{markets.map((market) => <option key={market.id} value={market.id}>{market.country}</option>)}</select></div><div><label className="field-label">LANGUAGE</label><select className="field-select" value={language} onChange={(event) => onSetLanguage(event.target.value)}>{(activeMarket?.languages ?? ["English"]).map((item) => <option key={item}>{item}</option>)}</select></div></div>
          <div className="form-two-col"><div><label className="field-label">DURATION</label><select className="field-select" value={duration} onChange={(event) => onSetDuration(Number(event.target.value))}><option value={15}>15 seconds</option><option value={30}>30 seconds</option><option value={60}>60 seconds</option><option value={90}>90 seconds</option></select></div><div><label className="field-label">VIDEO FORMAT</label><select className="field-select" value={format} onChange={(event) => onSetFormat(event.target.value as Format)}>{formatOptions.map((item) => <option key={item}>{item}</option>)}</select></div></div>
          <label className="field-label">AUDIENCE</label><div className="segmented-control">{audienceOptions.map((item) => <button key={item} className={audience === item ? "segment-active" : ""} onClick={() => onSetAudience(item)}>{item}</button>)}</div>
          <div className="form-two-col"><div><label className="field-label">TONE</label><select className="field-select" value={tone} onChange={(event) => onSetTone(event.target.value as Tone)}>{toneOptions.map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="field-label">VOICEOVER</label><select className="field-select" value={voiceover} onChange={(event) => onSetVoiceover(event.target.value as "Male" | "Female" | "No Voiceover")}><option>Female</option><option>Male</option><option>No Voiceover</option></select></div></div>
          <label className="field-label">PUBLISHING CHANNEL</label><select className="field-select" value={channel} onChange={(event) => { onSetChannel(event.target.value as Channel); if (event.target.value === "Instagram Reel") { onSetFormat("9:16"); onSetDuration(30); } }}>{channelOptions.map((item) => <option key={item}>{item}</option>)}</select>
          <button className={`subtitle-toggle ${subtitles ? "toggle-on" : ""}`} onClick={() => onSetSubtitles(!subtitles)}><span className="toggle-switch"><i /></span><span><b>Include subtitles</b><small>Generate accessible, localized captions</small></span><Subtitles size={17} /></button>
          <div className="configuration-note"><ShieldCheck size={15} /><span>Scripts use only the demo product record. Technical and safety content is flagged for human review.</span></div>
          <button className="button button-primary generate-button" onClick={onGenerate} disabled={generating || !activeMarket}>{generating ? <><span className="button-spinner" /> Preparing your video</> : <><Sparkles size={16} /> Generate video content <ArrowRight size={16} /></>}</button>
          <span className="generation-footnote">Bynder video preview · Starts after a short preparation</span>
        </section>
        <section className="studio-output">
          {generating ? <div className="generation-progress panel" role="status" aria-live="polite"><span className="generation-progress-icon"><span className="button-spinner" /></span><h3>Your video is being prepared</h3><p>Loading the Bynder video for {product.name}…</p><div className="generation-progress-track"><i /></div><small>This preview will start automatically in a few seconds.</small></div> : !generated ? <div className="output-empty panel"><div className="empty-canvas"><div className="canvas-spark"><Sparkles size={23} /></div><div className="canvas-lines"><i /><i /><i /></div><span className="canvas-duration">{duration}s</span></div><span className="tiny-label">YOUR STORYBOARD STARTS HERE</span><h3>Make something meaningful.</h3><p>Choose your audience and market, then generate a tailored script and storyboard.</p><div className="output-checklist"><span><CheckCircle2 size={15} /> Localized narration</span><span><CheckCircle2 size={15} /> Scene-by-scene storyboard</span><span><CheckCircle2 size={15} /> Preview and export tools</span></div></div> : <GeneratedOutput
            product={product}
            video={generated}
            activeMarket={activeMarket}
            language={language}
            format={format}
            channel={channel}
            activeScene={activeScene}
            onSetActiveScene={onSetActiveScene}
            onRegenerateScene={onRegenerateScene}
            onSaveNarration={onSaveNarration}
            onExportScript={onExportScript}
            onExportSubtitles={onExportSubtitles}
          />}
        </section>
      </div>
    </div>
  );
}

function GeneratedOutput({
  product,
  video,
  activeMarket,
  language,
  format,
  channel,
  activeScene,
  onSetActiveScene,
  onRegenerateScene,
  onSaveNarration,
  onExportScript,
  onExportSubtitles,
}: {
  product: Product;
  video: GeneratedVideo;
  activeMarket: Market | undefined;
  language: string;
  format: Format;
  channel: Channel;
  activeScene: number;
  onSetActiveScene: (scene: number) => void;
  onRegenerateScene: (index: number) => void;
  onSaveNarration: (narration: string) => void;
  onExportScript: () => void;
  onExportSubtitles: () => void;
}) {
  return <div className="generated-output">
    <div className="generated-heading"><div><div className="generated-title-row"><h3>{video.title}</h3><span className="draft-badge"><i /> DRAFT</span></div><p>{activeMarket?.country} <span>·</span> {language} <span>·</span> {format} <span>·</span> {channel}</p><p className="generated-description">{video.description}</p></div><button className="icon-button subtle" aria-label="More video options"><ChevronDown size={16} /></button></div>
    <div className="preview-player">
      <video key={video.videoUrl} className="preview-bynder-video" src={video.videoUrl} poster={product.image} autoPlay muted controls playsInline preload="metadata" aria-label={`${product.name} video from Electrolux Bynder`} />
    </div>
    <div className="preview-footnote"><span><span className="orange-dot" /> Electrolux Bynder reference preview</span><a href={video.sourceUrl} target="_blank" rel="noreferrer">View original asset</a></div>
    <div className="storyboard-heading"><div><h3>Storyboard <span>{video.scenes.length} scenes</span></h3><p>Scene-by-scene creative direction</p></div></div>
    <div className="scene-list">{video.scenes.map((item, index) => <article className={`scene-card ${index === activeScene ? "scene-active" : ""}`} key={item.number}>
      <button className="scene-select" onClick={() => onSetActiveScene(index)}><span className="scene-number">{String(item.number).padStart(2, "0")}</span><span className="scene-thumb"><img src={product.image} alt="" /><i><Play size={10} fill="currentColor" /></i></span><span className="scene-main"><b>Scene {item.number} <small>{item.duration}s</small></b><span>{item.visual}</span></span></button>
      <div className="scene-detail"><div><span>VOICEOVER</span><p>{item.narration}</p></div><div><span>ON-SCREEN TEXT</span><p className="overlay-text">{item.overlay}</p></div><div className="scene-meta"><span>{item.transition}</span><span>{item.asset}</span><button onClick={() => onRegenerateScene(index)}><RotateCw size={13} /> Regenerate scene</button></div></div>
    </article>)}</div>
    <div className="narration-panel panel"><div className="narration-heading"><div className="narration-icon"><MessageSquareText size={17} /></div><div><h4>Full narration script</h4><p>Editable · Changes are saved to this project</p></div><button className="text-button" onClick={onExportScript}><ArrowDownToLine size={14} /> Export .txt</button></div><textarea value={video.narration} onChange={(event) => onSaveNarration(event.target.value)} aria-label="Edit narration script" /></div>
    <div className="video-extras panel"><div><span className="extra-icon"><Sparkles size={15} /></span><span><small>BACKGROUND MUSIC</small><b>{video.music}</b></span></div><div><span className="extra-icon"><ArrowRight size={15} /></span><span><small>CALL TO ACTION</small><b>{video.callToAction}</b></span></div></div>
    <div className="export-bar"><div><b>Ready for a first review?</b><span>Product link: {product.name} · PNC {product.pnc}</span></div><div><button className="button button-outline button-small" disabled title="Configure Bynder API access to enable publishing"><ArrowUpRight size={15} /> Publish to Bynder</button><button className="button button-outline button-small" onClick={onExportSubtitles}><Subtitles size={15} /> Download subtitles</button></div></div>
    <div className="render-note"><ShieldCheck size={14} /> Publishing is not connected yet. Bynder API access and product-link metadata are required.</div>
  </div>;
}

function Projects({ projects, onSetStatus, onNavigate }: { projects: Project[]; onSetStatus: (id: string, status: ProjectStatus) => void; onNavigate: (screen: Screen) => void }) {
  return <div className="page projects-page">
    <PageTitle eyebrow="CONTENT LIBRARY" title="My video projects" description="Every market variation, together in one place." action={<button className="button button-primary" onClick={() => onNavigate("Product discovery")}><Plus size={16} /> New video project</button>} />
    <div className="project-summary panel"><div className="project-summary-icon"><Film size={18} /></div><div><b>{projects.length} saved project{projects.length === 1 ? "" : "s"}</b><span>Prototype projects are kept in this session.</span></div><div className="project-summary-stat"><span>{projects.filter((project) => project.status === "Pending review").length}</span><small>Pending review</small></div><div className="project-summary-stat"><span>{projects.filter((project) => project.status === "Approved").length}</span><small>Approved</small></div></div>
    {projects.length === 0 ? <div className="projects-empty panel"><div className="empty-icon"><Clapperboard size={20} /></div><h3>Your project library is ready</h3><p>Generated videos will appear here with their market, language and review status.</p><button className="button button-primary button-small" onClick={() => onNavigate("Product discovery")}>Create your first video <ArrowRight size={14} /></button></div> : <div className="project-table panel">
      <div className="project-table-head"><span>VIDEO PROJECT</span><span>MARKET / LANGUAGE</span><span>VIDEO TYPE</span><span>CREATED</span><span>STATUS</span><span /></div>
      {projects.map((project) => <div className="project-table-row" key={project.id}><div className="project-cell-title"><img src={project.product.image} alt="" /><span><b>{project.video.title}</b><small>{project.product.name} · PNC {project.product.pnc}</small></span></div><div className="project-cell-market"><MarketFlag market={project.market} /><span>{project.market.country}<small>{project.language}</small></span></div><span className="project-category">{project.category}</span><span className="project-date">{project.createdAt}</span><span className={`project-status ${project.status === "Approved" ? "approved" : ""}`}><i />{project.status}</span><button className="text-button project-review" onClick={() => onSetStatus(project.id, project.status === "Approved" ? "Pending review" : "Approved")}>{project.status === "Approved" ? "Undo" : "Approve"} <ArrowRight size={13} /></button></div>)}
    </div>}
    <div className="project-library-note"><ShieldCheck size={15} /> Project status is a prototype workflow state and is not synced to an external content system.</div>
  </div>;
}

function ProjectRow({ project }: { project: Project }) {
  return <div className="recent-project-row"><img src={project.product.image} alt="" /><div className="recent-project-copy"><b>{project.video.title}</b><span>{project.market.country} · {project.language} · {project.category}</span></div><span className={`project-status ${project.status === "Approved" ? "approved" : ""}`}><i />{project.status}</span><ArrowRight size={15} className="recent-arrow" /></div>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading heading-with-action"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function MarketFlag({ market }: { market: Market }) {
  const labels: Record<string, string> = { it: "IT", de: "DE", uk: "UK", hu: "HU", fr: "FR", es: "ES", pl: "PL", se: "SE", no: "NO" };
  return <span className={`market-flag ${market.id}`} aria-label={market.country}>{labels[market.id] ?? market.country.slice(0, 2).toUpperCase()}</span>;
}

function EmptyState({ title, description, action, onAction }: { title: string; description: string; action: string; onAction: () => void }) {
  return <div className="standalone-empty panel"><div className="empty-icon"><Sparkles size={20} /></div><span className="eyebrow">READY WHEN YOU ARE</span><h2>{title}</h2><p>{description}</p><button className="button button-primary" onClick={onAction}>{action} <ArrowRight size={15} /></button></div>;
}

export default App;
