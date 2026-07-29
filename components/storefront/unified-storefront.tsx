"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Image as DreiImage } from "@react-three/drei";
import * as THREE from "three";
import { formatCurrency, formatFileSize } from "@/lib/utils";
import TextPressure from "./TextPressure";
import PillNav from "./PillNav";
import { TextRotate } from "./TextRotate";
import Dock from "./Dock";
import GooeyNav from "./GooeyNav";
import Floating, { FloatingElement } from "@/components/ui/parallax-floating";
import dynamic from "next/dynamic";
import StaggeredMenu from "./StaggeredMenu";

const Lanyard = dynamic(() => import("./Lanyard"), { ssr: false });
const Ballpit = dynamic(() => import("../ui/Ballpit"), { ssr: false });
const FlyingPosters = dynamic(() => import("../ui/FlyingPosters"), { ssr: false });
const CircularGallery = dynamic(() => import("./CircularGallery"), { ssr: false });
const Hyperspeed = dynamic(() => import("../ui/Hyperspeed"), { ssr: false });
const OptionWheel = dynamic(() => import("../ui/OptionWheel"), { ssr: false });
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  UploadCloud,
  Truck,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle2,
  Flame,
  Images,
  Trophy,
  Film,
  Tv,
  Mic,
  Car,
  X,
  FileCheck,
  AlertCircle,
  Clock,
  Eye,
  Lock,
  ArrowRight,
  Filter,
  Plus,
  Minus,
  LayoutDashboard,
  FolderTree,
  Package,
  Layers,
  BarChart2,
  LogOut,
  Edit,
  Trash2,
  Copy,
  Settings,
  Check,
  XCircle,
  Download,
  RotateCcw,
  Award,
  ChevronDown,
  ChevronRight,
  Tag,
  Folder,
  ShoppingCart,
  Zap,
} from "lucide-react";

interface PosterItem {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  offerPrice?: number | null;
  description: string;
  category?: { name: string; slug: string };
  images?: { url: string; thumbnailUrl?: string | null }[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  stock: number;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  animation?: string | null;
}

interface SubTopic {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  posterIds: string[];
  description?: string;
  imageUrl?: string | null;
}

// ScrollReveal component for premium viewport-enter scroll animations
function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-98 pointer-events-none"
        }`}
    >
      {children}
    </div>
  );
}

interface UnifiedStorefrontProps {
  initialCategories: CategoryItem[];
  initialPosters: PosterItem[];
}

const getCategoryEmoji = (slug: string) => {
  switch (slug) {
    case "anime": return "⚔️";
    case "sports": return "🏆";
    case "movies": return "🎬";
    case "web-series": return "📺";
    case "k-pop": return "🎤";
    case "cars":
    case "cars-and-automations":
    case "cars-and-bikes":
    case "cars-and-automotive":
    case "automations": return "🏎️";
    case "songs-and-creators": return "🎵";
    default: return "📁";
  }
};

const getUserInitials = (name: string) => {
  if (!name) return "US";
  const clean = name.trim();
  if (clean.indexOf(" ") !== -1) {
    const parts = clean.split(/\s+/);
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (clean.length >= 2) {
    return (clean[0] + clean[clean.length - 1]).toUpperCase();
  }
  return clean[0].toUpperCase();
};

const DEFAULT_SUBTOPICS: SubTopic[] = [
  { id: "st-1", name: "Demon Slayer", slug: "demon-slayer", categorySlug: "anime", posterIds: [], description: "Tanjiro, Nezuko, Inosuke & all Demon Slayer characters", imageUrl: "/assets/images/hero-1.png" },
  { id: "st-2", name: "Naruto", slug: "naruto", categorySlug: "anime", posterIds: [], description: "Naruto, Sasuke, Itachi & Hidden Leaf village", imageUrl: "/assets/images/hero-2.png" },
  { id: "st-3", name: "One Piece", slug: "one-piece", categorySlug: "anime", posterIds: [], description: "Luffy, Zoro, Nami & the Straw Hat crew", imageUrl: "/assets/images/hero-3.png" },
  { id: "st-4", name: "Jujutsu Kaisen", slug: "jujutsu-kaisen", categorySlug: "anime", posterIds: [], description: "Gojo, Yuji, Megumi & cursed spirits", imageUrl: "/assets/images/hero-4.png" },
  { id: "st-5", name: "Attack on Titan", slug: "attack-on-titan", categorySlug: "anime", posterIds: [], description: "Eren, Mikasa, Levi & the Survey Corps", imageUrl: "/assets/images/hero-5.png" },
  { id: "st-7", name: "Football", slug: "football", categorySlug: "sports", posterIds: [], description: "FIFA, Premier League & football icons", imageUrl: "/assets/images/hero-7.png" },
  { id: "st-9", name: "Marvel", slug: "marvel", categorySlug: "movies", posterIds: [], description: "Avengers, Spider-Man & MCU universe", imageUrl: null },
  { id: "st-10", name: "DC Comics", slug: "dc-comics", categorySlug: "movies", posterIds: [], description: "Batman, Superman & DC universe", imageUrl: null },
  { id: "st-11", name: "Bollywood", slug: "bollywood", categorySlug: "movies", posterIds: [], description: "Classic & modern Bollywood cinema", imageUrl: null },
  { id: "st-12", name: "Breaking Bad", slug: "breaking-bad", categorySlug: "web-series", posterIds: [], description: "Walter White, Jesse & the chemistry", imageUrl: null },
  { id: "st-13", name: "Stranger Things", slug: "stranger-things", categorySlug: "web-series", posterIds: [], description: "The Upside Down & Hawkins crew", imageUrl: null },
  { id: "st-14", name: "BTS", slug: "bts", categorySlug: "k-pop", posterIds: [], description: "BTS members and ARMY collections", imageUrl: null },
  { id: "st-15", name: "BLACKPINK", slug: "blackpink", categorySlug: "k-pop", posterIds: [], description: "Lisa, Jennie, Rosé & Jisoo", imageUrl: null },
  { id: "st-16", name: "Supercars", slug: "supercars", categorySlug: "cars-and-automations", posterIds: [], description: "Lamborghini, Ferrari & exotic cars", imageUrl: null },
  { id: "st-17", name: "JDM Culture", slug: "jdm", categorySlug: "cars-and-automations", posterIds: [], description: "Skyline, Supra & Japanese legends", imageUrl: null },
  { id: "st-20", name: "Formula 1 & Racing", slug: "f1-racing", categorySlug: "cars-and-automations", posterIds: [], description: "Senna, Hamilton, Verstappen & F1 racing art", imageUrl: null },
  { id: "st-21", name: "Classic & Vintage", slug: "classic-cars", categorySlug: "cars-and-automations", posterIds: [], description: "Vintage Porsche 911, Shelby Cobra & retro classics", imageUrl: null },
  { id: "st-18", name: "Hip Hop", slug: "hip-hop", categorySlug: "songs-and-creators", posterIds: [], description: "Rap legends and hip hop culture", imageUrl: null },
  { id: "st-19", name: "Rock & Metal", slug: "rock-metal", categorySlug: "songs-and-creators", posterIds: [], description: "Rock bands and metal icons", imageUrl: null },
];

interface MovieSphereProps {
  posters: PosterItem[];
  onSelectPoster: (p: PosterItem) => void;
  title?: string;
}

function MovieParticleSphere({ posters, onSelectPoster }: Omit<MovieSphereProps, "title">) {
  const PARTICLE_COUNT = 800;
  const PARTICLE_SIZE_MIN = 0.015;
  const PARTICLE_SIZE_MAX = 0.035;
  const SPHERE_RADIUS = 6.5;
  const POSITION_RANDOMNESS = 2.2;
  const ROTATION_SPEED_Y = 0.0006;

  const groupRef = useRef<THREE.Group>(null);

  // Generate particle data once
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
      const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;
      const radiusVariation = SPHERE_RADIUS + (Math.random() - 0.5) * POSITION_RANDOMNESS;
      const x = radiusVariation * Math.cos(theta) * Math.sin(phi);
      const y = radiusVariation * Math.cos(phi);
      const z = radiusVariation * Math.sin(theta) * Math.sin(phi);

      arr.push({
        position: [x, y, z] as [number, number, number],
        scale: Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN,
        color: new THREE.Color().setHSL(0.2, 1.0, 0.6), // Neon Green
      });
    }
    return arr;
  }, [PARTICLE_COUNT, SPHERE_RADIUS, POSITION_RANDOMNESS]);

  // Generate orbiting images positions from actual movie posters
  const orbitingImages = useMemo(() => {
    const images = [];
    const count = posters.length;
    if (count === 0) return [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = SPHERE_RADIUS * Math.cos(angle);
      const y = (Math.random() - 0.5) * 2.5;
      const z = SPHERE_RADIUS * Math.sin(angle);

      const position = new THREE.Vector3(x, y, z);
      const center = new THREE.Vector3(0, 0, 0);
      const outwardDirection = position.clone().sub(center).normalize();

      const euler = new THREE.Euler();
      const matrix = new THREE.Matrix4();
      matrix.lookAt(position, position.clone().add(outwardDirection), new THREE.Vector3(0, 1, 0));
      euler.setFromRotationMatrix(matrix);
      euler.z += Math.PI;

      images.push({
        poster: posters[i],
        position: [x, y, z] as [number, number, number],
        rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      });
    }
    return images;
  }, [posters, SPHERE_RADIUS]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_SPEED_Y;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Particles */}
      {particles.map((p, idx) => (
        <mesh key={`p-${idx}`} position={p.position} scale={p.scale}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Orbiting Movie Plates */}
      {orbitingImages.map((img, idx) => {
        const url = img.poster.images?.[0]?.url || "https://placehold.co/400x600/0a0a0a/333333?text=Movie";
        return (
          <mesh
            key={`img-${idx}`}
            position={img.position}
            rotation={img.rotation}
            onClick={() => onSelectPoster(img.poster)}
            onPointerOver={() => { document.body.style.cursor = "pointer"; }}
            onPointerOut={() => { document.body.style.cursor = "auto"; }}
          >
            <planeGeometry args={[1.5, 2.25]} />
            <Suspense fallback={<meshBasicMaterial color="#0D0D0D" />}>
              <DreiImage url={url} transparent side={THREE.DoubleSide} />
            </Suspense>
          </mesh>
        );
      })}
    </group>
  );
}

function MovieSphereCanvas({ posters, onSelectPoster, title = "Movies Universe 3D" }: MovieSphereProps) {
  return (
    <div className="w-full h-[600px] bg-black/60 rounded-3xl border border-[#D4FF3D]/20 overflow-hidden relative shadow-2xl">
      <div className="absolute inset-x-0 top-6 text-center z-10 pointer-events-none">
        <h3 className="text-3xl font-black uppercase tracking-tighter" style={{ color: "#D4FF3D" }}>
          {title}
        </h3>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">
          Drag to Orbit • Click Poster to View Details
        </p>
      </div>

      <Canvas camera={{ position: [0, 0, 11], fov: 60 }}>
        <ambientLight intensity={1.5} />
        <Suspense fallback={null}>
          <MovieParticleSphere posters={posters} onSelectPoster={onSelectPoster} />
        </Suspense>
        <OrbitControls enableZoom={true} enablePan={false} minDistance={4} maxDistance={18} />
      </Canvas>
    </div>
  );
}

export function UnifiedStorefront({ initialCategories, initialPosters }: UnifiedStorefrontProps) {
  // Current Active Mode: "STOREFRONT" or "ADMIN_CMS"
  const [viewMode, setViewMode] = useState<"STOREFRONT" | "ADMIN_CMS">("STOREFRONT");
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: "ADMIN" | "CUSTOMER" } | null>(null);

  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (session?.user) {
      setCurrentUser({
        name: session.user.name || "Super Admin",
        email: session.user.email || "admin@posterstore.com",
        role: session.user.role as "ADMIN" | "CUSTOMER",
      });
    } else if (sessionStatus === "unauthenticated") {
      setCurrentUser(null);
    }
  }, [session, sessionStatus]);

  // Storefront Section Tabs
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isChennaiNoticeDismissed, setIsChennaiNoticeDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<"CATALOG" | "CUSTOM_UPLOAD" | "TRACK_ORDER">("CATALOG");
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hyperspeedOptions = useMemo(() => ({
    distortion: "turbulentDistortion",
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [12, 80],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0x131318,
      brokenLines: 0x131318,
      leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
      rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
      sticks: 0x03b3c3,
    },
  }), []);

  // Admin CMS Section Tabs
  const [adminTab, setAdminTab] = useState<"TRENDING" | "GALLERY" | "CATEGORIES" | "SUBTOPICS" | "ORDERS">("TRENDING");

  // Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<PosterItem | null>(null);

  // Cart & Wishlist State
  const [cart, setCart] = useState<Array<{ poster: PosterItem; quantity: number; size: string; frame: boolean }>>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<"CART" | "SHIPPING" | "SUCCESS">("CART");
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutEmail, setCheckoutEmail] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState("COD");
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);

  // Delivery Zones & Shipping Options State
  const [availableZones, setAvailableZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState<any>(null);

  // Add-to-Cart Animation State
  const [cartToast, setCartToast] = useState<string | null>(null);
  const [cartAnimatingId, setCartAnimatingId] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Custom Upload Form State
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreviewUrl, setArtworkPreviewUrl] = useState<string | null>(null);
  const [artworkTitle, setArtworkTitle] = useState("");
  const [selectedSize, setSelectedSize] = useState("A3 (11.7 x 16.5 in)");
  const [quantity, setQuantity] = useState(1);
  const [frameRequired, setFrameRequired] = useState(false);
  const [notes, setNotes] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Order Tracker State
  const [trackOrderNum, setTrackOrderNum] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<any>(null);

  // Unified Single Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [authMode, setAuthMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showCelebrationBallpit, setShowCelebrationBallpit] = useState(false);
  const [signupPhone, setSignupPhone] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [usersList, setUsersList] = useState<any[]>([
    {
      name: "Demo Customer",
      email: "customer@example.com",
      password: "CustomerPass123!",
      phone: "9876543210",
      address: "123, OMR Road, Adyar, Chennai - 600020"
    }
  ]);
  // Circular Gallery animation states for K-Pop & Anime categories
  const galleryRef = useRef<HTMLDivElement>(null);
  const [gallerySize, setGallerySize] = useState(0);
  const [galleryRotation, setGalleryRotation] = useState(0);

  useEffect(() => {
    if (selectedCategory !== "k-pop" && selectedCategory !== "anime") return;
    const updateSize = () => {
      if (galleryRef.current) {
        setGallerySize(galleryRef.current.offsetWidth);
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (galleryRef.current) observer.observe(galleryRef.current);
    return () => observer.disconnect();
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory !== "k-pop" && selectedCategory !== "anime") return;
    let frameId: number;
    const animate = () => {
      setGalleryRotation((r) => r + 0.0008);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [selectedCategory]);
  // Dynamic Catalog State for Admin CRUD
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(() => {
    const seenSlugs = new Set<string>();
    const seenNames = new Set<string>();
    const list: CategoryItem[] = [];
    initialCategories.forEach(cat => {
      const updatedCat = { ...cat };
      if (cat.slug === "sports" || cat.name.toLowerCase().includes("sports")) {
        updatedCat.name = "Sports";
        updatedCat.slug = "sports";
      }
      const slugKey = updatedCat.slug.toLowerCase();
      const nameKey = updatedCat.name.toLowerCase();
      if (!seenSlugs.has(slugKey) && !seenNames.has(nameKey)) {
        seenSlugs.add(slugKey);
        seenNames.add(nameKey);
        list.push(updatedCat);
      }
    });
    return list;
  });
  const [postersList, setPostersList] = useState<PosterItem[]>(initialPosters);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatAnimation, setNewCatAnimation] = useState("card-orbit-3d");

  // Sub-Topics State
  const [subTopicsList, setSubTopicsList] = useState<SubTopic[]>(DEFAULT_SUBTOPICS);
  const [newSTName, setNewSTName] = useState("");
  const [newSTCategory, setNewSTCategory] = useState("anime");
  const [newSTDesc, setNewSTDesc] = useState("");
  const [editingSubTopic, setEditingSubTopic] = useState<SubTopic | null>(null);
  const [newSTImageUrl, setNewSTImageUrl] = useState("");

  // Trending Banners State (Starts empty until added by Admin)
  const [trendingBannersList, setTrendingBannersList] = useState<Array<{
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    badgeText: string;
    linkUrl: string;
  }>>([]);

  const [newTBTitle, setNewTBTitle] = useState("");
  const [newTBSubtitle, setNewTBSubtitle] = useState("");
  const [newTBBadge, setNewTBBadge] = useState("HOT TRENDING");
  const [newTBLink, setNewTBLink] = useState("/");
  const [newTBImageUrl, setNewTBImageUrl] = useState("");

  // Orders Dashboard State
  const [orderFilter, setOrderFilter] = useState<"ALL" | "CONFIRMED" | "PRINTING" | "SHIPPED" | "DELIVERED" | "DEADLINE_2DAYS">("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<any>(null);
  const [orderSortBy, setOrderSortBy] = useState<"DATE_DESC" | "DATE_ASC" | "AMOUNT_DESC" | "AMOUNT_ASC">("DATE_DESC");

  // New Poster CMS State
  const [newPosterTitle, setNewPosterTitle] = useState("");
  const [newPosterCategory, setNewPosterCategory] = useState("anime");
  const [newPosterBasePrice, setNewPosterBasePrice] = useState("799");
  const [newPosterOfferPrice, setNewPosterOfferPrice] = useState("499");
  const [newPosterImageUrl, setNewPosterImageUrl] = useState("");
  const [newPosterImageFile, setNewPosterImageFile] = useState<File | null>(null);
  const [isPublishingPoster, setIsPublishingPoster] = useState(false);

  // Sub-Topic Poster Manager State
  const [activeSubTopicPanel, setActiveSubTopicPanel] = useState<"LIST" | "ADD_POSTER" | "LINK_POSTER" | "EDIT_INFO">("LIST");
  const [stNewPosterTitle, setStNewPosterTitle] = useState("");
  const [stNewPosterDesc, setStNewPosterDesc] = useState("");
  const [stNewPosterBasePrice, setStNewPosterBasePrice] = useState("799");
  const [stNewPosterOfferPrice, setStNewPosterOfferPrice] = useState("499");
  const [stNewPosterImageUrl, setStNewPosterImageUrl] = useState("");
  const [stNewPosterImageFile, setStNewPosterImageFile] = useState<File | null>(null);
  const [stEditName, setStEditName] = useState("");
  const [stEditDesc, setStEditDesc] = useState("");
  const [stEditImageUrl, setStEditImageUrl] = useState("");

  // Dynamically seed initialPosters into the default subtopics on mount
  useEffect(() => {
    setSubTopicsList((prevList) => {
      return prevList.map((st) => {
        if (st.posterIds.length > 0) return st;

        const matchedPosterIds = initialPosters
          .filter((p) => {
            const titleLower = p.title.toLowerCase();
            const descLower = p.description.toLowerCase();
            const slugLower = p.slug.toLowerCase();
            const nameWords = st.name.toLowerCase().split(" ");
            const matchesCategory = p.category?.slug === st.categorySlug;

            const matchesKeyword = nameWords.some(
              (word) =>
                word.length > 2 && (titleLower.includes(word) || descLower.includes(word) || slugLower.includes(word))
            ) || slugLower.includes(st.slug);

            return matchesCategory && matchesKeyword;
          })
          .map((p) => p.id);

        if (matchedPosterIds.length === 0) {
          const categoryFallbackIds = initialPosters
            .filter((p) => p.category?.slug === st.categorySlug)
            .slice(0, 2)
            .map((p) => p.id);
          return { ...st, posterIds: categoryFallbackIds };
        }

        return { ...st, posterIds: matchedPosterIds };
      });
    });
  }, [initialPosters]);

  // LocalStorage Persisted State Loader
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBanners = localStorage.getItem("maja_trending_banners");
      if (savedBanners) {
        try {
          setTrendingBannersList(JSON.parse(savedBanners));
        } catch (e) { }
      } else {
        // Seed default weekly showcase banners if empty
        const defaultBanners = [
          {
            id: "tb-1",
            title: "Demon Slayer Hinokami Kagura Flame Edition",
            subtitle: "Trending Anime Wall Art Collection • 300 GSM Matte Paper",
            imageUrl: "/assets/images/hero-1.png",
            badgeText: "HOT TRENDING",
            linkUrl: "/anime",
          },
          {
            id: "tb-2",
            title: "Supercars & JDM Legends Spotlight",
            subtitle: "Ferrari F40, Nissan GT-R R34 & Porsche 911 Turbo S",
            imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200",
            badgeText: "TOP SPEED",
            linkUrl: "/cars-and-automations",
          },
          {
            id: "tb-3",
            title: "Interstellar Gargantua Sci-Fi Tribute",
            subtitle: "Minimalist Cult Cinema Prints",
            imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200",
            badgeText: "BESTSELLER",
            linkUrl: "/movies",
          },
        ];
        setTrendingBannersList(defaultBanners);
        localStorage.setItem("maja_trending_banners", JSON.stringify(defaultBanners));
      }

      const savedPosters = localStorage.getItem("maja_posters_list");
      if (savedPosters) {
        try {
          setPostersList(JSON.parse(savedPosters));
        } catch (e) { }
      } else {
        localStorage.setItem("maja_posters_list", JSON.stringify(initialPosters));
      }

      // Always build the authoritative categories list by merging DB categories
      // (which have real UUIDs from initialCategories) over any locally-created ones.
      // This ensures stale local-only entries (e.g. cat-1785...) are replaced by
      // real DB records on every page load, so poster submissions never fail UUID checks.
      const UUID_REGEX_LOADER = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      const seenSlugs = new Set<string>();
      const seenNames = new Set<string>();
      const merged: CategoryItem[] = [];

      // 1. Add real DB categories first (they win over any local copies)
      (initialCategories || []).forEach(cat => {
        const updatedCat = { ...cat };
        if (cat.slug === "sports" || cat.name.toLowerCase().includes("sports")) {
          updatedCat.name = "Sports";
          updatedCat.slug = "sports";
        }
        const slugKey = updatedCat.slug.toLowerCase();
        const nameKey = updatedCat.name.toLowerCase();
        if (!seenSlugs.has(slugKey) && !seenNames.has(nameKey)) {
          seenSlugs.add(slugKey);
          seenNames.add(nameKey);
          merged.push(updatedCat);
        }
      });

      // 2. Add any locally-created categories that don't exist in DB yet
      const savedCategories = localStorage.getItem("maja_categories_list");
      if (savedCategories) {
        try {
          const localCats: CategoryItem[] = JSON.parse(savedCategories);
          localCats.forEach(cat => {
            const slugKey = cat.slug.toLowerCase();
            const nameKey = cat.name.toLowerCase();
            // Only include local-only entries (non-UUID ids) that aren't already covered by DB
            if (!seenSlugs.has(slugKey) && !seenNames.has(nameKey) && !UUID_REGEX_LOADER.test(cat.id)) {
              seenSlugs.add(slugKey);
              seenNames.add(nameKey);
              merged.push(cat);
            }
          });
        } catch (e) { }
      }

      setCategoriesList(merged);
      localStorage.setItem("maja_categories_list", JSON.stringify(merged));

      const savedSubTopics = localStorage.getItem("maja_subtopics_list");
      if (savedSubTopics) {
        try {
          setSubTopicsList(JSON.parse(savedSubTopics));
        } catch (e) { }
      } else {
        localStorage.setItem("maja_subtopics_list", JSON.stringify(DEFAULT_SUBTOPICS));
      }

      const savedOrders = localStorage.getItem("maja_orders_list");
      if (savedOrders) {
        try {
          setOrdersList(JSON.parse(savedOrders));
        } catch (e) { }
      }
    }
  }, [initialPosters, initialCategories]);

  // Synchronize changes to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("maja_trending_banners", JSON.stringify(trendingBannersList));
    }
  }, [trendingBannersList]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("maja_posters_list", JSON.stringify(postersList));
    }
  }, [postersList]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("maja_categories_list", JSON.stringify(categoriesList));
    }
  }, [categoriesList]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("maja_subtopics_list", JSON.stringify(subTopicsList));
    }
  }, [subTopicsList]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("maja_orders_list", JSON.stringify(ordersList));
    }
  }, [ordersList]);

  // Keep newSTCategory parent category dropdown selection in sync with categoriesList
  useEffect(() => {
    if (categoriesList.length > 0) {
      const exists = categoriesList.some((c) => c.slug === newSTCategory);
      if (!exists) {
        setNewSTCategory(categoriesList[0].slug);
      }
    }
  }, [categoriesList, newSTCategory]);

  // Fetch delivery zones and default select the first active zone
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch("/api/delivery-zones");
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setAvailableZones(data.data);
          const activeZones = data.data.filter((z: any) => z.active);
          if (activeZones.length > 0) {
            setSelectedZone(activeZones[0]);
            const activeOpts = activeZones[0].shippingOptions?.filter((o: any) => o.active) || [];
            if (activeOpts.length > 0) {
              setSelectedShippingOption(activeOpts[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load delivery zones:", err);
      }
    };
    fetchZones();
  }, []);

  const handleZoneChange = (zoneId: string) => {
    const zone = availableZones.find((z) => z.id === zoneId);
    if (zone) {
      setSelectedZone(zone);
      const activeOpts = zone.shippingOptions?.filter((o: any) => o.active) || [];
      if (activeOpts.length > 0) {
        setSelectedShippingOption(activeOpts[0]);
      } else {
        setSelectedShippingOption(null);
      }
    }
  };

  // Prefill shipping form when accessing checkout step if user is logged in
  useEffect(() => {
    if (checkoutStep === "SHIPPING" && currentUser) {
      const userDetails = usersList.find(u => u.email === currentUser.email);
      if (userDetails) {
        setCheckoutName(userDetails.name || "");
        setCheckoutEmail(userDetails.email || "");
        setCheckoutPhone(userDetails.phone || "");
        setCheckoutAddress(userDetails.address || "");
      } else {
        setCheckoutName(currentUser.name || "");
        setCheckoutEmail(currentUser.email || "");
      }
    }
  }, [checkoutStep, currentUser, usersList]);

  // Navigation helpers
  const navigateToSubTopic = (st: SubTopic) => {
    setSelectedCategory(st.categorySlug);
    setSelectedSubTopic(st.slug);
    setActiveTab("CATALOG");
    setOpenMegaMenu(null);
  };
  const navigateToCategory = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedSubTopic(null);
    setActiveTab("CATALOG");
    setOpenMegaMenu(null);
  };
  const getSubTopics = (catSlug: string) => {
    const forCat = subTopicsList.filter((st) => st.categorySlug === catSlug);
    // Deduplicate by slug — merge posterIds from duplicates into the first occurrence
    const seen = new Map<string, SubTopic>();
    forCat.forEach((st) => {
      const key = st.slug;
      if (seen.has(key)) {
        const existing = seen.get(key)!;
        // Merge poster IDs, keeping unique ones
        const merged = Array.from(new Set([...existing.posterIds, ...st.posterIds]));
        seen.set(key, { ...existing, posterIds: merged });
      } else {
        seen.set(key, { ...st });
      }
    });
    return Array.from(seen.values());
  };
  const currentSubTopic = selectedSubTopic ? (getSubTopics(selectedCategory || "").find((st) => st.slug === selectedSubTopic) || subTopicsList.find((st) => st.slug === selectedSubTopic) || null) : null;
  const currentCategory = selectedCategory ? categoriesList.find((c) => c.slug === selectedCategory) || null : null;
  const getHeroImageUrl = (index: number) => {
    if (trendingBannersList && trendingBannersList.length > 0) {
      const banner = trendingBannersList[index % trendingBannersList.length];
      return banner.imageUrl;
    }
    return `/assets/images/hero-${(index % 7) + 1}.png`;
  };

  const getHeroImageAlt = (index: number) => {
    if (trendingBannersList && trendingBannersList.length > 0) {
      const banner = trendingBannersList[index % trendingBannersList.length];
      return banner.title;
    }
    return `Mock Hero ${index + 1}`;
  };

  const filteredPosters = useMemo(() => {
    const list = postersList.filter((p) => {
      if (selectedSubTopic && currentSubTopic) {
        if (currentSubTopic.posterIds.length > 0) return currentSubTopic.posterIds.includes(p.id);
        return !selectedCategory || p.category?.slug === selectedCategory;
      }
      const matchesCategory = !selectedCategory || p.category?.slug === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (!selectedCategory && !selectedSubTopic && !searchQuery.trim()) {
      return list.filter((p) => (p as any).isTrending === true);
    }
    return list;
  }, [postersList, selectedCategory, selectedSubTopic, currentSubTopic, searchQuery]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Returns a deterministic fallback price based on poster id so every poster is purchasable
  const getEffectivePrice = (poster: PosterItem) => {
    const base = poster.basePrice || 0;
    const offer = poster.offerPrice || 0;
    if (base > 0) return { base, offer: offer > 0 ? offer : null };
    // Seed a pseudo-random price from poster id characters
    const seed = poster.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const prices = [399, 449, 499, 549, 599, 649, 699, 749, 799, 849, 899, 949, 999];
    const offerPrices = [249, 299, 349, 399, 429, 449, 499, 549, 599, 649, 699, 749, 799];
    return { base: prices[seed % prices.length], offer: offerPrices[seed % offerPrices.length] };
  };

  const addToCart = (poster: PosterItem, size = "A4", frame = false) => {
    setCartAnimatingId(poster.id);
    setTimeout(() => setCartAnimatingId(null), 600);
    setCart((prev) => {
      const existing = prev.find((item) => item.poster.id === poster.id && item.size === size && item.frame === frame);
      if (existing) {
        return prev.map((item) =>
          item.poster.id === poster.id && item.size === size && item.frame === frame
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { poster, quantity: 1, size, frame }];
    });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setCartToast(poster.title);
    toastTimerRef.current = setTimeout(() => setCartToast(null), 2500);
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) => (i === idx ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const triggerCelebration = () => {
    setShowCelebrationBallpit(true);
    setTimeout(() => {
      setShowCelebrationBallpit(false);
    }, 5000);
  };

  // Unified Single Login Handler
  const handleSingleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailClean = loginEmail.toLowerCase().trim();
    const isAdmin = emailClean === "admin@posterstore.com" || emailClean.includes("admin");

    try {
      const res = await signIn("credentials", {
        email: emailClean,
        password: loginPassword,
        userType: isAdmin ? "ADMIN" : "CUSTOMER",
        redirect: false,
      });

      if (res?.error) {
        setLoginError(res.error === "CredentialsSignin" ? "Invalid email or password combination." : res.error);
        return;
      }

      if (isAdmin) {
        setCurrentUser({ name: "Super Admin", email: "admin@posterstore.com", role: "ADMIN" });
        setViewMode("ADMIN_CMS");
      } else {
        const userFound = usersList.find(
          (u) => u.email.toLowerCase().trim() === emailClean && u.password === loginPassword
        );
        setCurrentUser({
          name: userFound?.name || "Demo Customer",
          email: emailClean,
          role: "CUSTOMER",
        });
        setViewMode("STOREFRONT");
      }
      setIsAuthModalOpen(false);
      triggerCelebration();
    } catch (err: any) {
      setLoginError(err.message || "Failed to sign in");
    }
  };

  // Unified Single Signup Handler
  const handleSingleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailClean = signupEmail.toLowerCase().trim();

    if (signupPassword !== signupConfirmPassword) {
      setLoginError("Passwords do not match. Please verify.");
      return;
    }

    if (usersList.some((u) => u.email.toLowerCase().trim() === emailClean) || emailClean === "admin@posterstore.com") {
      setLoginError("An account with this email address already exists.");
      return;
    }

    const newUser = {
      name: signupName,
      email: emailClean,
      password: signupPassword,
      phone: signupPhone,
      address: signupAddress,
    };

    setUsersList((prev) => [...prev, newUser]);

    // Log in immediately
    setCurrentUser({ name: signupName, email: emailClean, role: "CUSTOMER" });
    setViewMode("STOREFRONT");
    setIsAuthModalOpen(false);
    triggerCelebration();

    // Reset signup inputs
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupConfirmPassword("");
    setSignupPhone("");
    setSignupAddress("");
  };

  // Handle 5MB to 50MB Artwork File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    setUploadSuccess(false);

    if (!file) return;

    const minBytes = 5 * 1024 * 1024; // 5MB
    const maxBytes = 50 * 1024 * 1024; // 50MB

    if (file.size < minBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`File size (${mb} MB) is too small. Minimum required size for high-resolution printing is 5 MB.`);
      setArtworkFile(null);
      return;
    }

    if (file.size > maxBytes) {
      const mb = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`File size (${mb} MB) exceeds maximum limit of 50 MB.`);
      setArtworkFile(null);
      return;
    }

    setArtworkFile(file);
    const objectUrl = URL.createObjectURL(file);
    setArtworkPreviewUrl(objectUrl);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artworkFile) {
      setUploadError("Please select a valid artwork file between 5MB and 50MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setArtworkFile(null);
      setArtworkPreviewUrl(null);
      setArtworkTitle("");
    }, 1200);
  };

  const handleOrderTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackOrderNum.trim()) return;

    const query = trackOrderNum.trim().toUpperCase();
    const foundOrder = ordersList.find((o) => o.orderNumber === query);

    if (foundOrder) {
      setTrackedOrder(foundOrder);
    } else {
      setTrackedOrder({
        orderNumber: query,
        status: "PRINTING",
        estimatedDelivery: "Tomorrow, 4:00 PM (Chennai Express)",
        items: [{ title: "Premium Artwork Poster", qty: 1 }],
      });
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderNum = `ORD-PSTR-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: "CONFIRMED",
      estimatedDelivery: selectedShippingOption
        ? `In ${selectedShippingOption.estimatedDays} via ${selectedShippingOption.name}`
        : (selectedZone ? `In ${selectedZone.estimatedDays}` : "3-5 business days"),
      items: cart.map((item) => ({
        title: item.poster.title,
        qty: item.quantity,
        size: item.size,
        frame: item.frame,
      })),
      totalAmount: cartTotal,
      customerDetails: {
        name: checkoutName,
        email: checkoutEmail,
        phone: checkoutPhone,
        address: `${checkoutAddress} (${selectedZone?.name || "Standard Delivery"})`,
        paymentMethod: checkoutPaymentMethod,
      },
    };

    const updatedOrders = [newOrder, ...ordersList];
    setOrdersList(updatedOrders);
    setLastPlacedOrder(newOrder);
    setCart([]);
    setCheckoutStep("SUCCESS");
  };

  const handleCreateCategoryAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatAnimation) return;
    const newSlug = newCatName.toLowerCase().replace(/\s+/g, "-");

    const applyCategory = (dbCat: any) => {
      const newCatObj: CategoryItem = {
        id: dbCat.id,
        name: dbCat.name,
        slug: dbCat.slug,
        description: dbCat.description || newCatDesc || "Dynamic Admin Created Category",
        animation: newCatAnimation,
        imageUrl: dbCat.imageUrl || null,
      };
      // Replace any existing local-only entry with the same slug with the real DB record
      setCategoriesList((prev) => {
        const filtered = prev.filter((c) => c.slug !== dbCat.slug || UUID_REGEX.test(c.id));
        const alreadyHasReal = filtered.some((c) => c.id === dbCat.id);
        return alreadyHasReal ? filtered : [newCatObj, ...filtered];
      });
      setNewSTCategory(newSlug);
      setNewCatName("");
      setNewCatDesc("");
      setNewCatAnimation("card-orbit-3d");
    };

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName,
          slug: newSlug,
          description: newCatDesc || "Dynamic Admin Created Category",
          imageUrl: null,
        }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        // Category created successfully with a real DB UUID
        applyCategory(data.data);
        return;
      }

      // If slug already exists in DB, fetch that existing category and use it
      if (!data.success && (data.error?.includes("already exists") || res.status === 400)) {
        try {
          const fetchRes = await fetch(`/api/categories?search=${encodeURIComponent(newSlug)}&limit=5`);
          const fetchData = await fetchRes.json();
          const existingCat = (fetchData?.items || []).find(
            (c: any) => c.slug === newSlug || c.name.toLowerCase() === newCatName.toLowerCase().trim()
          );
          if (existingCat) {
            applyCategory(existingCat);
            return;
          }
        } catch {
          // Fall through
        }
      }

      alert(`Failed to create category: ${data.error || "Unknown error"}`);
    } catch (err) {
      console.warn("Category DB save failed — DB may be offline.", err);
      // Only create locally if the DB is completely unreachable
      const newCatObj: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: newCatName,
        slug: newSlug,
        description: newCatDesc || "Dynamic Admin Created Category",
        animation: newCatAnimation,
        imageUrl: null,
      };
      setCategoriesList((prev) => [newCatObj, ...prev]);
      setNewSTCategory(newSlug);
      setNewCatName("");
      setNewCatDesc("");
      setNewCatAnimation("card-orbit-3d");
      alert("⚠️ Database unreachable. Category saved locally only — posters cannot be added until DB is connected.");
    }
  };

  const handleDeleteCategoryAdmin = async (id: string) => {
    const cat = categoriesList.find((c) => c.id === id);
    if (!cat) return;

    const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (UUID_REGEX.test(id)) {
      try {
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!data.success) {
          alert(`Failed to delete category: ${data.error || "Unknown error"}`);
          return;
        }
      } catch (err) {
        console.error("Failed to delete category from DB:", err);
        alert("Failed to delete category from database. Please check connection.");
        return;
      }
    }

    setCategoriesList((prev) => prev.filter((c) => c.id !== id));
    setSubTopicsList((prev) => prev.filter((st) => st.categorySlug !== cat.slug));
    if (selectedCategory === cat.slug) {
      setSelectedCategory(null);
      setSelectedSubTopic(null);
    }
  };

  const handleCreateSubTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSTName.trim()) return;

    const newSlug = newSTName.trim().toLowerCase().replace(/\s+/g, "-");

    // Check if a sub-topic with this slug already exists in the same category
    const existing = subTopicsList.find(
      (st) => st.slug === newSlug && st.categorySlug === newSTCategory
    );

    if (existing) {
      // MERGE: update image/description if provided, and open for poster linking
      setSubTopicsList((prev) =>
        prev.map((st) =>
          st.id === existing.id
            ? {
              ...st,
              description: newSTDesc || st.description,
              imageUrl: newSTImageUrl.trim() || st.imageUrl,
            }
            : st
        )
      );
      // Jump straight to editing this sub-topic so user can add posters to it
      setEditingSubTopic({
        ...existing,
        description: newSTDesc || existing.description,
        imageUrl: newSTImageUrl.trim() || existing.imageUrl,
      });
    } else {
      // CREATE: brand new sub-topic
      const st: SubTopic = {
        id: `st-${Date.now()}`,
        name: newSTName.trim(),
        slug: newSlug,
        categorySlug: newSTCategory,
        posterIds: [],
        description: newSTDesc || `${newSTName.trim()} collection`,
        imageUrl: newSTImageUrl.trim() || null,
      };
      setSubTopicsList((prev) => [st, ...prev]);
    }

    setNewSTName("");
    setNewSTDesc("");
    setNewSTImageUrl("");
  };

  const handleDeleteSubTopic = async (id: string) => {
    const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (UUID_REGEX.test(id)) {
      try {
        const res = await fetch(`/api/subcategories/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!data.success) {
          alert(`Failed to delete subcategory: ${data.error || "Unknown error"}`);
          return;
        }
      } catch (err) {
        console.error("Failed to delete subcategory from DB:", err);
        alert("Failed to delete subcategory from database. Please check connection.");
        return;
      }
    }
    setSubTopicsList((prev) => prev.filter((st) => st.id !== id));
    if (editingSubTopic?.id === id) setEditingSubTopic(null);
  };

  const handleTogglePosterInSubTopic = (posterId: string) => {
    if (!editingSubTopic) return;
    const updated = editingSubTopic.posterIds.includes(posterId)
      ? { ...editingSubTopic, posterIds: editingSubTopic.posterIds.filter((id) => id !== posterId) }
      : { ...editingSubTopic, posterIds: [...editingSubTopic.posterIds, posterId] };
    setEditingSubTopic(updated);
    setSubTopicsList((prev) => prev.map((st) => (st.id === updated.id ? updated : st)));
  };

  // Sub-topics in local state may have fake client-generated ids (e.g. "st-2" or
  // "st-1785220123456") instead of real database UUIDs. This regex tells them apart.
  const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  // Once a sub-topic gets a real database id, replace the fake id everywhere it's
  // referenced in local state so future actions reuse the real UUID instead of
  // re-creating a duplicate SubCategory row.
  const syncSubTopicId = (oldId: string, newId: string) => {
    if (oldId === newId) return;
    setSubTopicsList((prev) => prev.map((s) => (s.id === oldId ? { ...s, id: newId } : s)));
    setEditingSubTopic((prev) => (prev && prev.id === oldId ? { ...prev, id: newId } : prev));
  };

  // Ensures the given sub-topic has a real SubCategory row in the database and
  // returns its UUID. If it already has one, returns immediately. Otherwise it
  // looks for an existing matching SubCategory (in case it was created in an
  // earlier attempt), and creates a new one in the DB if none is found.
  const ensureRealSubCategoryId = async (subTopic: SubTopic, categoryId: string): Promise<string> => {
    if (UUID_REGEX.test(subTopic.id)) return subTopic.id;

    // Look for an existing SubCategory with the same slug under this category
    try {
      const lookupRes = await fetch(
        `/api/subcategories?categoryId=${encodeURIComponent(categoryId)}&search=${encodeURIComponent(subTopic.slug)}`
      );
      const lookupData = await lookupRes.json();
      const existing = (lookupData?.items || []).find((sc: any) => sc.slug === subTopic.slug);
      if (existing?.id) {
        syncSubTopicId(subTopic.id, existing.id);
        return existing.id;
      }
    } catch {
      // Lookup failing shouldn't block creation — fall through and try to create.
    }

    // No existing match found — create a real SubCategory row in the database
    const createRes = await fetch("/api/subcategories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        name: subTopic.name,
        slug: subTopic.slug,
        description: subTopic.description || undefined,
        imageUrl: subTopic.imageUrl || undefined,
      }),
    });
    const createData = await createRes.json();
    if (!createData?.success) {
      throw new Error(createData?.error || "Failed to create sub-category in database");
    }
    const realId = createData.data.id;
    syncSubTopicId(subTopic.id, realId);
    return realId;
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.poster.offerPrice || item.poster.basePrice) * item.quantity, 0);
  const cartShipping = selectedShippingOption ? selectedShippingOption.price : (cartSubtotal >= 999 ? 0 : 49);
  const cartGST = Math.round(cartSubtotal * 0.18);
  const cartTotal = cartSubtotal + cartShipping + cartGST;


  const menuItems = useMemo(() => {
    const list = [
      {
        label: "Home",
        ariaLabel: "Go to home page",
        onClick: () => {
          setActiveTab("CATALOG");
          setSelectedCategory(null);
          setSelectedSubTopic(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    ];

    // Add categories
    categoriesList.forEach((cat) => {
      list.push({
        label: cat.name,
        ariaLabel: `View ${cat.name} posters`,
        onClick: () => {
          navigateToCategory(cat.slug);
        }
      });
    });

    // Add Custom Upload
    list.push({
      label: "Custom Poster",
      ariaLabel: "Upload your custom poster",
      onClick: () => {
        setActiveTab("CUSTOM_UPLOAD");
      }
    });

    // Add Track Order
    list.push({
      label: "Track Order",
      ariaLabel: "Track your order status",
      onClick: () => {
        setActiveTab("TRACK_ORDER");
      }
    });

    // Add Wishlist (with count if any)
    list.push({
      label: wishlist.length > 0 ? `Wishlist (${wishlist.length})` : "Wishlist",
      ariaLabel: "Open wishlist drawer",
      onClick: () => {
        setIsWishlistOpen(true);
      }
    });

    // Add Cart (with count if any)
    list.push({
      label: cart.length > 0 ? `Cart (${cart.length})` : "Cart",
      ariaLabel: "Open shopping cart",
      onClick: () => {
        setIsCartOpen(true);
      }
    });

    // Add Profile / Admin link
    if (currentUser) {
      if (currentUser.role === "ADMIN") {
        list.push({
          label: "Admin Panel",
          ariaLabel: "Go to Admin Dashboard",
          onClick: () => {
            setViewMode("ADMIN_CMS");
          }
        });
      }
      list.push({
        label: "Sign Out",
        ariaLabel: "Sign out of your account",
        onClick: () => {
          setCurrentUser(null);
          setViewMode("STOREFRONT");
        }
      });
    } else {
      list.push({
        label: "Sign In",
        ariaLabel: "Login or Sign Up",
        onClick: () => {
          setIsAuthModalOpen(true);
        }
      });
    }

    return list;
  }, [categoriesList, wishlist.length, cart.length, currentUser]);

  const socialItems = [
    { label: "Twitter", link: "https://twitter.com" },
    { label: "GitHub", link: "https://github.com" },
    { label: "LinkedIn", link: "https://linkedin.com" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col antialiased">
      {/* GSAP Staggered Navigation Menu for Mobile/Tablet */}
      {viewMode === "STOREFRONT" && (
        <StaggeredMenu
          className="lg:hidden"
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials
          displayItemNumbering={true}
          menuButtonColor="#ffffff"
          openMenuButtonColor="#000000"
          changeMenuColorOnOpen={true}
          colors={['#B497CF', '#5227FF']}
          logoUrl="/assets/images/logo.png"
          accentColor="#5227FF"
          isFixed={true}
        />
      )}

      {/* Dynamic Mode Bar when logged in as Admin */}
      {currentUser?.role === "ADMIN" && (
        <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white text-xs py-2.5 px-6 flex items-center justify-between border-b border-purple-500/30 w-full max-w-[1400px] mx-auto rounded-b-2xl">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Logged in as <strong>{currentUser.name}</strong> ({currentUser.email})</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === "STOREFRONT" ? "ADMIN_CMS" : "STOREFRONT")}
              className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition-all shadow"
            >
              {viewMode === "STOREFRONT" ? "Switch to Admin CMS Workspace" : "Switch to Customer Storefront View"}
            </button>
            <button
              onClick={async () => {
                await signOut({ redirect: false });
                setCurrentUser(null);
                setViewMode("STOREFRONT");
              }}
              className="p-1 text-slate-300 hover:text-white"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 1: CUSTOMER STOREFRONT MODE                                     */}
      {/* ========================================================================= */}
      {viewMode === "STOREFRONT" && (
        <div className="w-full flex flex-col flex-1">
          {/* Header Navigation Bar */}
          <header className="w-full bg-black text-white border-b border-zinc-800/60 shadow-2xl z-50 relative">
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4 sm:gap-6">
              {/* Logo on Left */}
              <div
                className="flex items-center gap-1.5 sm:gap-2 select-none cursor-pointer flex-shrink-0"
                onClick={() => {
                  if (typeof window !== "undefined" && window.location.pathname !== "/") {
                    window.location.href = "/";
                  } else {
                    setActiveTab("CATALOG");
                    setSelectedCategory(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center bg-white/10 border border-white/20 p-0.5 flex-shrink-0">
                  <img src="/assets/images/logo.png" alt="Maja Posters Logo" className="w-full h-full object-contain" />
                </div>
                <div className="relative h-5 sm:h-6 w-28 sm:w-44 overflow-hidden">
                  <TextPressure
                    text="MAJA POSTERS"
                    flex
                    alpha={false}
                    stroke={false}
                    width
                    weight
                    italic
                    textColor="#ffffff"
                    strokeColor="#5227FF"
                    minFontSize={12}
                  />
                </div>
              </div>

              <div className="hidden lg:flex flex-1 items-center justify-center gap-1 relative">
                {(() => {
                  const gooeyItems = [
                    {
                      label: (
                        <span className="flex items-center gap-1.5">
                          <span className="text-[13px] leading-none">🏠</span>
                          <span>Home</span>
                        </span>
                      ),
                      isActive: !selectedCategory && !selectedSubTopic && activeTab === "CATALOG",
                      onClick: () => {
                        setActiveTab("CATALOG");
                        setSelectedCategory(null);
                        setSelectedSubTopic(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    },
                    ...categoriesList.map((cat) => {
                      const subs = getSubTopics(cat.slug);
                      const isOpen = openMegaMenu === cat.slug;
                      const isActive = selectedCategory === cat.slug;
                      return {
                        label: (
                          <span className="flex items-center gap-1.5">
                            <span>{cat.name}</span>
                            {subs.length > 0 && (
                              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                            )}
                          </span>
                        ),
                        isActive: isActive,
                        onHover: () => {
                          if (megaMenuTimeoutRef.current) {
                            clearTimeout(megaMenuTimeoutRef.current);
                            megaMenuTimeoutRef.current = null;
                          }
                          if (subs.length > 0) setOpenMegaMenu(cat.slug);
                        },
                        onLeave: () => {
                          if (megaMenuTimeoutRef.current) {
                            clearTimeout(megaMenuTimeoutRef.current);
                          }
                          megaMenuTimeoutRef.current = setTimeout(() => {
                            setOpenMegaMenu(prev => prev === cat.slug ? null : prev);
                          }, 150);
                        },
                        onClick: () => {
                          navigateToCategory(cat.slug);
                        },
                        dropdown: isOpen && subs.length > 0 && (
                          <div
                            className="absolute top-full left-0 mt-1 w-64 rounded-2xl shadow-2xl border overflow-hidden z-50"
                            style={{ backgroundColor: "#0D0D0D", borderColor: "rgba(212,255,61,0.2)" }}
                            onMouseEnter={() => {
                              if (megaMenuTimeoutRef.current) {
                                clearTimeout(megaMenuTimeoutRef.current);
                                megaMenuTimeoutRef.current = null;
                              }
                              setOpenMegaMenu(cat.slug);
                            }}
                            onMouseLeave={() => {
                              if (megaMenuTimeoutRef.current) {
                                clearTimeout(megaMenuTimeoutRef.current);
                              }
                              megaMenuTimeoutRef.current = setTimeout(() => {
                                setOpenMegaMenu(null);
                              }, 150);
                            }}
                          >
                            <div className="p-2 space-y-0.5">
                              <button
                                onClick={() => navigateToCategory(cat.slug)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors hover:bg-zinc-800"
                                style={{ color: "#D4FF3D" }}
                              >
                                <Folder className="w-3.5 h-3.5" />
                                All {cat.name}
                              </button>
                              <div className="h-px mx-2" style={{ backgroundColor: "rgba(212,255,61,0.1)" }} />
                              {subs.map((st) => (
                                <button
                                  key={st.id}
                                  onClick={() => navigateToSubTopic(st)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-colors ${selectedSubTopic === st.slug ? "text-black" : "text-zinc-300 hover:text-white hover:bg-zinc-800"}`}
                                  style={selectedSubTopic === st.slug ? { backgroundColor: "#D4FF3D" } : {}}
                                >
                                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                                  <span className="font-semibold">{st.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      };
                    })
                  ];
                  const activeIndex = gooeyItems.findIndex(item => item.isActive);
                  return (
                    <GooeyNav
                      items={gooeyItems}
                      particleCount={15}
                      particleDistances={[90, 10]}
                      particleR={100}
                      initialActiveIndex={activeIndex !== -1 ? activeIndex : 0}
                      animationTime={600}
                      timeVariance={300}
                    />
                  );
                })()}
              </div>

              {/* Right Side Icons exactly like the image with dark theme styling */}
              <div className="flex items-center gap-2 text-white flex-shrink-0">
                {/* Custom Poster Upload button */}
                <button
                  onClick={() => setActiveTab("CUSTOM_UPLOAD")}
                  className={`hidden lg:block text-[11px] font-extrabold px-3.5 py-1.5 rounded-full border transition-all ${activeTab === "CUSTOM_UPLOAD" ? "text-black border-transparent" : "text-white border-zinc-700 hover:border-[#D4FF3D] hover:text-[#D4FF3D]"}`}
                  style={activeTab === "CUSTOM_UPLOAD" ? { backgroundColor: '#D4FF3D' } : {}}
                >
                  Custom Poster
                </button>

                {/* Track Order button */}
                <button
                  onClick={() => setActiveTab("TRACK_ORDER")}
                  className={`hidden lg:block text-[11px] font-extrabold px-3.5 py-1.5 rounded-full border transition-all ${activeTab === "TRACK_ORDER" ? "text-black border-transparent" : "text-white border-zinc-700 hover:border-[#D4FF3D] hover:text-[#D4FF3D]"}`}
                  style={activeTab === "TRACK_ORDER" ? { backgroundColor: '#D4FF3D' } : {}}
                >
                  Track Order
                </button>

                {/* Inline compact search */}
                <div
                  className={`flex items-center gap-2 rounded-full border transition-all duration-300 overflow-hidden mr-16 lg:mr-0 ${isSearchExpanded
                      ? "bg-zinc-900 border-zinc-700 px-3 py-1.5 w-[220px]"
                      : "bg-transparent border-transparent px-1 py-1 w-8"
                    }`}
                >
                  <button
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className="flex-shrink-0 transition-colors"
                    style={{ color: isSearchExpanded ? '#D4FF3D' : 'white' }}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {isSearchExpanded && (
                    <>
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (activeTab !== "CATALOG") setActiveTab("CATALOG");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setIsSearchExpanded(false);
                            setSearchQuery("");
                          }
                        }}
                        placeholder="Search prints..."
                        className="flex-1 bg-transparent text-[11px] focus:outline-none text-white placeholder:text-zinc-500 min-w-0"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="flex-shrink-0 text-zinc-500 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                <button
                  onClick={async () => {
                    if (currentUser) {
                      if (currentUser.role === "ADMIN") {
                        setViewMode("ADMIN_CMS");
                      } else {
                        const confirmLogout = window.confirm(`Logged in as ${currentUser.name} (${currentUser.email}). Click OK to Sign Out.`);
                        if (confirmLogout) {
                          await signOut({ redirect: false });
                          setCurrentUser(null);
                          setViewMode("STOREFRONT");
                        }
                      }
                    } else {
                      setIsAuthModalOpen(true);
                    }
                  }}
                  className="hidden lg:flex p-1 rounded-full hover:bg-zinc-800 transition-colors items-center justify-center flex-shrink-0"
                  title={currentUser ? `Logged in as ${currentUser.name}. Click to logout.` : "Sign In / Sign Up"}
                >
                  {currentUser ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] tracking-wider transition-all select-none" style={{ backgroundColor: "#D4FF3D", color: "#0D0D0D" }}>
                      {getUserInitials(currentUser.name)}
                    </div>
                  ) : (
                    <div className="p-1.5 text-white">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </button>

                {/* Wishlist Heart Icon */}
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className="hidden lg:flex p-2.5 rounded-full hover:bg-zinc-800 text-white relative transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  {wishlist.length > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center absolute -top-0.5 -right-0.5 animate-pulse">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                {/* Cart Bag Icon */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="hidden lg:flex p-2.5 rounded-full hover:bg-zinc-800 text-white relative transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cart.length > 0 && (
                    <span className="text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center absolute -top-0.5 -right-0.5 animate-pulse" style={{ backgroundColor: '#D4FF3D', color: '#0D0D0D' }}>
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* ── Chennai-Only Delivery Notice (Homepage only, dismissible) ── */}
          {!selectedCategory && !selectedSubTopic && activeTab === "CATALOG" && !isChennaiNoticeDismissed && (
            <div
              className="w-full border-b border-t-0 text-xs font-semibold text-white/90 z-40"
              style={{ backgroundColor: "rgba(212,255,61,0.08)", borderColor: "rgba(212,255,61,0.25)" }}
            >
              <div className="w-full max-w-[1400px] mx-auto px-6 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base flex-shrink-0">📦</span>
                  <span className="leading-snug">
                    <span className="font-extrabold" style={{ color: "#D4FF3D" }}>Delivery Notice: </span>
                    We currently deliver only within <span className="font-extrabold text-white">Chennai</span> — more cities coming soon!
                  </span>
                </div>
                <button
                  onClick={() => setIsChennaiNoticeDismissed(true)}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors ml-2"
                  aria-label="Dismiss notice"
                >
                  <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.5)" }} />
                </button>
              </div>
            </div>
          )}

          {/* Breadcrumb Navigation Bar */}
          {(selectedCategory || selectedSubTopic) && activeTab === "CATALOG" && (
            <div className="w-full max-w-[1400px] mx-auto px-6 mt-6">
              <nav className="flex items-center gap-2 text-xs px-2 py-1" aria-label="Breadcrumb">
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedSubTopic(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="flex items-center gap-1 font-bold transition-colors hover:text-[#D4FF3D] text-zinc-400"
                >
                  <span className="text-[12px]">🏠</span>
                  <span>Home</span>
                </button>
                <span className="text-zinc-700">›</span>
                <button
                  onClick={() => { setSelectedCategory(null); setSelectedSubTopic(null); }}
                  className="font-semibold transition-colors hover:text-[#D4FF3D]"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >All Prints</button>
                {selectedCategory && (
                  <>
                    <ChevronRight className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <button
                      onClick={() => { setSelectedSubTopic(null); }}
                      className={`font-bold transition-colors ${selectedSubTopic ? "hover:text-[#D4FF3D]" : ""}`}
                      style={{ color: selectedSubTopic ? "rgba(255,255,255,0.5)" : "#D4FF3D" }}
                    >
                      {currentCategory?.name || selectedCategory}
                    </button>
                  </>
                )}
                {currentSubTopic && (
                  <>
                    <ChevronRight className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <span className="font-extrabold" style={{ color: "#D4FF3D" }}>{currentSubTopic.name}</span>
                  </>
                )}
                {/* Sub-topic pill navigation strip */}
                {selectedCategory && !selectedSubTopic && getSubTopics(selectedCategory).length > 0 && (
                  <div className="flex items-center gap-1.5 ml-4 flex-wrap">
                    {getSubTopics(selectedCategory).map((st) => (
                      <button
                        key={st.id}
                        onClick={() => navigateToSubTopic(st)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold transition-all hover:scale-105"
                        style={{ backgroundColor: "rgba(212,255,61,0.08)", color: "#D4FF3D", border: "1px solid rgba(212,255,61,0.2)" }}
                      >{st.name}</button>
                    ))}
                  </div>
                )}
              </nav>
            </div>
          )}

          {/* Add-to-Cart Toast Notification */}
          {cartToast && (
            <div
              className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom-4 duration-300"
              style={{ backgroundColor: "#0D0D0D", color: "#D4FF3D", border: "1px solid rgba(212,255,61,0.3)", minWidth: "220px" }}
            >
              <span className="text-base">✅</span>
              <div>
                <p className="text-[11px] font-extrabold" style={{ color: "#D4FF3D" }}>Added to Cart!</p>
                <p className="text-[10px] font-normal text-zinc-400 truncate max-w-[160px]">{cartToast}</p>
              </div>
              <button onClick={() => setCartToast(null)} className="ml-auto text-zinc-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STOREFRONT MAIN CONTENT */}
          <main className="w-full flex-1">
            {activeTab === "CATALOG" && (
              <>
                {/* Redesigned Hero Section — only shown on All Prints */}
                {!selectedCategory && !selectedSubTopic && (
                  <section className="relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[420px] sm:min-h-[550px] w-full bg-black pt-8 pb-12 sm:pt-0 sm:pb-0">
 
                    {/* Entire Background Hyperspeed WebGL Animation */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                      <Hyperspeed
                        effectOptions={hyperspeedOptions}
                      />
                    </div>
 
                    {/* Dark gradient overlay to ensure text readability */}
                    <div className="absolute inset-0 z-[5] bg-gradient-to-b from-black via-black/40 to-black/80 pointer-events-none" />

                    {/* Centered Hero Text Container */}
                    <div className="relative z-10 space-y-5 sm:space-y-6 max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-sm" style={{ backgroundColor: 'rgba(212,255,61,0.15)', color: '#D4FF3D', border: '1px solid rgba(212,255,61,0.4)' }}>
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                        <span>Museum-Grade Premium Posters</span>
                      </div>
 
                      <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-center max-w-xl sm:max-w-2xl mx-auto">
                        Transform Your Space with{" "}
                        <span className="inline-flex justify-center min-w-[110px] sm:min-w-[160px] align-middle">
                          <TextRotate
                            texts={[
                              "anime",
                              "sports",
                              "movies",
                              "web series",
                              "k-pop",
                              "cars and bikes",
                              "songs and creators"
                            ]}
                            mainClassName="inline-flex justify-center font-extrabold text-[#D4FF3D]"
                            staggerDuration={0.02}
                            rotationInterval={2000}
                          />
                        </span>{" "}
                        Wall Prints
                      </h1>
 
                      <p className="text-zinc-400 text-xs sm:text-base leading-relaxed max-w-lg sm:max-w-xl text-center">
                        Shop premium high-res posters or upload your custom design (5MB–50MB). Printed on 300 GSM matte archive paper with matte black wooden frame choices.
                      </p>
 
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-6 sm:px-0 pt-2">
                        <button
                          onClick={() => {
                            document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105" style={{ backgroundColor: '#D4FF3D', color: '#0D0D0D' }}
                        >
                          <span>Shop Posters</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveTab("CUSTOM_UPLOAD")}
                          className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 hover:scale-105 text-white" style={{ border: '2px solid rgba(255,255,255,0.7)', backgroundColor: 'transparent' }}
                        >
                          <UploadCloud className="w-4 h-4 text-white" />
                          <span>Upload Your Poster</span>
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                 {/* Catalog Section & Other Sections Wrapper */}
                <div className="w-full max-w-[1400px] mx-auto px-6 mt-8 sm:mt-16 space-y-10 sm:space-y-16 pb-16">
                  <div id="catalog-section" className="space-y-6 scroll-mt-24">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
                          {currentSubTopic
                            ? `${currentSubTopic.name} Prints`
                            : selectedCategory
                              ? `${selectedCategory.toUpperCase()} Prints`
                              : "Trending Prints"}
                          <span className="inline-block h-1 w-12 rounded-full" style={{ backgroundColor: '#D4FF3D' }}></span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Showing {filteredPosters.length} premium designs</p>
                      </div>
 
                      {!selectedCategory && currentUser?.role === "ADMIN" && (
                        <button
                          onClick={() => {
                            setViewMode("ADMIN_CMS");
                            setAdminTab("TRENDING");
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-transform hover:scale-105"
                        >
                          <Flame className="w-4 h-4 fill-current" />
                          <span>⚡ Edit Trending Section in CMS</span>
                        </button>
                      )}
                    </div>
 
                    {/* Category Sub-Topics Spotlight Grid */}
                    {selectedCategory && !selectedSubTopic && getSubTopics(selectedCategory).length > 0 && (
                      <div className="space-y-4 py-2 border-b border-border/40 pb-6 mb-6">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4FF3D]">Explore sub-categories</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {getSubTopics(selectedCategory).map((st) => (
                            <div
                              key={st.id}
                              onClick={() => navigateToSubTopic(st)}
                              className="bg-card/50 hover:bg-card border border-border/80 hover:border-[#D4FF3D] p-3 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center text-center space-y-3 group"
                            >
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                                {st.imageUrl ? (
                                  <Image src={st.imageUrl} alt={st.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-lg text-zinc-500 font-bold bg-muted/20">📂</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-[11px] text-foreground group-hover:text-[#D4FF3D] transition-colors truncate max-w-[140px]">{st.name}</h4>
                                <p className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">{st.description || "Explore prints"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
 
                    {!selectedCategory ? (
                      filteredPosters.length > 0 ? (
                        /* Infinite Horizontal Marquee for Trending Prints */
                        <ScrollReveal>
                          <div className="w-full overflow-hidden relative py-4 border-y border-border/30 bg-muted/10">
                            {/* Blur layout covers */}
                            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
 
                            <div className="flex animate-marquee hover:[animation-play-state:paused] gap-6">
                              {/* Duplicate posters once for seamless looping */}
                              {[...filteredPosters, ...filteredPosters].map((poster, index) => (
                                <div
                                  key={`${poster.id}-${index}`}
                                  className={`w-[240px] flex-shrink-0 bg-card rounded-2xl overflow-hidden border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between ${cartAnimatingId === poster.id ? "scale-105 border-[#D4FF3D] ring-2 ring-[#D4FF3D]/20 animate-pulse" : "border-border/80"}`}
                                >
                                  <div className="relative w-full h-[220px] sm:h-[240px] bg-muted overflow-hidden flex items-center justify-center">
                                    {poster.images?.[0]?.url ? (
                                      <Image
                                        src={poster.images[0].url}
                                        alt={poster.title}
                                        fill
                                        sizes="240px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-50 flex flex-col items-center justify-center p-4 text-center">
                                        <Package className="w-8 h-8 text-zinc-300 mb-2" />
                                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">CMS Artwork Loaded</span>
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => toggleWishlist(poster.id)}
                                      className="absolute top-3 right-3 p-2.5 rounded-full bg-background/80 text-foreground hover:text-rose-500 transition-colors shadow-md z-10"
                                    >
                                      <Heart className={`w-4 h-4 ${wishlist.includes(poster.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                                    </button>

                                    {/* Quick View Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                      <button
                                        onClick={() => setSelectedPoster(poster)}
                                        className="px-4 py-2 bg-white text-black font-bold text-xs rounded-full flex items-center gap-1.5 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Quick View</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="p-4 space-y-2 text-xs">
                                    <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: '#D4FF3D' }}>
                                      {poster.category?.name || "Premium Print"}
                                    </span>
                                    <h3
                                      onClick={() => setSelectedPoster(poster)}
                                      className="font-bold text-sm text-foreground line-clamp-1 cursor-pointer transition-colors hover:text-[#D4FF3D]"
                                    >
                                      {poster.title}
                                    </h3>

                                    {/* Rating Placeholder */}
                                    <div className="flex items-center gap-1 text-amber-400">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                                      ))}
                                      <span className="text-[10px] text-muted-foreground ml-1">(4.9)</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                      <div className="flex items-baseline gap-2">
                                        <span className="font-extrabold text-sm text-foreground">
                                          {formatCurrency(poster.offerPrice || poster.basePrice)}
                                        </span>
                                        {poster.offerPrice && (
                                          <span className="text-[10px] text-muted-foreground line-through">
                                            {formatCurrency(poster.basePrice)}
                                          </span>
                                        )}
                                      </div>

                                      {(() => {
                                        const cartItem = cart.find(item => item.poster.id === poster.id);
                                        const quantityInCart = cartItem ? cartItem.quantity : 0;
                                        if (quantityInCart > 0) {
                                          const itemIdx = cart.findIndex(item => item.poster.id === poster.id);
                                          return (
                                            <div className="flex items-center gap-1 bg-[#D4FF3D]/10 rounded-xl border border-[#D4FF3D]/30 p-0.5 flex-shrink-0 z-10 relative">
                                              <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); updateCartQty(itemIdx, -1); }}
                                                className="w-5 h-5 rounded-md bg-[#D4FF3D] hover:bg-[#D4FF3D]/80 flex items-center justify-center font-bold text-[#0D0D0D] transition-colors"
                                              >
                                                <Minus className="w-2.5 h-2.5" />
                                              </button>
                                              <span className="font-extrabold text-[10px] text-[#D4FF3D] min-w-[12px] text-center">{quantityInCart}</span>
                                              <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); updateCartQty(itemIdx, 1); }}
                                                className="w-5 h-5 rounded-md bg-[#D4FF3D] hover:bg-[#D4FF3D]/80 flex items-center justify-center font-bold text-[#0D0D0D] transition-colors"
                                              >
                                                <Plus className="w-2.5 h-2.5" />
                                              </button>
                                            </div>
                                          );
                                        }
                                        return (
                                          <button
                                            onClick={() => addToCart(poster)}
                                            className="px-3.5 py-2 rounded-xl font-bold text-[10px] shadow-sm transition-all hover:scale-105" style={{ backgroundColor: '#D4FF3D', color: '#0D0D0D' }}
                                          >
                                            Add to Cart
                                          </button>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </ScrollReveal>
                      ) : (
                        <div className="p-12 rounded-2xl border border-dashed border-border/60 bg-card/30 text-center space-y-3">
                          <Flame className="w-10 h-10 text-rose-500/50 mx-auto" />
                          <h4 className="font-extrabold text-base text-foreground">No Trending Prints Selected</h4>
                          <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            {currentUser?.role === "ADMIN"
                              ? "Go to Admin CMS -> Edit Trending Images to select and mark posters as Trending for visitors."
                              : "Weekly trending prints are being curated. Browse our category collections above to explore prints!"}
                          </p>
                          {currentUser?.role === "ADMIN" && (
                            <button
                              onClick={() => {
                                setViewMode("ADMIN_CMS");
                                setAdminTab("TRENDING");
                              }}
                              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow"
                            >
                              <Flame className="w-4 h-4 fill-current" />
                              <span>Select Trending Prints in CMS</span>
                            </button>
                          )}
                        </div>
                      )
                    ) : selectedCategory === "sports" ? (
                      /* 3D Circular Gallery WebGL Animation exclusively for Sports Category */
                      <div className="w-full space-y-8 py-4">
                        <div className="text-center space-y-1">
                          <h3 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
                            SPORTS LEGENDS CIRCULAR GALLERY
                          </h3>
                          <p className="text-xs text-muted-foreground font-bold">
                            Drag or scroll horizontally to spin the 3D Sports Gallery
                          </p>
                        </div>
                        <div style={{ height: "600px", position: "relative" }} className="w-full rounded-3xl overflow-hidden border border-zinc-800 bg-black/60 backdrop-blur-xl">
                          <CircularGallery
                            items={filteredPosters.map((p) => ({
                              image: p.images?.[0]?.url || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
                              text: p.title,
                            }))}
                            bend={1}
                            textColor="#ffffff"
                            borderRadius={0.05}
                            scrollEase={0.05}
                            font="bold 30px Orbitron"
                            scrollSpeed={2}
                          />
                        </div>
                        {/* Buyable poster grid below the 3D gallery */}
                        {filteredPosters.length > 0 && (
                          <div className="space-y-4">
                            <p className="text-xs uppercase tracking-widest font-extrabold text-zinc-500">Shop Sports Prints</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {filteredPosters.map((poster) => {
                                const { base, offer } = getEffectivePrice(poster);
                                const cartItem = cart.find(i => i.poster.id === poster.id);
                                const qty = cartItem ? cartItem.quantity : 0;
                                const idx = cart.findIndex(i => i.poster.id === poster.id);
                                return (
                                  <div key={poster.id} className={`bg-zinc-950 rounded-2xl overflow-hidden border group hover:-translate-y-1 transition-all duration-300 ${cartAnimatingId === poster.id ? "border-[#D4FF3D] ring-2 ring-[#D4FF3D]/20" : "border-zinc-800"}`}>
                                    <div className="relative aspect-square overflow-hidden">
                                      {poster.images?.[0]?.url ? (
                                        <Image src={poster.images[0].url} alt={poster.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                      ) : (
                                        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-zinc-700 text-xs font-bold">No Image</div>
                                      )}
                                      <button type="button" onClick={() => toggleWishlist(poster.id)} className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:text-rose-500 transition-colors">
                                        <Heart className={`w-3.5 h-3.5 ${wishlist.includes(poster.id) ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                                      </button>
                                    </div>
                                    <div className="p-3 space-y-2">
                                      <h4 onClick={() => setSelectedPoster(poster)} className="font-bold text-xs text-white line-clamp-1 cursor-pointer hover:text-[#D4FF3D] transition-colors">{poster.title}</h4>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-1.5">
                                          <span className="font-extrabold text-sm text-white">₹{offer ?? base}</span>
                                          {offer && <span className="text-[10px] text-zinc-500 line-through">₹{base}</span>}
                                        </div>
                                        {qty > 0 ? (
                                          <div className="flex items-center gap-1 bg-[#D4FF3D]/10 rounded-lg border border-[#D4FF3D]/30 p-0.5">
                                            <button onClick={() => updateCartQty(idx, -1)} className="w-5 h-5 rounded bg-[#D4FF3D] text-black font-bold flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></button>
                                            <span className="text-[10px] font-extrabold text-[#D4FF3D] min-w-[12px] text-center">{qty}</span>
                                            <button onClick={() => updateCartQty(idx, 1)} className="w-5 h-5 rounded bg-[#D4FF3D] text-black font-bold flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></button>
                                          </div>
                                        ) : (
                                          <button onClick={() => { const p2 = { ...poster, basePrice: base, offerPrice: offer }; addToCart(p2); }} className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold hover:opacity-90 transition-all" style={{ backgroundColor: '#D4FF3D', color: '#0D0D0D' }}>Add to Cart</button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : selectedCategory === "movies" ? (
                      /* 3D Particle Sphere with Orbiting Images for Movies Category */
                      <div className="w-full space-y-8">
                        <MovieSphereCanvas
                          posters={filteredPosters}
                          onSelectPoster={setSelectedPoster}
                          title="Movies Universe 3D"
                        />
                        {filteredPosters.length > 0 && (
                          <div className="space-y-4">
                            <p className="text-xs uppercase tracking-widest font-extrabold text-zinc-500">Shop Movie Prints</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {filteredPosters.map((poster) => {
                                const { base, offer } = getEffectivePrice(poster);
                                const cartItem = cart.find(i => i.poster.id === poster.id);
                                const qty = cartItem ? cartItem.quantity : 0;
                                const idx = cart.findIndex(i => i.poster.id === poster.id);
                                return (
                                  <div key={poster.id} className={`bg-zinc-950 rounded-2xl overflow-hidden border group hover:-translate-y-1 transition-all duration-300 ${cartAnimatingId === poster.id ? "border-[#D4FF3D] ring-2 ring-[#D4FF3D]/20" : "border-zinc-800"}`}>
                                    <div className="relative aspect-square overflow-hidden">
                                      {poster.images?.[0]?.url ? (
                                        <Image src={poster.images[0].url} alt={poster.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                      ) : (
                                        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-zinc-700 text-xs font-bold">No Image</div>
                                      )}
                                      <button type="button" onClick={() => toggleWishlist(poster.id)} className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:text-rose-500 transition-colors">
                                        <Heart className={`w-3.5 h-3.5 ${wishlist.includes(poster.id) ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                                      </button>
                                    </div>
                                    <div className="p-3 space-y-2">
                                      <h4 onClick={() => setSelectedPoster(poster)} className="font-bold text-xs text-white line-clamp-1 cursor-pointer hover:text-[#D4FF3D] transition-colors">{poster.title}</h4>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-1.5">
                                          <span className="font-extrabold text-sm text-white">₹{offer ?? base}</span>
                                          {offer && <span className="text-[10px] text-zinc-500 line-through">₹{base}</span>}
                                        </div>
                                        {qty > 0 ? (
                                          <div className="flex items-center gap-1 bg-[#D4FF3D]/10 rounded-lg border border-[#D4FF3D]/30 p-0.5">
                                            <button onClick={() => updateCartQty(idx, -1)} className="w-5 h-5 rounded bg-[#D4FF3D] text-black font-bold flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></button>
                                            <span className="text-[10px] font-extrabold text-[#D4FF3D] min-w-[12px] text-center">{qty}</span>
                                            <button onClick={() => updateCartQty(idx, 1)} className="w-5 h-5 rounded bg-[#D4FF3D] text-black font-bold flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></button>
                                          </div>
                                        ) : (
                                          <button onClick={() => { const p2 = { ...poster, basePrice: base, offerPrice: offer }; addToCart(p2); }} className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold hover:opacity-90 transition-all" style={{ backgroundColor: '#D4FF3D', color: '#0D0D0D' }}>Add to Cart</button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (selectedCategory === "k-pop" || selectedCategory === "anime") ? (
                      /* Circular Gallery for K-Pop & Anime Categories */
                      <div className="w-full flex flex-col items-center justify-center py-12 overflow-hidden min-h-[600px] relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                          <h3 className="text-3xl md:text-5xl font-black text-center uppercase tracking-tighter" style={{ color: "#D4FF3D", textShadow: "0 0 20px rgba(212,255,61,0.2)" }}>
                            {currentSubTopic
                              ? `${currentSubTopic.name} Spotlight`
                              : selectedCategory === "k-pop"
                                ? "K-POP SPOTLIGHT"
                                : "ANIME SPOTLIGHT"}
                          </h3>
                          <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-bold mt-2">
                            Hover Cards to Flip & Explore
                          </p>
                        </div>

                        <div
                          ref={galleryRef}
                          className="relative w-full max-w-[340px] sm:max-w-[480px] md:max-w-[580px] aspect-square flex items-center justify-center"
                        >
                          {gallerySize > 0 &&
                            filteredPosters.map((poster, index) => {
                              const total = filteredPosters.length;
                              const angle = (index / total) * 2 * Math.PI - Math.PI / 2 + galleryRotation;
                              const radius = gallerySize * 0.38;
                              const centerX = gallerySize / 2;
                              const centerY = gallerySize / 2;
                              const x = centerX + radius * Math.cos(angle);
                              const y = centerY + radius * Math.sin(angle);

                              const cartItem = cart.find(item => item.poster.id === poster.id);
                              const quantityInCart = cartItem ? cartItem.quantity : 0;
                              const itemIdx = cart.findIndex(item => item.poster.id === poster.id);

                              return (
                                <div
                                  key={poster.id}
                                  className="group w-28 h-36 md:w-32 md:h-44 absolute hover:z-30 [perspective:1000px] transition-transform duration-300 ease-in-out hover:scale-105"
                                  style={{
                                    left: `${x}px`,
                                    top: `${y}px`,
                                    transform: `translate(-50%, -50%) rotate(${(angle + Math.PI / 2) * (180 / Math.PI)}deg)`,
                                  }}
                                >
                                  <div className="relative w-full h-full rounded-2xl shadow-xl transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                                    {/* Front Side: Image */}
                                    <div className="absolute inset-0 rounded-2xl overflow-hidden [backface-visibility:hidden] border border-zinc-800 bg-zinc-950">
                                      {poster.images?.[0]?.url ? (
                                        <Image
                                          src={poster.images[0].url}
                                          alt={poster.title}
                                          fill
                                          sizes="128px"
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-700 text-[10px] font-bold">
                                          No Image
                                        </div>
                                      )}

                                      {/* Wishlist toggle overlay */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleWishlist(poster.id);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:text-rose-500 transition-colors shadow z-20"
                                      >
                                        <Heart className={`w-3.5 h-3.5 ${wishlist.includes(poster.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                                      </button>
                                    </div>

                                    {/* Back Side: Details & Actions */}
                                    <div className="absolute inset-0 rounded-2xl bg-zinc-950 border border-[#D4FF3D]/30 flex flex-col justify-between p-3 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                                      <div className="space-y-1">
                                        <span className="text-[8px] uppercase font-bold tracking-widest text-[#D4FF3D]">K-Pop Collection</span>
                                        <h4 className="font-extrabold text-[10px] md:text-xs text-white line-clamp-2 leading-tight">{poster.title}</h4>
                                        <p className="text-[10px] font-bold text-white mt-1">{formatCurrency(poster.offerPrice || poster.basePrice)}</p>
                                      </div>

                                      <div className="space-y-1">
                                        {quantityInCart > 0 ? (
                                          <div className="flex items-center justify-between bg-[#D4FF3D]/10 rounded-lg border border-[#D4FF3D]/20 p-0.5">
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); updateCartQty(itemIdx, -1); }}
                                              className="w-5 h-5 rounded bg-[#D4FF3D] hover:bg-[#D4FF3D]/80 flex items-center justify-center font-bold text-[#0D0D0D] transition-colors"
                                            >
                                              <Minus className="w-2.5 h-2.5" />
                                            </button>
                                            <span className="font-extrabold text-[9px] text-[#D4FF3D]">{quantityInCart}</span>
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); updateCartQty(itemIdx, 1); }}
                                              className="w-5 h-5 rounded bg-[#D4FF3D] hover:bg-[#D4FF3D]/80 flex items-center justify-center font-bold text-[#0D0D0D] transition-colors"
                                            >
                                              <Plus className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              addToCart(poster);
                                            }}
                                            className="w-full py-1.5 rounded-lg font-bold text-[9px] shadow-sm hover:scale-[1.02] transition-transform"
                                            style={{ backgroundColor: "#D4FF3D", color: "#0D0D0D" }}
                                          >
                                            Add to Cart
                                          </button>
                                        )}

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPoster(poster);
                                          }}
                                          className="w-full py-1 rounded-lg border border-zinc-800 text-[8px] text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                                        >
                                          Quick View
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (selectedCategory && selectedCategory !== "movies" && selectedCategory !== "sports" && selectedCategory !== "k-pop" && selectedCategory !== "anime") ? (
                      /* FlyingPosters WebGL Slider for Cars & Automotives, or any newly created Category */
                      <div className="w-full flex flex-col items-center justify-center py-6 overflow-hidden min-h-[600px] relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                          <h3 className="text-3xl md:text-5xl font-black text-center uppercase tracking-tighter" style={{ color: "#D4FF3D", textShadow: "0 0 20px rgba(212,255,61,0.2)" }}>
                            {currentCategory?.name || "Collection"}
                          </h3>
                          <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-widest font-bold mt-2">
                            Scroll or Drag to Explore Prints
                          </p>
                        </div>

                        <div className="w-full h-[600px] relative rounded-3xl overflow-hidden border border-zinc-800 bg-black/60 shadow-2xl">
                          {(() => {
                            const imageSources = filteredPosters
                              .map((p) => p.images?.[0]?.url)
                              .filter(Boolean) as string[];
                            if (imageSources.length === 0) {
                              return (
                                <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500 font-bold">
                                  No prints available in this collection
                                </div>
                              );
                            }
                            return (
                              <FlyingPosters
                                items={imageSources}
                                planeWidth={320}
                                planeHeight={320}
                                distortion={3}
                                scrollEase={0.01}
                                cameraFov={45}
                                cameraZ={20}
                              />
                            );
                          })()}
                        </div>
                        {/* Buyable poster grid below the 3D canvas */}
                        {filteredPosters.length > 0 && (
                          <div className="space-y-4 mt-8">
                            <p className="text-xs uppercase tracking-widest font-extrabold text-zinc-500">Shop {currentCategory?.name || "Collection"} Prints</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {filteredPosters.map((poster) => {
                                const { base, offer } = getEffectivePrice(poster);
                                const cartItem = cart.find(i => i.poster.id === poster.id);
                                const qty = cartItem ? cartItem.quantity : 0;
                                const idx = cart.findIndex(i => i.poster.id === poster.id);
                                return (
                                  <div key={poster.id} className={`bg-zinc-950 rounded-2xl overflow-hidden border group hover:-translate-y-1 transition-all duration-300 ${cartAnimatingId === poster.id ? "border-[#D4FF3D] ring-2 ring-[#D4FF3D]/20" : "border-zinc-800"}`}>
                                    <div className="relative aspect-square overflow-hidden">
                                      {poster.images?.[0]?.url ? (
                                        <Image src={poster.images[0].url} alt={poster.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                      ) : (
                                        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center text-zinc-700 text-xs font-bold">No Image</div>
                                      )}
                                      <button type="button" onClick={() => toggleWishlist(poster.id)} className="absolute top-2 right-2 p-2 rounded-full bg-black/60 hover:text-rose-500 transition-colors">
                                        <Heart className={`w-3.5 h-3.5 ${wishlist.includes(poster.id) ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                                      </button>
                                    </div>
                                    <div className="p-3 space-y-2">
                                      <h4 onClick={() => setSelectedPoster(poster)} className="font-bold text-xs text-white line-clamp-1 cursor-pointer hover:text-[#D4FF3D] transition-colors">{poster.title}</h4>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-1.5">
                                          <span className="font-extrabold text-sm text-white">₹{offer ?? base}</span>
                                          {offer && <span className="text-[10px] text-zinc-500 line-through">₹{base}</span>}
                                        </div>
                                        {qty > 0 ? (
                                          <div className="flex items-center gap-1 bg-[#D4FF3D]/10 rounded-lg border border-[#D4FF3D]/30 p-0.5">
                                            <button onClick={() => updateCartQty(idx, -1)} className="w-5 h-5 rounded bg-[#D4FF3D] text-black font-bold flex items-center justify-center"><Minus className="w-2.5 h-2.5" /></button>
                                            <span className="text-[10px] font-extrabold text-[#D4FF3D] min-w-[12px] text-center">{qty}</span>
                                            <button onClick={() => updateCartQty(idx, 1)} className="w-5 h-5 rounded bg-[#D4FF3D] text-black font-bold flex items-center justify-center"><Plus className="w-2.5 h-2.5" /></button>
                                          </div>
                                        ) : (
                                          <button onClick={() => { const p2 = { ...poster, basePrice: base, offerPrice: offer }; addToCart(p2); }} className="px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold hover:opacity-90 transition-all" style={{ backgroundColor: '#D4FF3D', color: '#0D0D0D' }}>Add to Cart</button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Default Grid for Catalog Filter Selection */
                      <ScrollReveal>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                          {filteredPosters.map((poster) => (
                            <div
                              key={poster.id}
                              className={`bg-card rounded-2xl overflow-hidden border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between ${cartAnimatingId === poster.id ? "scale-105 border-[#D4FF3D] ring-2 ring-[#D4FF3D]/20 animate-pulse" : "border-border/80"}`}
                            >
                              <div className="relative w-full aspect-square bg-muted overflow-hidden flex items-center justify-center">
                                {poster.images?.[0]?.url ? (
                                  <Image
                                    src={poster.images[0].url}
                                    alt={poster.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-50 flex flex-col items-center justify-center p-4 text-center">
                                    <Package className="w-8 h-8 text-zinc-300 mb-2" />
                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">CMS Artwork Loaded</span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => toggleWishlist(poster.id)}
                                  className="absolute top-3 right-3 p-2.5 rounded-full bg-background/80 text-foreground hover:text-rose-500 transition-colors shadow-md z-10"
                                >
                                  <Heart className={`w-4 h-4 ${wishlist.includes(poster.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                                </button>

                                {/* Quick View Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                  <button
                                    onClick={() => setSelectedPoster(poster)}
                                    className="px-4 py-2 bg-white text-black font-bold text-xs rounded-full flex items-center gap-1.5 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Quick View</span>
                                  </button>
                                </div>
                              </div>

                              <div className="p-4 space-y-2 text-xs">
                                <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: '#D4FF3D' }}>
                                  {poster.category?.name || "Premium Print"}
                                </span>
                                <h3
                                  onClick={() => setSelectedPoster(poster)}
                                  className="font-bold text-sm text-foreground line-clamp-1 cursor-pointer transition-colors hover:text-[#D4FF3D]"
                                >
                                  {poster.title}
                                </h3>

                                {/* Rating Placeholder */}
                                <div className="flex items-center gap-1 text-amber-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                                  ))}
                                  <span className="text-[10px] text-muted-foreground ml-1">(4.9)</span>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-extrabold text-sm text-foreground">
                                      {formatCurrency(poster.offerPrice || poster.basePrice)}
                                    </span>
                                    {poster.offerPrice && (
                                      <span className="text-[10px] text-muted-foreground line-through">
                                        {formatCurrency(poster.basePrice)}
                                      </span>
                                    )}
                                  </div>

                                  {(() => {
                                    const cartItem = cart.find(item => item.poster.id === poster.id);
                                    const quantityInCart = cartItem ? cartItem.quantity : 0;
                                    if (quantityInCart > 0) {
                                      const itemIdx = cart.findIndex(item => item.poster.id === poster.id);
                                      return (
                                        <div className="flex items-center gap-1 bg-[#D4FF3D]/10 rounded-xl border border-[#D4FF3D]/30 p-0.5 flex-shrink-0 z-10 relative">
                                          <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); updateCartQty(itemIdx, -1); }}
                                            className="w-5 h-5 rounded-md bg-[#D4FF3D] hover:bg-[#D4FF3D]/80 flex items-center justify-center font-bold text-[#0D0D0D] transition-colors"
                                          >
                                            <Minus className="w-2.5 h-2.5" />
                                          </button>
                                          <span className="font-extrabold text-[10px] text-[#D4FF3D] min-w-[12px] text-center">{quantityInCart}</span>
                                          <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); updateCartQty(itemIdx, 1); }}
                                            className="w-5 h-5 rounded-md bg-[#D4FF3D] hover:bg-[#D4FF3D]/80 flex items-center justify-center font-bold text-[#0D0D0D] transition-colors"
                                          >
                                            <Plus className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      );
                                    }
                                    return (
                                      <button
                                        onClick={() => addToCart(poster)}
                                        className="px-3.5 py-2 rounded-xl font-bold text-[10px] shadow-sm transition-all hover:scale-105" style={{ backgroundColor: '#D4FF3D', color: '#0D0D0D' }}
                                      >
                                        Add to Cart
                                      </button>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollReveal>
                    )}
                  </div>

                  {/* Customer Upload Showcase + Feature Strip — Homepage only */}
                  {!selectedCategory && !selectedSubTopic && (
                    <>
                      {/* Customer Upload Showcase */}
                      <ScrollReveal>
                        <section className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-white border shadow-2xl" style={{ backgroundColor: '#0D0D0D', borderColor: 'rgba(212,255,61,0.2)' }}>
                          <div className="max-w-2xl space-y-4">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(212,255,61,0.15)', color: '#D4FF3D', border: '1px solid rgba(212,255,61,0.4)' }}>
                              Dynamic Custom Framing
                            </span>
                            <h2 className="text-3xl font-extrabold tracking-tight">Have Your Own Design? Upload &amp; We Frame It!</h2>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              Upload your artwork files between <strong>5 MB and 50 MB</strong>. We print on premium museum-grade 300 GSM paper boards and deliver framed wall art locally with Chennai express queues.
                            </p>
                            <button
                              onClick={() => setActiveTab("CUSTOM_UPLOAD")}
                              className="px-6 py-3 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 hover:scale-105" style={{ backgroundColor: '#D4FF3D', color: '#0D0D0D' }}
                            >
                              <UploadCloud className="w-4 h-4" />
                              <span>Upload Artwork (5MB - 50MB)</span>
                            </button>
                          </div>
                        </section>
                      </ScrollReveal>

                      {/* Why Choose Us — dark stat strip */}
                      <ScrollReveal>
                        <section className="rounded-3xl overflow-hidden" style={{ backgroundColor: '#0D0D0D' }}>
                          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[rgba(212,255,61,0.15)]">
                            <div className="flex flex-col items-start space-y-3 p-8 border-r" style={{ borderColor: 'rgba(212,255,61,0.12)' }}>
                              <div className="p-3 rounded-2xl" style={{ backgroundColor: 'rgba(212,255,61,0.15)', border: '1px solid rgba(212,255,61,0.3)' }}>
                                <Truck className="w-7 h-7" style={{ color: '#D4FF3D' }} />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-white text-base">Express Chennai Queue</h4>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Local shipping &amp; priority dispatch within 24 hours across all Chennai zones.</p>
                              </div>
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(212,255,61,0.1)', color: '#D4FF3D' }}>Same-Day Available</span>
                            </div>
                            <div className="flex flex-col items-start space-y-3 p-8 border-r" style={{ borderColor: 'rgba(212,255,61,0.12)' }}>
                              <div className="p-3 rounded-2xl" style={{ backgroundColor: 'rgba(212,255,61,0.15)', border: '1px solid rgba(212,255,61,0.3)' }}>
                                <Award className="w-7 h-7" style={{ color: '#D4FF3D' }} />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-white text-base">300 GSM Matte Finish</h4>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Archival quality museum boards preventing color fading for decades.</p>
                              </div>
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(212,255,61,0.1)', color: '#D4FF3D' }}>Museum Grade</span>
                            </div>
                            <div className="flex flex-col items-start space-y-3 p-8">
                              <div className="p-3 rounded-2xl" style={{ backgroundColor: 'rgba(212,255,61,0.15)', border: '1px solid rgba(212,255,61,0.3)' }}>
                                <RotateCcw className="w-7 h-7" style={{ color: '#D4FF3D' }} />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-white text-base">Damage Protection</h4>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Free transit replacement guarantee on every premium framed print order.</p>
                              </div>
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(212,255,61,0.1)', color: '#D4FF3D' }}>100% Guaranteed</span>
                            </div>
                          </div>
                        </section>
                      </ScrollReveal>
                    </>
                  )}
                </div>
              </>
            )}

            {/* TAB 2: EMBEDDED CUSTOM UPLOAD */}
            {activeTab === "CUSTOM_UPLOAD" && (
              <div className="w-full max-w-[1400px] mx-auto px-6 py-12 space-y-8">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(201,162,39,0.1)', color: '#C9A227' }}>
                    <UploadCloud className="w-4 h-4" />
                    <span>High-Resolution Artwork Upload Portal</span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight">Create Your Own Custom Poster</h1>
                  <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                    Upload your artwork (5MB – 50MB). Admins review file resolution before printing on 300 GSM matte paper.
                  </p>
                </div>

                {uploadError && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadSuccess ? (
                  <div className="glass-card p-8 rounded-2xl border border-border bg-card text-center space-y-4 max-w-xl mx-auto">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">Artwork Request Submitted!</h2>
                    <button onClick={() => setUploadSuccess(false)} className="px-5 py-2.5 rounded-xl text-white font-semibold text-xs" style={{ backgroundColor: '#C9A227' }}>
                      Upload Another File
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Form Column */}
                    <div className="lg:col-span-6">
                      <form onSubmit={handleCustomSubmit} className="glass-card p-6 md:p-8 rounded-2xl space-y-6 border border-border bg-white text-xs">
                        <div className="space-y-2">
                          <label className="font-bold text-foreground block">Artwork File Upload (Strict Min 5 MB – Max 50 MB) *</label>
                          <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-border rounded-2xl cursor-pointer transition-all p-6 text-center hover:border-[#C9A227] hover:bg-[#C9A227]/5">
                            {artworkFile ? (
                              <div className="flex flex-col items-center gap-2">
                                <FileCheck className="w-8 h-8 text-emerald-600" />
                                <span className="font-bold text-foreground text-sm">{artworkFile.name}</span>
                                <span className="text-[11px] text-muted-foreground">Size: {(artworkFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <UploadCloud className="w-8 h-8" style={{ color: '#C9A227' }} />
                                <span className="font-bold text-sm text-foreground">Click or Drag Artwork File Here</span>
                                <span className="text-[11px] text-muted-foreground">Accepted: JPG, JPEG, PNG, WEBP, PDF (5MB – 50MB)</span>
                              </div>
                            )}
                            <input type="file" required accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-semibold">Artwork Title *</label>
                            <input
                              type="text"
                              required
                              value={artworkTitle}
                              onChange={(e) => setArtworkTitle(e.target.value)}
                              placeholder="e.g. Cyberpunk Neon Sunset"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-semibold">Desired Print Size *</label>
                            <select
                              value={selectedSize}
                              onChange={(e) => setSelectedSize(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border"
                            >
                              <option value="A4">A4 Size (Standard)</option>
                              <option value="A3">A3 Size (Wide)</option>
                              <option value="POLAROID">Polaroid Size (Square)</option>
                              <option value="SQUARE">Square Canvas (Format)</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isUploading}
                          className="w-full py-3 px-6 rounded-xl text-white font-bold text-xs shadow-md" style={{ backgroundColor: '#C9A227' }}
                        >
                          {isUploading ? "Uploading Artwork..." : "Submit Custom Artwork for Admin Review"}
                        </button>
                      </form>
                    </div>

                    {/* Flat Product Mockup Preview Column */}
                    <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-border bg-card/60 flex flex-col items-center justify-center space-y-4">
                      <div className="text-center">
                        <h3 className="font-bold text-sm text-foreground">Poster Print Mockup</h3>
                        <p className="text-[10px] text-muted-foreground">Live representation of your selected {selectedSize} format</p>
                      </div>

                      <div className="w-full aspect-[3/4] max-w-[280px] bg-stone-900 border-[12px] border-stone-950 rounded shadow-2xl relative flex items-center justify-center overflow-hidden transition-all duration-300">
                        {artworkPreviewUrl ? (
                          <Image
                            src={artworkPreviewUrl}
                            alt="Custom Artwork Preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                            <Sparkles className="w-8 h-8 text-stone-600/40" />
                            <span>No artwork file uploaded yet</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 text-[10px] font-mono text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/60">
                        <span>Format: {selectedSize}</span>
                        <span>•</span>
                        <span>Frame: 300 GSM Archival Matte Board</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ORDER TRACKER */}
            {activeTab === "TRACK_ORDER" && (
              <div className="max-w-xl mx-auto py-12 space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-extrabold">Track Order Status</h1>
                  <p className="text-xs text-muted-foreground">Enter your order ID (e.g. ORD-PSTR-123456) to track live status.</p>
                </div>

                <form onSubmit={handleOrderTrack} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={trackOrderNum}
                    onChange={(e) => setTrackOrderNum(e.target.value)}
                    placeholder="ORD-PSTR-982145"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-mono"
                  />
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-[10px] font-bold" style={{ backgroundColor: '#D4FF3D', color: '#0D0D0D' }}>
                    Track
                  </button>
                </form>

                {trackedOrder && (
                  <div className="glass-card p-6 rounded-2xl border border-border bg-card space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-bold font-mono" style={{ color: '#1E3FF2' }}>{trackedOrder.orderNumber}</span>
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 font-bold uppercase text-[10px]">
                        {trackedOrder.status}
                      </span>
                    </div>
                    <p><strong>Estimated Delivery:</strong> {trackedOrder.estimatedDelivery}</p>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* ===== REDESIGNED FOOTER (GLOWING STYLE) ===== */}
          <footer className="w-full bg-[#0D0D0D] border-t border-zinc-800/80 shadow-2xl py-12 md:py-16 mt-24 z-40 relative">
            {/* Glow Backing Effect */}
            <div
              className="absolute -inset-1 opacity-10 blur-xl pointer-events-none -z-10 transition-opacity duration-500"
              style={{
                background: "radial-gradient(circle, #D4FF3D 0%, transparent 70%)",
                transform: "translateY(10px)"
              }}
            />

            {/* Centered layout container */}
            <div className="w-full max-w-[1400px] mx-auto px-6 relative">
              {/* Subtle inner gradient shadow */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-screen -z-10"
                style={{
                  background: "radial-gradient(circle at 50% 50%, #D4FF3D 0%, transparent 80%)"
                }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Left Column: brand + tagline + socials */}
                <div className="lg:col-span-5 space-y-6">
                  <div
                    className="flex items-center gap-3 cursor-pointer select-none group"
                    onClick={() => {
                      if (typeof window !== "undefined" && window.location.pathname !== "/") {
                        window.location.href = "/";
                      } else {
                        setActiveTab("CATALOG");
                        setSelectedCategory(null);
                        setSelectedSubTopic(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center font-extrabold text-base bg-white/5 border border-white/10 p-1 group-hover:scale-105 transition-all">
                      <img src="/assets/images/logo.png" alt="Maja Posters Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-extrabold text-lg text-white tracking-tight">MAJA POSTERS</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#D4FF3D' }}>Premium Print Studio</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                    India's premier poster destination — anime, sports, movies, K-Pop, cars &amp; custom prints.
                  </p>

                  {/* Social Links exactly like image */}
                  <div className="flex items-center gap-3 pt-2">
                    {[
                      { label: 'IG', href: '#', title: 'Instagram' },
                      { label: 'YT', href: '#', title: 'YouTube' },
                      { label: 'TW', href: '#', title: 'Twitter/X' },
                      { label: 'WA', href: '#', title: 'WhatsApp' },
                    ].map((s) => (
                      <a key={s.label} href={s.href} title={s.title}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-extrabold transition-all hover:scale-110 hover:-translate-y-0.5"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(212,255,61,0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = '#D4FF3D'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(212,255,61,0.3)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
                      >{s.label}</a>
                    ))}
                  </div>
                </div>

                {/* Right Columns: links grid */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8">
                  {/* Categories */}
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#D4FF3D]">Categories</p>
                    <ul className="space-y-2.5 text-xs text-zinc-400">
                      {categoriesList.map(cat => (
                        <li key={cat.slug}>
                          <button onClick={() => {
                            navigateToCategory(cat.slug);
                            setActiveTab('CATALOG');
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                            className="transition-colors hover:text-[#D4FF3D] text-left uppercase">{cat.name}</button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Source */}
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#D4FF3D]">Source</p>
                    <ul className="space-y-2.5 text-xs text-zinc-400">
                      <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4FF3D] transition-colors">Pinterest</a></li>
                      <li><a href="https://google.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4FF3D] transition-colors">Google</a></li>
                      <li><span className="text-zinc-500 cursor-default">AI Generated</span></li>
                      <li><a href="https://wallpaperflare.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4FF3D] transition-colors">WallpaperFlare</a></li>
                    </ul>
                  </div>

                  {/* Support */}
                  <div className="space-y-4 col-span-2 sm:col-span-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#D4FF3D]">Support</p>
                    <ul className="space-y-2.5 text-xs text-zinc-400">
                      <li><a href="/faq" className="hover:text-[#D4FF3D] transition-colors">FAQs &amp; Help</a></li>
                      <li><a href="/shipping" className="hover:text-[#D4FF3D] transition-colors">Shipping Info</a></li>
                      <li><a href="/returns" className="hover:text-[#D4FF3D] transition-colors">Returns Policy</a></li>
                      <li><a href="/contact" className="hover:text-[#D4FF3D] transition-colors">Contact Us</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* Bottom Copyright centered inside the container */}
              <div className="mt-12 pt-8 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
                <p>&copy; {new Date().getFullYear()} <span className="font-semibold text-zinc-400">MAJA POSTERS</span>. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                  <span>•</span>
                  <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                  <span>•</span>
                  <a href="/admin/login" className="font-semibold transition-colors" style={{ color: '#D4FF3D' }}>Admin</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKSPACE 2: ADMIN CMS MANAGEMENT WORKSPACE                               */}
      {/* High-Contrast Professional Black & White Studio Theme                     */}
      {/* ========================================================================= */}
      {viewMode === "ADMIN_CMS" && (
        <div className="flex-1 flex bg-black text-white text-xs min-h-screen font-sans">
          {/* Admin Sidebar */}
          <aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-5 space-y-4 flex-shrink-0 flex flex-col" style={{ minHeight: '100vh' }}>
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-extrabold text-sm shadow">
                M
              </div>
              <div>
                <p className="font-extrabold text-white text-sm tracking-tight">MAJA POSTERS</p>
                <p className="text-[10px] text-zinc-400 font-mono">ROLE: {currentUser?.role || "ADMIN"}</p>
              </div>
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => setAdminTab("TRENDING")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-extrabold transition-all ${adminTab === "TRENDING" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4" />
                  <span>Edit Trending Images</span>
                </div>
                <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${adminTab === "TRENDING" ? "bg-black text-white" : "bg-zinc-800 text-zinc-300"
                  }`}>
                  Live
                </span>
              </button>



              <button
                onClick={() => setAdminTab("CATEGORIES")}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-extrabold transition-all ${adminTab === "CATEGORIES" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
              >
                <FolderTree className="w-4 h-4" />
                <span>Categories ({categoriesList.length})</span>
              </button>

              <button
                onClick={() => setAdminTab("SUBTOPICS")}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl font-extrabold transition-all ${adminTab === "SUBTOPICS" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
              >
                <Tag className="w-4 h-4" />
                <span>Sub-Topics ({subTopicsList.length})</span>
              </button>

              <button
                onClick={() => setAdminTab("ORDERS")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-extrabold transition-all ${adminTab === "ORDERS" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders Dashboard</span>
                </div>
                <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${adminTab === "ORDERS" ? "bg-black text-white" : "bg-zinc-800 text-zinc-300"
                  }`}>
                  {ordersList.length}
                </span>
              </button>
            </nav>

            {/* OptionWheel — animated CMS section selector */}
            <div className="mt-4 flex-1 relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40" style={{ minHeight: '200px', maxHeight: '260px' }}>
              <div className="absolute top-3 left-3 right-3 z-10">
                <p className="text-[9px] uppercase tracking-widest font-bold text-zinc-600">CMS Sections</p>
              </div>
              <div style={{ position: 'absolute', inset: 0, top: '24px' }}>
                <OptionWheel
                  items={["Trending", "Categories", "Sub-Topics", "Orders", "Posters", "Banners", "Analytics"]}
                  defaultSelected={adminTab === "TRENDING" ? 0 : adminTab === "CATEGORIES" ? 1 : adminTab === "SUBTOPICS" ? 2 : adminTab === "ORDERS" ? 3 : 0}
                  textColor="rgba(255,255,255,0.25)"
                  activeColor="#D4FF3D"
                  side="left"
                  fontSize={1.1}
                  spacing={1.6}
                  curve={0.8}
                  tilt={5}
                  blur={1.5}
                  fade={0.35}
                  smoothing={200}
                  inset={16}
                  loop={true}
                  draggable
                  onChange={(index) => {
                    if (index === 0) setAdminTab("TRENDING");
                    else if (index === 1) setAdminTab("CATEGORIES");
                    else if (index === 2) setAdminTab("SUBTOPICS");
                    else if (index === 3) setAdminTab("ORDERS");
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <button
                onClick={() => { setViewMode("STOREFRONT"); setActiveTab("CATALOG"); setSelectedCategory(null); setSelectedSubTopic(null); }}
                className="w-full py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: "#D4FF3D", color: "#0D0D0D" }}
              >
                <span className="text-[13px]">🏠</span>
                Homepage
              </button>
              <button
                onClick={() => setViewMode("STOREFRONT")}
                className="w-full py-2 rounded-xl border border-zinc-800 hover:border-white text-zinc-500 hover:text-white font-bold text-xs transition-colors"
              >
                ← Return to Storefront
              </button>
            </div>
          </aside>

          {/* Admin Main Workspace View */}
          <main className="flex-1 p-8 space-y-8 overflow-y-auto bg-black">
            {/* Edit Trending Images & Posters CMS */}
            {adminTab === "TRENDING" && (
              <div className="space-y-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
                      <Flame className="w-6 h-6 text-white" />
                      <span>Edit Trending Images &amp; Poster Prices</span>
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1">
                      Upload new posters, set prices, and toggle trending posters for your storefront.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full">
                    {postersList.filter(p => p.isTrending).length} Posters Currently Trending
                  </span>
                </div>

                {/* FORM 1: Add New Poster & Price */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newPosterTitle) return;

                    // Resolve the real category record for the selected category slug
                    const categoryObj = categoriesList.find((c) => c.slug === newPosterCategory);
                    if (!categoryObj) {
                      alert("Please select a valid category before publishing.");
                      return;
                    }

                    setIsPublishingPoster(true);
                    try {
                      let finalImg = newPosterImageUrl;
                      // If a file was selected, upload it to Supabase Storage first
                      if (newPosterImageFile) {
                        const fd = new FormData();
                        fd.append("file", newPosterImageFile);
                        fd.append("folder", "posters");
                        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
                        const uploadData = await uploadRes.json();
                        if (!uploadData.success) throw new Error(uploadData.error || "Upload failed");
                        finalImg = uploadData.url;
                      }
                      if (!finalImg) finalImg = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800";

                      const baseP = parseFloat(newPosterBasePrice) || 799;
                      const offerP = parseFloat(newPosterOfferPrice) || 499;

                      // Save to Supabase DB via API
                      const saveRes = await fetch("/api/posters", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: newPosterTitle,
                          slug: newPosterTitle.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
                          description: `${newPosterTitle} Premium Wall Art Print`,
                          categoryId: categoryObj.id,
                          basePrice: baseP,
                          offerPrice: offerP,
                          stock: 50,
                          isTrending: true,
                          isFeatured: false,
                          images: [{ url: finalImg, altText: newPosterTitle, isPrimary: true }],
                        }),
                      });
                      const saveData = await saveRes.json();

                      if (!saveData?.success) {
                        throw new Error(`Database save failed: ${saveData?.error || "unknown error"}`);
                      }

                      // Also add to local state for instant UI update
                      const newPosterObj: PosterItem = {
                        id: saveData?.data?.id || `p-${Date.now()}`,
                        title: newPosterTitle,
                        slug: newPosterTitle.toLowerCase().replace(/\s+/g, "-"),
                        description: `${newPosterTitle} Premium Wall Art Print`,
                        basePrice: baseP,
                        offerPrice: offerP,
                        stock: 50,
                        isTrending: true,
                        category: { name: newPosterCategory.toUpperCase(), slug: newPosterCategory },
                        images: [{ url: finalImg }],
                      };
                      setPostersList([newPosterObj, ...postersList]);
                      setNewPosterTitle("");
                      setNewPosterImageUrl("");
                      setNewPosterImageFile(null);
                      alert("Poster saved to database & marked as Trending!");
                    } catch (err: any) {
                      alert(`Error: ${err.message}`);
                    } finally {
                      setIsPublishingPoster(false);
                    }
                  }}
                  className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-5 text-white text-xs"
                >
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                    <Plus className="w-4 h-4 text-white" />
                    <span>Create &amp; Upload New Poster with Price</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-400">Poster Title *</label>
                      <input
                        type="text"
                        required
                        value={newPosterTitle}
                        onChange={(e) => setNewPosterTitle(e.target.value)}
                        placeholder="e.g. Naruto Baryon Mode Art"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-400">Category *</label>
                      <select
                        value={newPosterCategory}
                        onChange={(e) => setNewPosterCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-white focus:outline-none"
                      >
                        {categoriesList.map((c) => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-400">Original Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={newPosterBasePrice}
                        onChange={(e) => setNewPosterBasePrice(e.target.value)}
                        placeholder="e.g. 799"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-white focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-400">Offer / Sale Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={newPosterOfferPrice}
                        onChange={(e) => setNewPosterOfferPrice(e.target.value)}
                        placeholder="e.g. 499"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Poster Image File / URL Picker */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-zinc-400 block">Poster Image (Upload File or Enter URL) *</label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex flex-col items-center justify-center h-20 border border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-white hover:bg-zinc-900 transition-all p-2 text-center">
                        {newPosterImageUrl ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-white text-[10px] truncate max-w-[180px]">Image Uploaded</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <UploadCloud className="w-4 h-4 text-zinc-400" />
                            <span className="text-[10px] text-zinc-300 font-bold">Choose Image File from Device</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewPosterImageFile(file);
                              setNewPosterImageUrl(URL.createObjectURL(file)); // preview only
                            }
                          }}
                        />
                      </label>

                      <div className="flex-1">
                        <input
                          type="text"
                          value={newPosterImageUrl}
                          onChange={(e) => setNewPosterImageUrl(e.target.value)}
                          placeholder="Or paste image URL here..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition-transform hover:scale-[1.005] flex items-center justify-center gap-2 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isPublishingPoster ? "Uploading & Saving..." : "Publish Poster to Store & Set Trending"}</span>
                  </button>
                </form>

                {/* FORM 2: Add Custom Banner */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTBTitle) return;
                    const finalImage = newTBImageUrl || "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200";
                    const newBannerObj = {
                      id: `tb-${Date.now()}`,
                      title: newTBTitle,
                      subtitle: newTBSubtitle || "Featured Art Print",
                      imageUrl: finalImage,
                      badgeText: newTBBadge || "HOT TRENDING",
                      linkUrl: newTBLink || "/",
                    };
                    setTrendingBannersList([newBannerObj, ...trendingBannersList]);
                    setNewTBTitle("");
                    setNewTBSubtitle("");
                    setNewTBImageUrl("");
                    alert("New Banner Added Successfully!");
                  }}
                  className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4 text-white text-xs"
                >
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Add Showcase Banner Image</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-400">Banner Title *</label>
                      <input
                        type="text"
                        required
                        value={newTBTitle}
                        onChange={(e) => setNewTBTitle(e.target.value)}
                        placeholder="e.g. Supercars & JDM Legends"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-400">Tagline / Subtitle</label>
                      <input
                        type="text"
                        value={newTBSubtitle}
                        onChange={(e) => setNewTBSubtitle(e.target.value)}
                        placeholder="e.g. Exclusive Art Print Collection"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-400">Badge Label</label>
                      <input
                        type="text"
                        value={newTBBadge}
                        onChange={(e) => setNewTBBadge(e.target.value)}
                        placeholder="e.g. HOT TRENDING"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-zinc-400">Target Link URL</label>
                      <input
                        type="text"
                        value={newTBLink}
                        onChange={(e) => setNewTBLink(e.target.value)}
                        placeholder="e.g. /anime or /cars-and-automations"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Banner Image</span>
                  </button>
                </form>

                {/* Poster Price & Trending Status Control Grid */}
                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-white">Catalog Posters (Edit Prices &amp; Trending Status)</h3>
                    <span className="text-xs text-zinc-400 font-mono">{postersList.length} Total Catalog Items</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {postersList.map((poster) => (
                      <div
                        key={poster.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${poster.isTrending ? "bg-zinc-900 border-white" : "bg-zinc-950 border-zinc-800"
                          }`}
                      >
                        <div className="space-y-3">
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black border border-zinc-800">
                            <Image
                              src={poster.images?.[0]?.url || "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600"}
                              alt={poster.title}
                              fill
                              className="object-cover"
                            />
                            <span className={`absolute top-2.5 left-2.5 text-[9px] font-extrabold px-2.5 py-1 rounded uppercase shadow ${poster.isTrending ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                              }`}>
                              {poster.isTrending ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-white text-xs truncate">{poster.title}</h4>
                            <p className="text-[10px] text-zinc-400 uppercase font-mono mt-0.5">{poster.category?.name || "General"}</p>
                          </div>

                          {/* Live Poster Price Editing Controls */}
                          <div className="p-3 rounded-xl bg-black border border-zinc-800 space-y-2 text-xs">
                            <p className="font-bold text-[10px] uppercase text-zinc-400">Edit Poster Prices (₹)</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] text-zinc-500 font-semibold block">Base Price</label>
                                <input
                                  type="number"
                                  value={poster.basePrice}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setPostersList(prev => prev.map(p => p.id === poster.id ? { ...p, basePrice: val } : p));
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] text-zinc-500 font-semibold block">Offer Price</label>
                                <input
                                  type="number"
                                  value={poster.offerPrice || poster.basePrice}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setPostersList(prev => prev.map(p => p.id === poster.id ? { ...p, offerPrice: val } : p));
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status Toggle & Delete Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${poster.title}" from the store catalog?`)) {
                                setPostersList(prev => prev.filter(p => p.id !== poster.id));
                              }
                            }}
                            className="p-2.5 rounded-xl border border-zinc-800 hover:border-red-500 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors"
                            title="Delete Poster"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={async () => {
                              const newStatus = !poster.isTrending;
                              try {
                                await fetch(`/api/posters/${poster.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ isTrending: newStatus }),
                                });
                              } catch (e) { }
                              setPostersList(prev => prev.map(p => p.id === poster.id ? { ...p, isTrending: newStatus } : p));
                            }}
                            className={`flex-1 py-2.5 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-2 ${poster.isTrending
                                ? "bg-white text-black shadow"
                                : "bg-zinc-800 text-zinc-400 hover:bg-white hover:text-black"
                              }`}
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>{poster.isTrending ? "Active (Shown on Home)" : "Inactive (Hidden)"}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}



            {/* Categories Management CMS */}
            {adminTab === "CATEGORIES" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight text-white">Category CMS Manager</h1>

                <form onSubmit={handleCreateCategoryAdmin} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-lg">
                  <h3 className="font-bold text-sm text-purple-400">Add New Category (Dynamic Auto-Render)</h3>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Minimalist Architecture"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Description</label>
                    <input
                      type="text"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="e.g. Clean aesthetic line art and structural prints"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300 flex items-center justify-between">
                      <span>Card Float Animation * <span className="text-[10px] text-purple-400 font-normal">(Compulsory - Select 1)</span></span>
                    </label>
                    <select
                      required
                      value={newCatAnimation}
                      onChange={(e) => setNewCatAnimation(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer text-xs"
                    >
                      <option value="card-orbit-3d">🎡 Animation 1: 3D Orbiting Card Carousel (Trigonometric Orbit & 3D Tilt)</option>
                      <option value="stellar-galaxy-3d">🌌 Animation 2: 3D Stellar Galaxy Sphere (Starfield & Depth Mesh)</option>
                      <option value="circular-ring-3d">🔄 Animation 3: 3D Circular Ring Gallery (3D Cylindrical Ring & Auto-Rotate)</option>
                      <option value="float-pulse-zoom">⚡ Animation 4: Pulsing Scale & Glow (Card Pulsing Lift)</option>
                      <option value="float-rotational-tilt">🎨 Animation 5: Interactive Rotational Tilt & Sway</option>
                    </select>
                    <p className="text-[11px] text-slate-400 italic">
                      💡 Select how poster cards in this category will float/animate when rendered in storefront.
                    </p>
                  </div>
                  <button type="submit" className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all">
                    Create & Render Category
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoriesList.map((cat) => (
                    <div key={cat.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 hover:border-purple-500/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white text-sm truncate">{cat.name}</p>
                        <p className="text-[10px] text-purple-400 font-mono">/{cat.slug}</p>
                        <span className="inline-block mt-1.5 px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/50 text-[10px] text-purple-300 font-medium truncate max-w-full">
                          ✨ {cat.animation === "card-orbit-3d" ? "3D Orbiting Carousel" : cat.animation === "stellar-galaxy-3d" ? "3D Stellar Galaxy" : cat.animation === "circular-ring-3d" ? "3D Circular Ring" : cat.animation || "3D Orbiting Carousel"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategoryAdmin(cat.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white transition-colors shrink-0"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Topics CMS Workspace */}
            {adminTab === "SUBTOPICS" && (() => {
              // Build deduplicated sub-topics
              const seen = new Map<string, SubTopic & { dupCount: number }>();
              subTopicsList.forEach((st) => {
                const key = `${st.slug}::${st.categorySlug}`;
                if (seen.has(key)) {
                  const ex = seen.get(key)!;
                  const merged = Array.from(new Set([...ex.posterIds, ...st.posterIds]));
                  seen.set(key, { ...ex, posterIds: merged, dupCount: ex.dupCount + 1 });
                } else {
                  seen.set(key, { ...st, dupCount: 0 });
                }
              });
              const dedupedSubTopics = Array.from(seen.values());

              // Group by category
              const byCategory: Record<string, (SubTopic & { dupCount: number })[]> = {};
              dedupedSubTopics.forEach((st) => {
                if (!byCategory[st.categorySlug]) byCategory[st.categorySlug] = [];
                byCategory[st.categorySlug].push(st);
              });

              // Posters in currently editing sub-topic
              const stPosters = editingSubTopic
                ? postersList.filter((p) => editingSubTopic.posterIds.includes(p.id))
                : [];
              const catPosters = editingSubTopic
                ? postersList.filter((p) => p.category?.slug === editingSubTopic.categorySlug)
                : [];

              // Add new poster directly to a sub-topic
              const handleAddPosterToSubTopic = async (e: React.FormEvent) => {
                e.preventDefault();
                if (!editingSubTopic || !stNewPosterTitle.trim()) return;

                // Resolve the real category record this sub-topic belongs to
                const categoryObj = categoriesList.find((c) => c.slug === editingSubTopic.categorySlug);
                if (!categoryObj) {
                  alert("Error: Could not find a matching category for this sub-topic. Please recreate the sub-topic under a valid category.");
                  return;
                }
                if (!UUID_REGEX.test(categoryObj.id)) {
                  alert(`"${categoryObj.name}" was created locally and isn't saved to the database yet. Posters can only be added to categories that exist in the database.`);
                  return;
                }

                try {
                  // Make sure this sub-topic has a real database SubCategory row & UUID
                  const realSubCategoryId = await ensureRealSubCategoryId(editingSubTopic, categoryObj.id);
                  const workingSubTopic = { ...editingSubTopic, id: realSubCategoryId };

                  let finalImgUrl = stNewPosterImageUrl.trim();

                  // Upload image file to Supabase Storage if a file was selected
                  if (stNewPosterImageFile) {
                    const fd = new FormData();
                    fd.append("file", stNewPosterImageFile);
                    fd.append("folder", "posters");
                    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
                    const uploadData = await uploadRes.json();
                    if (!uploadData.success) throw new Error(uploadData.error || "Upload failed");
                    finalImgUrl = uploadData.url;
                  }

                  if (!finalImgUrl) finalImgUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800";

                  const baseP = parseFloat(stNewPosterBasePrice) || 799;
                  const offerP = parseFloat(stNewPosterOfferPrice) || 499;

                  // Save to DB via API
                  const saveRes = await fetch("/api/posters", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: stNewPosterTitle.trim(),
                      slug: stNewPosterTitle.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
                      description: stNewPosterDesc || stNewPosterTitle.trim(),
                      categoryId: categoryObj.id,
                      subCategoryId: realSubCategoryId,
                      basePrice: baseP,
                      offerPrice: offerP,
                      stock: 50,
                      isTrending: false,
                      isFeatured: false,
                      images: [{ url: finalImgUrl, altText: stNewPosterTitle.trim(), isPrimary: true }],
                    }),
                  });
                  const saveData = await saveRes.json();
                  if (!saveData?.success) {
                    throw new Error(`Database save failed: ${saveData?.error || "unknown error"}`);
                  }

                  const pid = saveData?.data?.id || `poster-${Date.now()}`;
                  const slug = stNewPosterTitle.trim().toLowerCase().replace(/\s+/g, "-");

                  const newP: PosterItem = {
                    id: pid,
                    title: stNewPosterTitle.trim(),
                    slug,
                    basePrice: baseP,
                    offerPrice: offerP,
                    description: stNewPosterDesc || stNewPosterTitle.trim(),
                    category: { name: editingSubTopic.categorySlug, slug: editingSubTopic.categorySlug },
                    images: [{ url: finalImgUrl }],
                    isFeatured: false,
                    isTrending: false,
                    isBestSeller: false,
                    stock: 50,
                  };
                  setPostersList((prev) => [newP, ...prev]);
                  const updated = { ...workingSubTopic, posterIds: [pid, ...workingSubTopic.posterIds] };
                  setEditingSubTopic(updated);
                  setSubTopicsList((prev) => prev.map((s) =>
                    (s.id === editingSubTopic.id || s.id === workingSubTopic.id) ? updated : s
                  ));
                  setStNewPosterTitle(""); setStNewPosterDesc("");
                  setStNewPosterImageUrl(""); setStNewPosterImageFile(null);
                  setStNewPosterBasePrice("799"); setStNewPosterOfferPrice("499");
                  setActiveSubTopicPanel("LIST");
                  alert("Poster saved to database!");
                } catch (err: any) {
                  alert(`Error: ${err.message}`);
                }
              };

              // Save sub-topic info edits
              const handleSaveSTInfo = () => {
                if (!editingSubTopic) return;
                const updated = {
                  ...editingSubTopic,
                  name: stEditName || editingSubTopic.name,
                  description: stEditDesc || editingSubTopic.description,
                  imageUrl: stEditImageUrl || editingSubTopic.imageUrl,
                };
                setEditingSubTopic(updated);
                setSubTopicsList((prev) => prev.map((s) =>
                  s.slug === editingSubTopic.slug && s.categorySlug === editingSubTopic.categorySlug
                    ? { ...s, name: updated.name, description: updated.description, imageUrl: updated.imageUrl }
                    : s
                ));
                setActiveSubTopicPanel("LIST");
              };

              return (
                <div className="space-y-0 h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-5 mb-6">
                    <div>
                      <h1 className="text-2xl font-extrabold tracking-tight text-white">Sub-Categories Manager</h1>
                      <p className="text-xs text-zinc-500 mt-1">Manage sub-categories and their poster collections for every category.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Merge Duplicates */}
                      {(() => {
                        const dupeCount = subTopicsList.length - new Set(subTopicsList.map(s => `${s.slug}::${s.categorySlug}`)).size;
                        if (dupeCount === 0) return null;
                        return (
                          <button
                            onClick={() => {
                              const seen2 = new Map<string, SubTopic>();
                              subTopicsList.forEach((st) => {
                                const key = `${st.slug}::${st.categorySlug}`;
                                if (seen2.has(key)) {
                                  const ex = seen2.get(key)!;
                                  seen2.set(key, { ...ex, posterIds: Array.from(new Set([...ex.posterIds, ...st.posterIds])) });
                                } else { seen2.set(key, { ...st }); }
                              });
                              setSubTopicsList(Array.from(seen2.values()));
                              setEditingSubTopic(null);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-black text-[11px] font-extrabold hover:bg-amber-300 transition-colors"
                          >
                            ⚡ Merge {dupeCount} Duplicate{dupeCount !== 1 ? "s" : ""}
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Main 2-column layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 min-h-[70vh]">

                    {/* ── LEFT: Sub-Topic List + Create ── */}
                    <div className="space-y-4">
                      {/* Create New Sub-Topic form */}
                      <form
                        onSubmit={handleCreateSubTopic}
                        className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs"
                      >
                        <h3 className="font-extrabold text-[11px] uppercase tracking-widest text-zinc-400">+ New Sub-Category</h3>
                        <select
                          value={newSTCategory}
                          onChange={(e) => setNewSTCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-medium"
                        >
                          {categoriesList.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          required
                          value={newSTName}
                          onChange={(e) => setNewSTName(e.target.value)}
                          placeholder="Sub-category name (e.g. Naruto, JJK)"
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600"
                        />
                        <input
                          type="text"
                          value={newSTDesc}
                          onChange={(e) => setNewSTDesc(e.target.value)}
                          placeholder="Short description (optional)"
                          className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-600"
                        />
                        {/* Banner image */}
                        <div className="flex items-center gap-2">
                          <label className="flex-1 flex items-center justify-center h-10 border border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-white/40 transition-all text-[10px] text-zinc-500 font-bold gap-1.5">
                            <UploadCloud className="w-3.5 h-3.5" />
                            {newSTImageUrl ? "Image Set ✓" : "Banner Image"}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setNewSTImageUrl(URL.createObjectURL(file));
                            }} />
                          </label>
                          {newSTImageUrl && (
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0">
                              <Image src={newSTImageUrl} alt="" fill className="object-cover" />
                              <button type="button" onClick={() => setNewSTImageUrl("")} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <X className="w-3 h-3 text-red-400" />
                              </button>
                            </div>
                          )}
                        </div>
                        <button type="submit" className="w-full py-2 rounded-xl text-black font-extrabold text-[11px] hover:opacity-90 transition-all" style={{ backgroundColor: "#D4FF3D" }}>
                          Create Sub-Category
                        </button>
                      </form>

                      {/* Sub-topic list grouped by category */}
                      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                        {Object.keys(byCategory).length === 0 && (
                          <p className="text-center py-8 text-zinc-600 text-xs italic">No sub-categories yet. Create one above.</p>
                        )}
                        {Object.entries(byCategory).map(([catSlug, sts]) => {
                          const cat = categoriesList.find(c => c.slug === catSlug);
                          return (
                            <div key={catSlug}>
                              <p className="text-[9px] uppercase tracking-widest font-extrabold text-zinc-600 px-1 mb-1.5">
                                {getCategoryEmoji(catSlug)} {cat?.name || catSlug}
                              </p>
                              <div className="space-y-1">
                                {sts.map((st) => {
                                  const isSelected = editingSubTopic?.id === st.id;
                                  return (
                                    <div
                                      key={st.id}
                                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${isSelected
                                          ? "border-white/20 bg-white/8"
                                          : "border-transparent hover:bg-zinc-900/60 hover:border-zinc-800"
                                        }`}
                                      onClick={() => {
                                        setEditingSubTopic(isSelected ? null : st);
                                        setActiveSubTopicPanel("LIST");
                                        setStEditName(st.name);
                                        setStEditDesc(st.description || "");
                                        setStEditImageUrl(st.imageUrl || "");
                                      }}
                                    >
                                      {/* Thumbnail */}
                                      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                                        {st.imageUrl
                                          ? <Image src={st.imageUrl} alt={st.name} fill className="object-cover" />
                                          : <div className="absolute inset-0 flex items-center justify-center text-xs">📂</div>
                                        }
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`font-bold text-[12px] truncate ${isSelected ? "text-white" : "text-zinc-300"}`}>{st.name}</p>
                                        <p className="text-[10px] text-zinc-600">{st.posterIds.length} poster{st.posterIds.length !== 1 ? "s" : ""}</p>
                                      </div>
                                      {/* Actions */}
                                      <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                        <button
                                          onClick={() => {
                                            setEditingSubTopic(st);
                                            setStEditName(st.name);
                                            setStEditDesc(st.description || "");
                                            setStEditImageUrl(st.imageUrl || "");
                                            setActiveSubTopicPanel("EDIT_INFO");
                                          }}
                                          className="p-1 rounded-lg text-zinc-600 hover:text-white hover:bg-zinc-800 transition-colors"
                                          title="Edit sub-category info"
                                        ><Edit className="w-3 h-3" /></button>
                                        <button
                                          onClick={() => {
                                            setSubTopicsList((prev) => prev.filter(
                                              (s) => !(s.slug === st.slug && s.categorySlug === st.categorySlug)
                                            ));
                                            if (editingSubTopic?.id === st.id) setEditingSubTopic(null);
                                          }}
                                          className="p-1 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                          title="Delete sub-category"
                                        ><Trash2 className="w-3 h-3" /></button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ── RIGHT: Poster Manager ── */}
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col">
                      {!editingSubTopic ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
                          <div className="text-4xl opacity-20">📂</div>
                          <p className="text-zinc-500 font-bold text-sm">Select a sub-category from the left to manage its posters</p>
                          <p className="text-zinc-700 text-xs">You can add new images, edit or remove existing ones.</p>
                        </div>
                      ) : (
                        <>
                          {/* Panel Header */}
                          <div className="border-b border-zinc-800 px-5 py-4 flex items-center justify-between bg-zinc-900/60">
                            <div className="flex items-center gap-3">
                              {editingSubTopic.imageUrl && (
                                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-zinc-700">
                                  <Image src={editingSubTopic.imageUrl} alt={editingSubTopic.name} fill className="object-cover" />
                                </div>
                              )}
                              <div>
                                <p className="font-extrabold text-white text-sm">{editingSubTopic.name}</p>
                                <p className="text-[10px] text-zinc-500 capitalize">{editingSubTopic.categorySlug} · {stPosters.length} poster{stPosters.length !== 1 ? "s" : ""}</p>
                              </div>
                            </div>
                            <button onClick={() => setEditingSubTopic(null)} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Tab Bar */}
                          <div className="flex items-center border-b border-zinc-800 px-4 pt-3 gap-1">
                            {[
                              { key: "LIST", label: `Posters (${stPosters.length})` },
                              { key: "ADD_POSTER", label: "+ Add New Image" },
                              { key: "LINK_POSTER", label: "Link Existing" },
                              { key: "EDIT_INFO", label: "Edit Info" },
                            ].map(tab => (
                              <button
                                key={tab.key}
                                onClick={() => setActiveSubTopicPanel(tab.key as any)}
                                className={`px-3.5 py-2 rounded-t-xl text-[11px] font-extrabold transition-all border-b-2 -mb-px ${activeSubTopicPanel === tab.key
                                    ? "text-white border-white"
                                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                                  }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {/* ── Panel: Poster Grid ── */}
                          {activeSubTopicPanel === "LIST" && (
                            <div className="flex-1 p-5 overflow-y-auto">
                              {stPosters.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                                  <div className="text-3xl opacity-20">🖼️</div>
                                  <p className="text-zinc-500 font-bold text-sm">No posters yet in <span className="text-white">{editingSubTopic.name}</span></p>
                                  <div className="flex gap-2">
                                    <button onClick={() => setActiveSubTopicPanel("ADD_POSTER")} className="px-4 py-2 rounded-xl text-black font-extrabold text-xs transition-all hover:opacity-90" style={{ backgroundColor: "#D4FF3D" }}>+ Add New Image</button>
                                    <button onClick={() => setActiveSubTopicPanel("LINK_POSTER")} className="px-4 py-2 rounded-xl text-zinc-300 font-bold text-xs border border-zinc-700 hover:border-white transition-all">Link Existing</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                  {stPosters.map((p) => (
                                    <div key={p.id} className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all">
                                      <div className="relative w-full aspect-square bg-zinc-800">
                                        {p.images?.[0]?.url ? (
                                          <Image src={p.images[0].url} alt={p.title} fill className="object-cover" />
                                        ) : (
                                          <div className="absolute inset-0 flex items-center justify-center text-2xl text-zinc-700">🖼️</div>
                                        )}
                                        {/* Remove overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                          <button
                                            onClick={() => {
                                              const updated = { ...editingSubTopic, posterIds: editingSubTopic.posterIds.filter(id => id !== p.id) };
                                              setEditingSubTopic(updated);
                                              setSubTopicsList(prev => prev.map(s => s.id === updated.id ? updated : s));
                                            }}
                                            className="p-2 rounded-xl bg-red-500 text-white font-bold text-[10px] flex items-center gap-1 hover:bg-red-400 transition-colors"
                                          >
                                            <Trash2 className="w-3 h-3" /> Remove
                                          </button>
                                        </div>
                                      </div>
                                      <div className="p-2.5">
                                        <p className="font-bold text-white text-[11px] truncate">{p.title}</p>
                                        <p className="text-[10px] text-zinc-500 font-mono">₹{p.offerPrice || p.basePrice}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {/* Add more card */}
                                  <button
                                    onClick={() => setActiveSubTopicPanel("ADD_POSTER")}
                                    className="aspect-square rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-600 flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-zinc-400 transition-all"
                                  >
                                    <Plus className="w-6 h-6" />
                                    <span className="text-[10px] font-bold">Add Image</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── Panel: Add New Poster ── */}
                          {activeSubTopicPanel === "ADD_POSTER" && (
                            <div className="flex-1 p-5 overflow-y-auto">
                              <h3 className="font-extrabold text-white text-sm mb-4">Add New Image to <span style={{ color: "#D4FF3D" }}>{editingSubTopic.name}</span></h3>
                              <form onSubmit={handleAddPosterToSubTopic} className="space-y-4 text-xs max-w-lg">
                                {/* Image Upload */}
                                <div className="space-y-2">
                                  <label className="font-bold text-zinc-400">Poster Image *</label>
                                  <div className="flex items-start gap-3">
                                    <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-white/30 transition-all">
                                      {stNewPosterImageUrl ? (
                                        <div className="relative w-full h-full rounded-xl overflow-hidden">
                                          <Image src={stNewPosterImageUrl} alt="Preview" fill className="object-cover rounded-xl" />
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center gap-2 text-zinc-500">
                                          <UploadCloud className="w-8 h-8" />
                                          <span className="font-bold text-[11px]">Click to upload image</span>
                                          <span className="text-[10px]">JPG, PNG, WEBP</span>
                                        </div>
                                      )}
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setStNewPosterImageUrl(URL.createObjectURL(file));
                                      }} />
                                    </label>
                                    {stNewPosterImageUrl && (
                                      <button type="button" onClick={() => setStNewPosterImageUrl("")}
                                        className="p-2 rounded-xl bg-zinc-800 text-red-400 hover:bg-red-500/20 transition-colors">
                                        <X className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="font-bold text-zinc-400">Poster Title *</label>
                                  <input type="text" required value={stNewPosterTitle} onChange={e => setStNewPosterTitle(e.target.value)}
                                    placeholder={`e.g. ${editingSubTopic.name} - Dark Edition`}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-white focus:outline-none placeholder:text-zinc-600" />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="font-bold text-zinc-400">Description</label>
                                  <input type="text" value={stNewPosterDesc} onChange={e => setStNewPosterDesc(e.target.value)}
                                    placeholder="Short description"
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-white focus:outline-none placeholder:text-zinc-600" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <label className="font-bold text-zinc-400">Base Price (₹) *</label>
                                    <input type="number" required value={stNewPosterBasePrice} onChange={e => setStNewPosterBasePrice(e.target.value)}
                                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-white focus:outline-none" />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="font-bold text-zinc-400">Offer Price (₹)</label>
                                    <input type="number" value={stNewPosterOfferPrice} onChange={e => setStNewPosterOfferPrice(e.target.value)}
                                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-white focus:outline-none" />
                                  </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                  <button type="submit" disabled={!stNewPosterTitle.trim() || !stNewPosterImageUrl.trim()}
                                    className="flex-1 py-3 rounded-2xl text-black font-extrabold text-xs disabled:opacity-40 hover:opacity-90 transition-all"
                                    style={{ backgroundColor: "#D4FF3D" }}>
                                    Save &amp; Add to {editingSubTopic.name}
                                  </button>
                                  <button type="button" onClick={() => setActiveSubTopicPanel("LIST")}
                                    className="px-4 py-3 rounded-2xl border border-zinc-700 text-zinc-400 hover:text-white font-bold text-xs transition-all">
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}

                          {/* ── Panel: Link Existing Posters ── */}
                          {activeSubTopicPanel === "LINK_POSTER" && (
                            <div className="flex-1 p-5 overflow-y-auto">
                              <h3 className="font-extrabold text-white text-sm mb-1">Link Existing Posters to <span style={{ color: "#D4FF3D" }}>{editingSubTopic.name}</span></h3>
                              <p className="text-zinc-500 text-[11px] mb-4">Toggle to include/exclude catalog posters in this sub-category.</p>
                              {catPosters.length === 0 ? (
                                <p className="text-center py-8 text-zinc-600 italic text-xs">No existing posters in the <strong>{editingSubTopic.categorySlug}</strong> category. Add posters via "Add New Image" first.</p>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {catPosters.map((p) => {
                                    const isLinked = editingSubTopic.posterIds.includes(p.id);
                                    return (
                                      <div
                                        key={p.id}
                                        onClick={() => handleTogglePosterInSubTopic(p.id)}
                                        className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${isLinked ? "border-white" : "border-zinc-800 hover:border-zinc-600"
                                          }`}
                                      >
                                        <div className="relative w-full aspect-square bg-zinc-800">
                                          {p.images?.[0]?.url ? (
                                            <Image src={p.images[0].url} alt={p.title} fill className="object-cover" />
                                          ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-2xl text-zinc-700">🖼️</div>
                                          )}
                                          {isLinked && (
                                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                              <Check className="w-3 h-3 text-black" />
                                            </div>
                                          )}
                                          {!isLinked && (
                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                                              <Plus className="w-8 h-8 text-white" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="p-2 bg-zinc-900">
                                          <p className="font-bold text-white text-[10px] truncate">{p.title}</p>
                                          <p className="text-[9px] text-zinc-500">₹{p.offerPrice || p.basePrice}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              <div className="pt-4 mt-2 border-t border-zinc-800">
                                <button onClick={() => setActiveSubTopicPanel("LIST")} className="px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-zinc-200 transition-all">
                                  Done — View Posters
                                </button>
                              </div>
                            </div>
                          )}

                          {/* ── Panel: Edit Sub-Topic Info ── */}
                          {activeSubTopicPanel === "EDIT_INFO" && (
                            <div className="flex-1 p-5 overflow-y-auto">
                              <h3 className="font-extrabold text-white text-sm mb-4">Edit Sub-Category Info</h3>
                              <div className="space-y-4 text-xs max-w-md">
                                <div className="space-y-1.5">
                                  <label className="font-bold text-zinc-400">Name</label>
                                  <input type="text" value={stEditName} onChange={e => setStEditName(e.target.value)}
                                    placeholder={editingSubTopic.name}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-white focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-zinc-400">Description</label>
                                  <input type="text" value={stEditDesc} onChange={e => setStEditDesc(e.target.value)}
                                    placeholder={editingSubTopic.description}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-white focus:outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="font-bold text-zinc-400">Banner Image</label>
                                  <div className="flex items-center gap-3">
                                    <label className="flex-1 flex items-center justify-center h-12 border border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-white/30 transition-all text-[10px] text-zinc-500 font-bold gap-1.5">
                                      <UploadCloud className="w-4 h-4" />
                                      {stEditImageUrl ? "Image Changed ✓" : "Change Banner"}
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setStEditImageUrl(URL.createObjectURL(file));
                                      }} />
                                    </label>
                                    {(stEditImageUrl || editingSubTopic.imageUrl) && (
                                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0">
                                        <Image src={stEditImageUrl || editingSubTopic.imageUrl || ""} alt="" fill className="object-cover" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                  <button onClick={handleSaveSTInfo} className="flex-1 py-2.5 rounded-xl text-black font-extrabold text-xs hover:opacity-90 transition-all" style={{ backgroundColor: "#D4FF3D" }}>
                                    Save Changes
                                  </button>
                                  <button onClick={() => setActiveSubTopicPanel("LIST")} className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white font-bold text-xs transition-all">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}



            {/* ============================================================= */}
            {/* ORDERS DASHBOARD                                               */}
            {/* ============================================================= */}
            {adminTab === "ORDERS" && (() => {
              // --- helpers ---
              const now = new Date();
              const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

              const getDeadlineDate = (order: any) => {
                if (!order.date) return null;
                const placed = new Date(order.date);
                const deadline = new Date(placed.getTime() + 2 * 24 * 60 * 60 * 1000);
                return deadline;
              };

              const isWithin2Days = (order: any) => {
                if (order.status === "DELIVERED") return false;
                const d = getDeadlineDate(order);
                if (!d) return false;
                return d <= twoDaysLater;
              };

              // --- filter ---
              let filtered = [...ordersList];
              if (orderSearch.trim()) {
                const q = orderSearch.trim().toLowerCase();
                filtered = filtered.filter(o =>
                  o.orderNumber?.toLowerCase().includes(q) ||
                  o.customerDetails?.name?.toLowerCase().includes(q) ||
                  o.customerDetails?.phone?.toLowerCase().includes(q) ||
                  o.customerDetails?.email?.toLowerCase().includes(q)
                );
              }
              if (orderFilter === "DEADLINE_2DAYS") {
                filtered = filtered.filter(o => isWithin2Days(o));
              } else if (orderFilter !== "ALL") {
                filtered = filtered.filter(o => o.status === orderFilter);
              }

              // --- sort ---
              filtered.sort((a, b) => {
                if (orderSortBy === "DATE_DESC") return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
                if (orderSortBy === "DATE_ASC") return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
                if (orderSortBy === "AMOUNT_DESC") return (b.totalAmount || 0) - (a.totalAmount || 0);
                if (orderSortBy === "AMOUNT_ASC") return (a.totalAmount || 0) - (b.totalAmount || 0);
                return 0;
              });

              const statusColor: Record<string, string> = {
                CONFIRMED: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
                PRINTING: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
                SHIPPED: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
                DELIVERED: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                CANCELLED: "bg-red-500/15 text-red-400 border border-red-500/30",
              };

              const filterChips: { label: string; value: typeof orderFilter; count: number }[] = [
                { label: "All", value: "ALL", count: ordersList.length },
                { label: "Confirmed", value: "CONFIRMED", count: ordersList.filter(o => o.status === "CONFIRMED").length },
                { label: "Printing", value: "PRINTING", count: ordersList.filter(o => o.status === "PRINTING").length },
                { label: "Shipped", value: "SHIPPED", count: ordersList.filter(o => o.status === "SHIPPED").length },
                { label: "Delivered", value: "DELIVERED", count: ordersList.filter(o => o.status === "DELIVERED").length },
                { label: "⚠ Due ≤2 Days", value: "DEADLINE_2DAYS", count: ordersList.filter(o => isWithin2Days(o)).length },
              ];

              return (
                <div className="space-y-6 max-w-7xl mx-auto">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                    <div>
                      <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-white" />
                        <span>Orders Dashboard</span>
                      </h1>
                      <p className="text-xs text-zinc-400 mt-1">All customer orders — full details, status control &amp; delivery tracking.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-white bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full">
                        {ordersList.length} Total Orders
                      </span>
                      <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-full">
                        {ordersList.filter(o => isWithin2Days(o)).length} Due Soon
                      </span>
                    </div>
                  </div>

                  {/* Search + Sort bar */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-zinc-500" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={e => setOrderSearch(e.target.value)}
                        placeholder="Search by Order ID, Customer Name, Phone or Email…"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-white placeholder:text-zinc-600"
                      />
                    </div>
                    <select
                      value={orderSortBy}
                      onChange={e => setOrderSortBy(e.target.value as any)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-white"
                    >
                      <option value="DATE_DESC">Sort: Newest First</option>
                      <option value="DATE_ASC">Sort: Oldest First</option>
                      <option value="AMOUNT_DESC">Sort: Highest Amount</option>
                      <option value="AMOUNT_ASC">Sort: Lowest Amount</option>
                    </select>
                  </div>

                  {/* Filter chips */}
                  <div className="flex flex-wrap gap-2">
                    {filterChips.map(chip => (
                      <button
                        key={chip.value}
                        onClick={() => setOrderFilter(chip.value)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold transition-all border ${orderFilter === chip.value
                            ? chip.value === "DEADLINE_2DAYS"
                              ? "bg-amber-400 text-black border-amber-400"
                              : "bg-white text-black border-white"
                            : "text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                          }`}
                      >
                        {chip.label}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${orderFilter === chip.value ? "bg-black/20 text-current" : "bg-zinc-800 text-zinc-400"
                          }`}>{chip.count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Main Content: Table + Detail Panel */}
                  <div className={`grid gap-6 ${selectedOrderDetail ? "grid-cols-1 xl:grid-cols-[1fr_420px]" : "grid-cols-1"}`}>

                    {/* Orders Table */}
                    <div className="rounded-2xl border border-zinc-800 overflow-hidden">
                      {filtered.length === 0 ? (
                        <div className="py-20 text-center text-zinc-500 font-semibold">
                          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-20" />
                          <p>No orders found{orderFilter !== "ALL" || orderSearch ? " matching your filter" : ". Orders will appear here after customers place them."}.</p>
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 text-[11px] uppercase tracking-wider font-extrabold">
                              <th className="px-4 py-3.5">Order</th>
                              <th className="px-4 py-3.5">Customer</th>
                              <th className="px-4 py-3.5 hidden md:table-cell">Items</th>
                              <th className="px-4 py-3.5 hidden lg:table-cell">Amount</th>
                              <th className="px-4 py-3.5">Status</th>
                              <th className="px-4 py-3.5 hidden sm:table-cell">Date</th>
                              <th className="px-4 py-3.5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((order, idx) => {
                              const deadline = getDeadlineDate(order);
                              const urgent = isWithin2Days(order);
                              const isSelected = selectedOrderDetail?.id === order.id;
                              return (
                                <tr
                                  key={order.id || idx}
                                  className={`border-b border-zinc-900 transition-colors cursor-pointer ${isSelected ? "bg-white/5 border-white/10" :
                                      urgent ? "bg-amber-500/5 hover:bg-amber-500/10" :
                                        "hover:bg-zinc-900/60"
                                    }`}
                                  onClick={() => setSelectedOrderDetail(isSelected ? null : order)}
                                >
                                  <td className="px-4 py-3.5">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-mono font-bold text-white text-[11px]">{order.orderNumber}</span>
                                      {urgent && (
                                        <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider">⚠ Due Soon</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <div>
                                      <p className="font-bold text-white">{order.customerDetails?.name || "—"}</p>
                                      <p className="text-zinc-500 text-[10px]">{order.customerDetails?.phone || ""}</p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3.5 hidden md:table-cell text-zinc-400">
                                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                                  </td>
                                  <td className="px-4 py-3.5 hidden lg:table-cell font-bold text-white font-mono">
                                    {formatCurrency(order.totalAmount || 0)}
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <select
                                      value={order.status || "CONFIRMED"}
                                      onClick={e => e.stopPropagation()}
                                      onChange={e => {
                                        const newStatus = e.target.value;
                                        setOrdersList(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                                        if (selectedOrderDetail?.id === order.id) {
                                          setSelectedOrderDetail((prev: any) => prev ? { ...prev, status: newStatus } : prev);
                                        }
                                      }}
                                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full cursor-pointer border-none outline-none ${statusColor[order.status] || "bg-zinc-800 text-zinc-400"
                                        } appearance-none pr-5 bg-no-repeat`}
                                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundPosition: "right 6px center", backgroundSize: "12px" }}
                                    >
                                      <option value="CONFIRMED">Confirmed</option>
                                      <option value="PRINTING">Printing</option>
                                      <option value="SHIPPED">Shipped</option>
                                      <option value="DELIVERED">Delivered</option>
                                      <option value="CANCELLED">Cancelled</option>
                                    </select>
                                  </td>
                                  <td className="px-4 py-3.5 hidden sm:table-cell text-zinc-500 font-mono">{order.date || "—"}</td>
                                  <td className="px-4 py-3.5 text-right">
                                    <button
                                      onClick={e => { e.stopPropagation(); setSelectedOrderDetail(isSelected ? null : order); }}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all ${isSelected ? "bg-white text-black" : "bg-zinc-800 text-zinc-300 hover:bg-white hover:text-black"
                                        }`}
                                    >
                                      {isSelected ? "Close" : "Details"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Order Detail Panel */}
                    {selectedOrderDetail && (
                      <div className="rounded-2xl border border-zinc-700 bg-zinc-950 overflow-hidden h-fit sticky top-4">
                        {/* Panel Header */}
                        <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Order Details</span>
                            <h2 className="text-sm font-extrabold text-white mt-0.5 font-mono">{selectedOrderDetail.orderNumber}</h2>
                          </div>
                          <button
                            onClick={() => setSelectedOrderDetail(null)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-5 space-y-5 text-xs overflow-y-auto" style={{ maxHeight: '80vh' }}>
                          {/* Status control */}
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-400 font-bold">Status:</span>
                            <select
                              value={selectedOrderDetail.status || "CONFIRMED"}
                              onChange={e => {
                                const newStatus = e.target.value;
                                setSelectedOrderDetail((prev: any) => ({ ...prev, status: newStatus }));
                                setOrdersList(prev => prev.map(o => o.id === selectedOrderDetail.id ? { ...o, status: newStatus } : o));
                              }}
                              className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer ${statusColor[selectedOrderDetail.status] || "bg-zinc-800 text-zinc-400"
                                }`}
                            >
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="PRINTING">Printing</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>

                          {/* Customer Info */}
                          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                            <p className="font-extrabold text-white text-[11px] uppercase tracking-wider border-b border-zinc-800 pb-2">👤 Customer Information</p>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Name</span>
                                <span className="font-bold text-white">{selectedOrderDetail.customerDetails?.name || "—"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Phone</span>
                                <span className="font-bold text-white font-mono">{selectedOrderDetail.customerDetails?.phone || "—"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-500">Email</span>
                                <span className="font-bold text-white truncate ml-4 text-right">{selectedOrderDetail.customerDetails?.email || "—"}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-zinc-500 flex-shrink-0">Payment</span>
                                <span className="font-bold text-white text-right">{selectedOrderDetail.customerDetails?.paymentMethod || "COD"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Address */}
                          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                            <p className="font-extrabold text-white text-[11px] uppercase tracking-wider border-b border-zinc-800 pb-2">📍 Delivery Address</p>
                            <p className="text-zinc-300 leading-relaxed">{selectedOrderDetail.customerDetails?.address || "No address provided"}</p>
                            <p className="text-zinc-500 font-mono">Est. Delivery: <span className="text-amber-400">{selectedOrderDetail.estimatedDelivery || "—"}</span></p>
                          </div>

                          {/* Ordered Items */}
                          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                            <p className="font-extrabold text-white text-[11px] uppercase tracking-wider border-b border-zinc-800 pb-2">🛍 Ordered Items</p>
                            <div className="space-y-2">
                              {(selectedOrderDetail.items || []).map((item: any, i: number) => (
                                <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-zinc-800/60 last:border-0">
                                  <div className="flex-1">
                                    <p className="font-bold text-white">{item.title}</p>
                                    <p className="text-zinc-500 text-[10px] mt-0.5">
                                      Size: {item.size || "Standard"} · Frame: {item.frame ? "Yes" : "No"}
                                    </p>
                                  </div>
                                  <span className="font-extrabold text-white bg-zinc-800 px-2.5 py-1 rounded-lg font-mono text-[11px]">
                                    ×{item.qty}
                                  </span>
                                </div>
                              ))}
                              {(!selectedOrderDetail.items || selectedOrderDetail.items.length === 0) && (
                                <p className="text-zinc-500 italic">No items recorded</p>
                              )}
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                            <p className="font-extrabold text-white text-[11px] uppercase tracking-wider border-b border-zinc-800 pb-2">💰 Order Summary</p>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Order ID</span>
                              <span className="font-mono text-white font-bold">{selectedOrderDetail.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">Order Date</span>
                              <span className="text-white font-bold">{selectedOrderDetail.date || "—"}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-zinc-800">
                              <span className="font-extrabold text-white">Total Amount</span>
                              <span className="font-extrabold text-xl" style={{ color: "#D4FF3D" }}>{formatCurrency(selectedOrderDetail.totalAmount || 0)}</span>
                            </div>
                          </div>

                          {/* Delete Order */}
                          <button
                            onClick={() => {
                              if (confirm(`Delete order ${selectedOrderDetail.orderNumber}?`)) {
                                setOrdersList(prev => prev.filter(o => o.id !== selectedOrderDetail.id));
                                setSelectedOrderDetail(null);
                              }
                            }}
                            className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-xs transition-colors"
                          >
                            Delete Order Record
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </main>

        </div>
      )}

      {/* SLIDE-OVER CART DRAWER & ORDER SUMMARY PANEL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setIsCartOpen(false)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div
                className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out sm:duration-300"
                style={{ backgroundColor: "#0D0D0D", borderLeft: "1px solid rgba(212,255,61,0.2)" }}
              >
                <div className="flex h-full flex-col overflow-y-scroll py-6 shadow-2xl text-xs text-white">
                  {/* Header */}
                  <div className="px-4 sm:px-6 flex items-center justify-between border-b pb-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" style={{ color: "#D4FF3D" }} />
                      <h2 className="text-sm font-extrabold text-white" id="slide-over-title">Your Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="p-1 rounded-xl hover:bg-zinc-800 transition-colors"
                      style={{ color: "#D4FF3D" }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
                    {checkoutStep === "CART" && (
                      cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                          <div className="p-4 rounded-full bg-zinc-900 border" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                            <ShoppingBag className="w-8 h-8 text-zinc-500" />
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-zinc-300">Your bag is empty</p>
                            <p className="text-[11px] text-zinc-500 mt-1">Add premium prints or upload custom artwork to get started.</p>
                          </div>
                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="px-5 py-2.5 rounded-xl font-bold text-[11px] transition-transform hover:scale-105"
                            style={{ backgroundColor: "#D4FF3D", color: "#0D0D0D" }}
                          >
                            Continue Shopping
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cart.map((item, idx) => (
                            <div
                              key={`${item.poster.id}-${item.size}-${item.frame}`}
                              className="flex items-start gap-4 p-3 rounded-2xl border"
                              style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
                            >
                              {/* Poster Image */}
                              <div className="relative w-16 h-20 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                                {item.poster.images?.[0]?.url ? (
                                  <Image src={item.poster.images[0].url} alt={item.poster.title} fill className="object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-zinc-600" />
                                  </div>
                                )}
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0 space-y-1">
                                <h4 className="font-bold text-white truncate text-xs">{item.poster.title}</h4>
                                <p className="text-[10px] text-zinc-400">Size: {item.size} • {item.frame ? "Framed" : "Unframed"}</p>

                                {/* Quantity Stepper */}
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => updateCartQty(idx, -1)}
                                    className="w-5 h-5 rounded-md bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold text-white transition-colors"
                                  >
                                    <Minus className="w-2.5 h-2.5" />
                                  </button>
                                  <span className="font-bold font-mono text-[11px] w-4 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartQty(idx, 1)}
                                    className="w-5 h-5 rounded-md bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold text-white transition-colors"
                                  >
                                    <Plus className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Cost & Delete */}
                              <div className="flex flex-col items-end justify-between h-20 flex-shrink-0">
                                <span className="font-extrabold text-[11px]" style={{ color: "#D4FF3D" }}>
                                  {formatCurrency((item.poster.offerPrice || item.poster.basePrice) * item.quantity)}
                                </span>
                                <button
                                  onClick={() => updateCartQty(idx, -item.quantity)}
                                  className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {checkoutStep === "SHIPPING" && (
                      <form onSubmit={handlePlaceOrder} className="space-y-4">
                        <div className="text-center pb-2 border-b border-zinc-800">
                          <h3 className="font-extrabold text-white text-xs">Shipping Address &amp; Delivery</h3>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Please provide your dispatch details below.</p>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="font-bold text-zinc-400 text-[10px]">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={checkoutName}
                              onChange={(e) => setCheckoutName(e.target.value)}
                              placeholder="e.g. Rahul Sharma"
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-zinc-400 text-[10px]">Email Address *</label>
                            <input
                              type="email"
                              required
                              value={checkoutEmail}
                              onChange={(e) => setCheckoutEmail(e.target.value)}
                              placeholder="e.g. rahul@example.com"
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-zinc-400 text-[10px]">Phone Number *</label>
                            <input
                              type="tel"
                              required
                              value={checkoutPhone}
                              onChange={(e) => setCheckoutPhone(e.target.value)}
                              placeholder="e.g. 9876543210"
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-zinc-400 text-[10px]">Delivery Address *</label>
                            <textarea
                              required
                              rows={3}
                              value={checkoutAddress}
                              onChange={(e) => setCheckoutAddress(e.target.value)}
                              placeholder="Complete address with pincode..."
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-white focus:outline-none resize-none"
                            />
                          </div>

                          {/* Delivery Zone Selector */}
                          {availableZones.length > 0 && (
                            <div className="space-y-1">
                              <label className="font-bold text-zinc-400 text-[10px]">Delivery Region / Zone *</label>
                              <select
                                value={selectedZone?.id || ""}
                                onChange={(e) => handleZoneChange(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-white focus:outline-none"
                              >
                                {availableZones.filter(z => z.active).map((z) => (
                                  <option key={z.id} value={z.id}>
                                    {z.name} ({z.estimatedDays || "3-5 days"})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Shipping Options Selector */}
                          {selectedZone && selectedZone.shippingOptions && selectedZone.shippingOptions.filter((o: any) => o.active).length > 0 && (
                            <div className="space-y-2">
                              <label className="font-bold text-zinc-400 text-[10px]">Shipping Speed & Method *</label>
                              <div className="space-y-2">
                                {selectedZone.shippingOptions.filter((o: any) => o.active).map((o: any) => (
                                  <label
                                    key={o.id}
                                    onClick={() => setSelectedShippingOption(o)}
                                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${selectedShippingOption?.id === o.id
                                        ? "border-[#D4FF3D] bg-[#D4FF3D]/5 text-white"
                                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                                      }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <input
                                        type="radio"
                                        name="shippingOption"
                                        checked={selectedShippingOption?.id === o.id}
                                        onChange={() => { }}
                                        className="text-[#D4FF3D] focus:ring-[#D4FF3D] bg-zinc-900 border-zinc-800"
                                      />
                                      <div className="text-left">
                                        <p className="font-bold">{o.name}</p>
                                        <p className="text-[9px] text-zinc-500">{o.estimatedDays}</p>
                                      </div>
                                    </div>
                                    <span className="font-bold text-white">
                                      {o.price === 0 ? "FREE" : formatCurrency(o.price)}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="font-bold text-zinc-400 text-[10px]">Payment Method *</label>
                            <select
                              value={checkoutPaymentMethod}
                              onChange={(e) => setCheckoutPaymentMethod(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-white focus:outline-none"
                            >
                              <option value="COD">Cash on Delivery (COD) / Pay on Delivery</option>
                              <option value="PREPAID">Prepaid Card / UPI (Simulated Gateway)</option>
                            </select>
                          </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCheckoutStep("CART")}
                            className="flex-1 py-3 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-white font-extrabold text-[11px] transition-colors"
                          >
                            Back to Bag
                          </button>
                          <button
                            type="submit"
                            className="flex-[2] py-3 rounded-xl font-extrabold text-[11px] transition-transform hover:scale-[1.01]"
                            style={{ backgroundColor: "#D4FF3D", color: "#0D0D0D" }}
                          >
                            Confirm &amp; Place Order ({formatCurrency(cartTotal)})
                          </button>
                        </div>
                      </form>
                    )}

                    {checkoutStep === "SUCCESS" && lastPlacedOrder && (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-5 px-2">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-extrabold text-white text-sm">Order Confirmed Successfully!</h3>
                          <p className="text-[10px] text-zinc-400">Thank you for shopping at Maja Posters.</p>
                        </div>

                        <div className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-850 space-y-3 text-left">
                          <div className="flex justify-between text-[10px] border-b border-zinc-800 pb-2">
                            <span className="text-zinc-400">Order ID:</span>
                            <span className="font-bold font-mono text-white">{lastPlacedOrder.orderNumber}</span>
                          </div>

                          <div className="text-[10px] space-y-1 text-zinc-300">
                            <p><strong>Deliver to:</strong> {lastPlacedOrder.customerDetails.name}</p>
                            <p className="truncate"><strong>Address:</strong> {lastPlacedOrder.customerDetails.address}</p>
                            <p><strong>Method:</strong> {lastPlacedOrder.customerDetails.paymentMethod === "COD" ? "Cash on Delivery" : "Prepaid Online"}</p>
                            <p style={{ color: "#D4FF3D" }}><strong>Est. Delivery:</strong> {lastPlacedOrder.estimatedDelivery}</p>
                          </div>
                        </div>

                        <p className="text-[9px] text-zinc-500 italic">
                          💡 You can copy the Order ID and track it anytime in the "Track Order" tab at the top.
                        </p>

                        <button
                          onClick={() => {
                            setCheckoutStep("CART");
                            setIsCartOpen(false);
                          }}
                          className="w-full py-3 rounded-xl font-extrabold text-[11px]"
                          style={{ backgroundColor: "#D4FF3D", color: "#0D0D0D" }}
                        >
                          Continue Shopping
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary & Footer checkout block */}
                  {checkoutStep === "CART" && cart.length > 0 && (
                    <div className="px-4 sm:px-6 border-t pt-5 space-y-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                      {/* Price breakdown */}
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Bag Subtotal</span>
                          <span className="font-semibold">{formatCurrency(cartSubtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">GST (18% inclusive estimate)</span>
                          <span className="font-semibold">{formatCurrency(cartGST)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Chennai Priority Dispatch</span>
                          {cartShipping === 0 ? (
                            <span className="font-bold text-emerald-400 uppercase text-[10px]">FREE</span>
                          ) : (
                            <span className="font-semibold">{formatCurrency(cartShipping)}</span>
                          )}
                        </div>
                        {cartSubtotal < 999 && (
                          <p className="text-[10px] text-zinc-500 italic mt-0.5">Add {formatCurrency(999 - cartSubtotal)} more for free delivery.</p>
                        )}
                        <div className="h-px my-2" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-white">Order Total</span>
                          <span style={{ color: "#D4FF3D" }}>{formatCurrency(cartTotal)}</span>
                        </div>
                      </div>

                      {/* Checkout button */}
                      <button
                        onClick={() => setCheckoutStep("SHIPPING")}
                        className="w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
                        style={{ backgroundColor: "#D4FF3D", color: "#0D0D0D" }}
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Proceed to Pay {formatCurrency(cartTotal)}</span>
                      </button>
                      <p className="text-center text-[9px] text-zinc-500">Secure transactions powered by Razorpay. Cash on Delivery active in Chennai.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER WISHLIST DRAWER */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="wishlist-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
              onClick={() => setIsWishlistOpen(false)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div
                className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out sm:duration-300"
                style={{ backgroundColor: "#0D0D0D", borderLeft: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex h-full flex-col overflow-y-scroll py-6 shadow-2xl text-xs text-white">
                  {/* Header */}
                  <div className="px-4 sm:px-6 flex items-center justify-between border-b pb-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      <h2 className="text-sm font-extrabold text-white" id="wishlist-title">My Wishlist ({wishlist.length})</h2>
                    </div>
                    <button
                      onClick={() => setIsWishlistOpen(false)}
                      className="p-1 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
                    {wishlist.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-zinc-900 border" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                          <Heart className="w-8 h-8 text-zinc-600" />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-zinc-300">Your wishlist is empty</p>
                          <p className="text-[11px] text-zinc-500 mt-1">Tap the heart icon on any print to save it for later.</p>
                        </div>
                        <button
                          onClick={() => setIsWishlistOpen(false)}
                          className="px-5 py-2.5 rounded-xl font-bold text-[11px] border border-zinc-700 hover:border-white transition-colors"
                        >
                          Explore Prints
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {postersList.filter(p => wishlist.includes(p.id)).map((poster) => (
                          <div
                            key={poster.id}
                            className="flex items-center gap-4 p-3 rounded-2xl border"
                            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}
                          >
                            {/* Poster Image */}
                            <div className="relative w-14 h-18 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                              {poster.images?.[0]?.url ? (
                                <Image src={poster.images[0].url} alt={poster.title} fill className="object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Package className="w-4 h-4 text-zinc-600" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white truncate text-xs">{poster.title}</h4>
                              <p className="text-[10px]" style={{ color: "#D4FF3D" }}>{formatCurrency(poster.offerPrice || poster.basePrice)}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  addToCart(poster);
                                  toggleWishlist(poster.id);
                                }}
                                className="px-3 py-1.5 rounded-xl font-bold text-[10px] shadow-sm hover:scale-105 transition-transform"
                                style={{ backgroundColor: "#D4FF3D", color: "#0D0D0D" }}
                              >
                                Add to Cart
                              </button>
                              <button
                                onClick={() => toggleWishlist(poster.id)}
                                className="p-2 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors"
                                title="Remove from Wishlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED SINGLE LOGIN & SIGNUP MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-4 text-xs shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-bold text-sm text-foreground">
                {authMode === "LOGIN" ? "Unified Sign In" : "Create New Account"}
              </h2>
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setAuthMode("LOGIN");
                }}
                className="p-1 rounded hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Auth Tab Selectors */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setAuthMode("LOGIN")}
                className={`py-1.5 rounded-lg font-bold transition-all text-[11px] ${authMode === "LOGIN" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode("SIGNUP")}
                className={`py-1.5 rounded-lg font-bold transition-all text-[11px] ${authMode === "SIGNUP" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message banner */}
            {loginError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
                {loginError}
              </div>
            )}

            {/* LOGIN FORM */}
            {authMode === "LOGIN" ? (
              <form onSubmit={handleSingleLogin} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@posterstore.com OR customer@example.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <button type="submit" className="w-full py-3 rounded-xl text-white font-bold text-xs mt-2 shadow-md hover:opacity-90 transition-opacity" style={{ backgroundColor: '#C9A227' }}>
                  Sign In to Workspace
                </button>

                <p className="text-center text-muted-foreground mt-2">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setAuthMode("SIGNUP")} className="font-bold text-[#C9A227] hover:underline">
                    Sign Up
                  </button>
                </p>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSingleSignup} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Password *</label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    minLength={6}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Shipping Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    placeholder="Door No, Street Name, Locality, City & Pincode"
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border resize-none"
                  />
                </div>

                <button type="submit" className="w-full py-3 rounded-xl text-white font-bold text-xs mt-2 shadow-md hover:opacity-90 transition-opacity" style={{ backgroundColor: '#C9A227' }}>
                  Register & Shop
                </button>

                <p className="text-center text-muted-foreground mt-2">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setAuthMode("LOGIN")} className="font-bold text-[#C9A227] hover:underline">
                    Sign In
                  </button>
                </p>
              </form>
            )}

            <div className="p-3 rounded-xl bg-muted/40 text-[10px] text-muted-foreground space-y-1 font-mono">
              <p className="font-bold text-foreground">Test Accounts:</p>
              <p>• Admin: admin@posterstore.com / AdminPass123!</p>
              <p>• Customer: customer@example.com / CustomerPass123!</p>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW POSTER LIGHTBOX MODAL */}
      {selectedPoster && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPoster(null)}>
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              <Image src={selectedPoster.images?.[0]?.url || ""} alt={selectedPoster.title} fill className="object-cover" />
            </div>
            <div className="space-y-4 text-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase" style={{ color: '#C9A227' }}>{selectedPoster.category?.name}</span>
                <h2 className="text-lg font-bold text-foreground mt-1">{selectedPoster.title}</h2>
                <p className="text-base font-extrabold text-foreground mt-2">{formatCurrency(selectedPoster.offerPrice || selectedPoster.basePrice)}</p>
                <p className="text-muted-foreground mt-2 leading-relaxed">{selectedPoster.description}</p>
              </div>
              <div className="space-y-2">
                {(() => {
                  const cartItem = cart.find(item => item.poster.id === selectedPoster.id);
                  const quantityInCart = cartItem ? cartItem.quantity : 0;
                  if (quantityInCart > 0) {
                    const itemIdx = cart.findIndex(item => item.poster.id === selectedPoster.id);
                    return (
                      <div className="flex items-center justify-between border border-[#C9A227]/30 bg-[#C9A227]/10 p-1.5 rounded-xl">
                        <button
                          onClick={() => updateCartQty(itemIdx, -1)}
                          className="w-8 h-8 rounded-lg bg-[#C9A227] hover:bg-[#C9A227]/80 text-white flex items-center justify-center font-bold transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-extrabold text-sm text-foreground">{quantityInCart} in Cart</span>
                        <button
                          onClick={() => updateCartQty(itemIdx, 1)}
                          className="w-8 h-8 rounded-lg bg-[#C9A227] hover:bg-[#C9A227]/80 text-white flex items-center justify-center font-bold transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }
                  return (
                    <button
                      onClick={() => {
                        addToCart(selectedPoster);
                        setSelectedPoster(null);
                      }}
                      className="w-full py-3 rounded-xl text-white font-bold" style={{ backgroundColor: '#C9A227' }}
                    >
                      Add to Cart
                    </button>
                  );
                })()}
                <button onClick={() => setSelectedPoster(null)} className="w-full py-2 rounded-xl border border-border">
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCelebrationBallpit && (
        <div className="fixed inset-0 z-[100] pointer-events-none w-full h-full" style={{ mixBlendMode: 'screen' }}>
          <Ballpit
            count={100}
            gravity={0.08}
            friction={0.995}
            wallBounce={0.9}
            followCursor={true}
            colors={[0xD4FF3D, 0x000000, 0x555555]}
          />
        </div>
      )}
    </div>
  );
}
