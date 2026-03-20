"use client";

import { useState, useCallback, useEffect } from "react";
import {
  createListing,
  purchase,
  markShipped,
  confirmReceived,
  getAllListings,
  getAvailableListings,
  CONTRACT_ADDRESS,
  Listing,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
      <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
      <circle cx="7" cy="18" r="2" />
      <path d="M15 18H9" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ── Status Config ────────────────────────────────────────────

const STATUS_CONFIG: Record<number, { label: string; color: string; bg: string; border: string; dot: string; variant: "success" | "warning" | "info" }> = {
  0: { label: "Available", color: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/20", dot: "bg-[#34d399]", variant: "success" },
  1: { label: "Purchased", color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", border: "border-[#fbbf24]/20", dot: "bg-[#fbbf24]", variant: "warning" },
  2: { label: "Shipped", color: "text-[#4fc3f7]", bg: "bg-[#4fc3f7]/10", border: "border-[#4fc3f7]/20", dot: "bg-[#4fc3f7]", variant: "info" },
  3: { label: "Received", color: "text-[#7c6cf0]", bg: "bg-[#7c6cf0]/10", border: "border-[#7c6cf0]/20", dot: "bg-[#7c6cf0]", variant: "success" },
};

function formatPrice(price: string | number, token: string): string {
  const p = typeof price === "string" ? parseInt(price) : price;
  const stroops = p;
  const xlm = stroops / 10000000;
  if (xlm >= 1000000) return `${(xlm / 1000000).toFixed(1)}M XLM`;
  if (xlm >= 1000) return `${(xlm / 1000).toFixed(1)}K XLM`;
  return `${xlm.toFixed(7)} XLM`;
}

function formatPriceInput(price: string): bigint {
  // Input in XLM, convert to stroops
  const xlm = parseFloat(price);
  if (isNaN(xlm) || xlm <= 0) return 0n;
  return BigInt(Math.round(xlm * 10000000));
}

function truncate(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ── Listing Card ─────────────────────────────────────────────

function ListingCard({
  listing,
  walletAddress,
  onPurchase,
  onMarkShipped,
  onConfirmReceived,
  isLoading,
}: {
  listing: Listing;
  walletAddress: string | null;
  onPurchase: (id: number) => void;
  onMarkShipped: (id: number) => void;
  onConfirmReceived: (id: number) => void;
  isLoading: boolean;
}) {
  const statusCfg = STATUS_CONFIG[listing.status] || STATUS_CONFIG[0];
  const isSeller = walletAddress && listing.seller === walletAddress;
  const isBuyer = walletAddress && listing.buyer === walletAddress;
  const canPurchase = listing.status === 0 && walletAddress && !isSeller;
  const canShip = listing.status === 1 && isSeller;
  const canConfirm = listing.status === 2 && isBuyer;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3 animate-fade-in-up group hover:border-white/[0.1] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white/90 truncate">{listing.title}</h4>
          <p className="text-xs text-white/30 mt-0.5 line-clamp-2">{listing.description}</p>
        </div>
        <Badge variant={statusCfg.variant}>
          <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
          {statusCfg.label}
        </Badge>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-white/30">
        <span className="flex items-center gap-1">
          <UserIcon />
          {truncate(listing.seller)}
        </span>
        <span className="font-mono text-[#fbbf24]/70">{formatPrice(listing.price, listing.token)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {canPurchase && (
          <ShimmerButton
            onClick={() => onPurchase(Number(listing.id))}
            disabled={isLoading}
            shimmerColor="#34d399"
            className="flex-1 text-xs"
          >
            {isLoading ? <><SpinnerIcon /> Processing...</> : <><ShoppingBagIcon /> Purchase</>}
          </ShimmerButton>
        )}
        {canShip && (
          <ShimmerButton
            onClick={() => onMarkShipped(Number(listing.id))}
            disabled={isLoading}
            shimmerColor="#4fc3f7"
            className="flex-1 text-xs"
          >
            {isLoading ? <><SpinnerIcon /> Processing...</> : <><TruckIcon /> Mark Shipped</>}
          </ShimmerButton>
        )}
        {canConfirm && (
          <ShimmerButton
            onClick={() => onConfirmReceived(Number(listing.id))}
            disabled={isLoading}
            shimmerColor="#7c6cf0"
            className="flex-1 text-xs"
          >
            {isLoading ? <><SpinnerIcon /> Processing...</> : <><CheckCircleIcon /> Confirm Received</>}
          </ShimmerButton>
        )}
        {listing.status === 0 && isSeller && (
          <span className="flex-1 text-center text-xs text-white/20 py-2">Your listing</span>
        )}
        {listing.status === 0 && !walletAddress && (
          <span className="flex-1 text-center text-xs text-white/20 py-2">Connect wallet</span>
        )}
        {(listing.status === 1 || listing.status === 2 || listing.status === 3) && !isSeller && !isBuyer && (
          <span className="flex-1 text-center text-xs text-white/20 py-2">In transaction</span>
        )}
      </div>
    </div>
  );
}

// ── Input Component ─────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "browse" | "my-listings" | "create";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Create listing state
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createPrice, setCreatePrice] = useState("");
  const [createToken, setCreateToken] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadListings = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await getAllListings();
      if (data) {
        const mapped: Listing[] = (data as any[]).map((l: any) => ({
          id: String(l.id),
          seller: l.seller,
          title: l.title,
          description: l.description,
          price: String(l.price),
          token: l.token,
          buyer: l.buyer,
          status: Number(l.status),
        }));
        setListings(mapped);
      }
    } catch (err: unknown) {
      // silently fail on refresh
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const handleCreateListing = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!createTitle.trim() || !createDesc.trim() || !createPrice.trim()) {
      return setError("Fill in all fields");
    }
    const price = formatPriceInput(createPrice);
    if (price <= 0n) return setError("Invalid price");
    const token = createToken.trim() || walletAddress; // Use wallet as placeholder if no token
    setError(null);
    setIsCreating(true);
    setTxStatus("Awaiting signature...");
    try {
      await createListing(walletAddress, createTitle.trim(), createDesc.trim(), price, token);
      setTxStatus("Listing created on-chain!");
      setCreateTitle("");
      setCreateDesc("");
      setCreatePrice("");
      setCreateToken("");
      await loadListings();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsCreating(false);
    }
  }, [walletAddress, createTitle, createDesc, createPrice, createToken, loadListings]);

  const handlePurchase = useCallback(async (listingId: number) => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsLoading(true);
    setTxStatus("Awaiting signature...");
    try {
      await purchase(walletAddress, listingId);
      setTxStatus("Purchase confirmed on-chain!");
      await loadListings();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, loadListings]);

  const handleMarkShipped = useCallback(async (listingId: number) => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsLoading(true);
    setTxStatus("Awaiting signature...");
    try {
      await markShipped(walletAddress, listingId);
      setTxStatus("Item marked as shipped!");
      await loadListings();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, loadListings]);

  const handleConfirmReceived = useCallback(async (listingId: number) => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsLoading(true);
    setTxStatus("Awaiting signature...");
    try {
      await confirmReceived(walletAddress, listingId);
      setTxStatus("Transaction complete — item received!");
      await loadListings();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, loadListings]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "browse", label: "Browse", icon: <GridIcon />, color: "#34d399" },
    { key: "my-listings", label: "My Listings", icon: <UserIcon />, color: "#7c6cf0" },
    { key: "create", label: "Sell", icon: <PlusIcon />, color: "#fbbf24" },
  ];

  const availableListings = listings.filter(l => l.status === 0);
  const myListings = listings.filter(l => walletAddress && l.seller === walletAddress);
  const myPurchases = listings.filter(l => walletAddress && l.buyer === walletAddress);

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            <CheckCircleIcon />
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#fbbf24]/20 to-[#f97316]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#fbbf24]">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Decentralized Marketplace</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadListings}
                disabled={isRefreshing}
                className="p-2 rounded-lg border border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/[0.1] transition-all disabled:opacity-50"
              >
                <RefreshIcon />
              </button>
              <Badge variant="info" className="text-[10px]">Soroban</Badge>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {t.key === "browse" && availableListings.length > 0 && (
                  <span className="ml-1 rounded-full bg-[#34d399]/15 text-[#34d399] text-[10px] font-bold px-1.5 py-0.5">
                    {availableListings.length}
                  </span>
                )}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
            {/* Browse */}
            {activeTab === "browse" && (
              <div className="space-y-3">
                {availableListings.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto text-white/20">
                      <ShoppingBagIcon />
                    </div>
                    <div>
                      <p className="text-sm text-white/40">No listings available</p>
                      <p className="text-xs text-white/20 mt-1">Be the first to list something for sale</p>
                    </div>
                  </div>
                ) : (
                  availableListings.map((l) => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      walletAddress={walletAddress}
                      onPurchase={handlePurchase}
                      onMarkShipped={handleMarkShipped}
                      onConfirmReceived={handleConfirmReceived}
                      isLoading={isLoading}
                    />
                  ))
                )}
              </div>
            )}

            {/* My Listings */}
            {activeTab === "my-listings" && (
              <div className="space-y-4">
                {!walletAddress ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto text-white/20">
                      <UserIcon />
                    </div>
                    <button
                      onClick={onConnect}
                      disabled={isConnecting}
                      className="text-sm text-[#7c6cf0]/60 hover:text-[#7c6cf0]/80 transition-colors"
                    >
                      Connect wallet to view your listings
                    </button>
                  </div>
                ) : (
                  <>
                    {myListings.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-white/25 mb-3">
                          Listings you created
                        </p>
                        <div className="space-y-3">
                          {myListings.map((l) => (
                            <ListingCard
                              key={l.id}
                              listing={l}
                              walletAddress={walletAddress}
                              onPurchase={handlePurchase}
                              onMarkShipped={handleMarkShipped}
                              onConfirmReceived={handleConfirmReceived}
                              isLoading={isLoading}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {myPurchases.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-white/25 mb-3 mt-4">
                          Items you purchased
                        </p>
                        <div className="space-y-3">
                          {myPurchases.map((l) => (
                            <ListingCard
                              key={l.id}
                              listing={l}
                              walletAddress={walletAddress}
                              onPurchase={handlePurchase}
                              onMarkShipped={handleMarkShipped}
                              onConfirmReceived={handleConfirmReceived}
                              isLoading={isLoading}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {myListings.length === 0 && myPurchases.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-white/30">You have no listings or purchases yet</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Create Listing */}
            {activeTab === "create" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-xs text-white/30">
                  fn create_listing(seller, title, description, price, token) → listing_id
                </div>
                <Input
                  label="Item Title"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="e.g. Vintage Camera"
                  maxLength={100}
                />
                <Input
                  label="Description"
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Describe the item..."
                  maxLength={500}
                />
                <Input
                  label="Price (XLM)"
                  value={createPrice}
                  onChange={(e) => setCreatePrice(e.target.value)}
                  placeholder="e.g. 5.0"
                  type="number"
                  step="0.0000001"
                  min="0"
                />
                <Input
                  label="Token Address (leave blank for XLM)"
                  value={createToken}
                  onChange={(e) => setCreateToken(e.target.value)}
                  placeholder="CD... or leave blank"
                />
                {walletAddress ? (
                  <ShimmerButton
                    onClick={handleCreateListing}
                    disabled={isCreating}
                    shimmerColor="#fbbf24"
                    className="w-full"
                  >
                    {isCreating ? <><SpinnerIcon /> Creating...</> : <><PlusIcon /> Create Listing</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to create listing
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Decentralized Marketplace &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {Object.entries(STATUS_CONFIG).map(([s, cfg], i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={cn("h-1 w-1 rounded-full", cfg.dot)} />
                  <span className="font-mono text-[9px] text-white/15">{cfg.label}</span>
                  {i < 3 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
