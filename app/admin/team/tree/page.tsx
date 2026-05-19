"use client";

import {
  Users,
  ZoomIn,
  ZoomOut,
  Maximize,
  Network,
  X,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Wallet,
  Copy,
  Info,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useCallback, useRef } from "react";
import { axiosInstance } from "@/lib/api";

type TreeNode = {
  id: string;
  name: string;
  referralId: string;
  placement?: string | null;
  currentPlan?: string | null;
  isActive: boolean;
  leftPV?: number;
  rightPV?: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
};

type UserDetails = {
  id: string;
  name: string;
  username: string;
  email: string;
  mobile: string;
  referralId: string;
  sponsorId: string;
  sponsor: { name: string; referralId: string } | null;
  placement?: string;
  isActive: boolean;
  currentPlan: {
    name: string;
    amount: number;
    pv: number;
    dailyCapping: number;
  } | null;
  wallet: { balance: number; totalEarnings: number; totalWithdrawals: number };
  pv: {
    leftPV: number;
    rightPV: number;
    totalPV: number;
    planPV: number;
    dailyPVUsed: number;
  };
  team: { total: number; left: number; right: number };
  joinedAt: string;
  lastActive: string;
  incomeBreakdown?: {
    REFERRAL_INCOME: number;
    MATCHING_INCOME: number;
    LEVEL_INCOME: number;
  };
};

const getPlanColors = (plan: string | null | undefined) => {
  switch (plan) {
    case "Basic":
      return { border: "border-slate-400", bg: "bg-slate-400", shadow: "shadow-slate-100" };
    case "Medium":
      return { border: "border-blue-500", bg: "bg-blue-500", shadow: "shadow-blue-100" };
    case "Large":
      return { border: "border-purple-500", bg: "bg-purple-500", shadow: "shadow-purple-100" };
    case "Premium":
      return { border: "border-amber-500", bg: "bg-amber-500", shadow: "shadow-amber-100" };
    default:
      return { border: "border-gray-300", bg: "bg-gray-400", shadow: "shadow-gray-100" };
  }
};

function TreeNodeComponent({
  node,
  isRoot = false,
  onNodeClick,
  highlightedId,
}: {
  node: TreeNode;
  isRoot?: boolean;
  onNodeClick: (nodeId: string) => void;
  highlightedId?: string | null;
}) {
  const planColors = getPlanColors(node.currentPlan);
  const avatarColor = node.isActive ? "bg-green-500" : "bg-red-500";
  const isLeft = node.placement === "LEFT";
  const isRight = node.placement === "RIGHT";
  const isHighlighted = highlightedId === node.referralId;

  return (
    <div className="flex flex-col items-center">
      {!isRoot && (isLeft || isRight) && (
        <div
          className={cn(
            "mb-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white",
            isLeft ? "bg-blue-500" : "bg-purple-500"
          )}
        >
          {isLeft ? "L" : "R"}
        </div>
      )}

      <div
        data-referral-id={node.referralId}
        onClick={() => onNodeClick(node.referralId)}
        className={cn(
          "relative px-3 py-2 sm:px-6 sm:py-4 rounded-xl border-2 min-w-[120px] sm:min-w-[160px] transition-all hover:scale-105 hover:shadow-lg bg-card z-10 cursor-pointer",
          isRoot ? "border-primary-500 shadow-primary-100" : planColors.border,
          !isRoot && planColors.shadow,
          isHighlighted && "ring-4 ring-primary-400 ring-offset-2 scale-110 shadow-xl"
        )}
      >
        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
          <div
            className={cn(
              "w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2",
              avatarColor
            )}
          >
            <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-foreground text-center truncate max-w-[100px] sm:max-w-[140px]">
            {node.name}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {node.referralId}
          </p>
          {node.currentPlan && (
            <div
              className={cn(
                "mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border",
                node.currentPlan === "Basic" && "bg-slate-50 border-slate-300 text-slate-700",
                node.currentPlan === "Medium" && "bg-blue-50 border-blue-300 text-blue-700",
                node.currentPlan === "Large" && "bg-purple-50 border-purple-300 text-purple-700",
                node.currentPlan === "Premium" && "bg-amber-50 border-amber-300 text-amber-700"
              )}
            >
              <p className="text-[10px] sm:text-xs font-medium truncate max-w-[80px] sm:max-w-[120px]">
                {node.currentPlan}
              </p>
            </div>
          )}
        </div>
      </div>

      {(node.left || node.right) && (
        <>
          <div className="w-0.5 h-4 sm:h-8 bg-border my-1 sm:my-2"></div>
          <div className="relative w-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-border"></div>
            <div className="flex justify-around gap-2 sm:gap-8 pt-1 sm:pt-2">
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 sm:h-8 bg-border"></div>
                <div className="pt-4 sm:pt-8">
                  {node.left ? (
                    <TreeNodeComponent node={node.left} onNodeClick={onNodeClick} highlightedId={highlightedId} />
                  ) : (
                    <div className="px-3 py-2 sm:px-6 sm:py-4 rounded-xl border-2 border-dashed border-border bg-muted/30 min-w-[100px] sm:min-w-[160px] flex items-center justify-center">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Empty</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 sm:h-8 bg-border"></div>
                <div className="pt-4 sm:pt-8">
                  {node.right ? (
                    <TreeNodeComponent node={node.right} onNodeClick={onNodeClick} highlightedId={highlightedId} />
                  ) : (
                    <div className="px-3 py-2 sm:px-6 sm:py-4 rounded-xl border-2 border-dashed border-border bg-muted/30 min-w-[100px] sm:min-w-[160px] flex items-center justify-center">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserDetailsModal({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      axiosInstance
        .get(`/api/user/details/${userId}`)
        .then((res) => {
          if (res.data.success) setUserDetails(res.data.data);
        })
        .catch((err) => console.error("Error fetching user details:", err))
        .finally(() => setLoading(false));
    }
  }, [userId]);

  if (!userId) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-500 flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">User Details</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Complete information</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : userDetails ? (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Basic Information</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Name</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground">{userDetails.name}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Username</p>
                  <p className="text-xs sm:text-sm font-medium text-foreground">{userDetails.username}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Referral ID</p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <p className="text-xs sm:text-sm font-medium text-primary-600">{userDetails.referralId}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(userDetails.referralId);
                        toast.success("Copied!");
                      }}
                      className="p-0.5 sm:p-1 hover:bg-muted rounded"
                    >
                      <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Status</p>
                  <span className={cn("inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium", userDetails.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                    {userDetails.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Contact</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-foreground truncate">{userDetails.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-foreground">{userDetails.mobile}</p>
                </div>
              </div>
            </div>

            {userDetails.sponsor && (
              <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">Sponsor & Placement</h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Sponsor</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">{userDetails.sponsor.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Sponsor ID</p>
                    <p className="text-xs sm:text-sm font-medium text-foreground">{userDetails.sponsor.referralId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Side</p>
                    {userDetails.placement ? (
                      <span className={cn("inline-block px-1.5 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-medium border", userDetails.placement === "LEFT" ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-purple-100 text-purple-800 border-purple-300")}>
                        {userDetails.placement}
                      </span>
                    ) : (
                      <p className="text-xs sm:text-sm">-</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {userDetails.currentPlan && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-primary-900 mb-3 text-sm sm:text-base">Current Plan</h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-primary-700">Plan</p>
                    <p className="text-xs sm:text-sm font-medium text-primary-900">{userDetails.currentPlan.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-primary-700">Amount</p>
                    <p className="text-xs sm:text-sm font-medium text-primary-900">₹{userDetails.currentPlan.amount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-primary-700">PV</p>
                    <p className="text-xs sm:text-sm font-medium text-primary-900">{userDetails.currentPlan.pv}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-primary-700">Daily Cap</p>
                    <p className="text-xs sm:text-sm font-medium text-primary-900">₹{userDetails.currentPlan.dailyCapping}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" /> Wallet
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-green-700">Balance</p>
                  <p className="text-sm sm:text-lg font-bold text-green-900">₹{userDetails.wallet.balance}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-green-700">Earnings</p>
                  <p className="text-sm sm:text-lg font-bold text-green-900">₹{userDetails.wallet.totalEarnings}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-green-700">Withdrawn</p>
                  <p className="text-sm sm:text-lg font-bold text-green-900">₹{userDetails.wallet.totalWithdrawals}</p>
                </div>
              </div>
            </div>

            {userDetails.incomeBreakdown && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> Income
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-amber-700">Matching</p>
                    <p className="text-sm sm:text-lg font-bold text-amber-900">₹{userDetails.incomeBreakdown.MATCHING_INCOME || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-amber-700">Level</p>
                    <p className="text-sm sm:text-lg font-bold text-amber-900">₹{userDetails.incomeBreakdown.LEVEL_INCOME || 0}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> PV Stats
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-700">Left PV</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">{userDetails.pv.leftPV}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-700">Right PV</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">{userDetails.pv.rightPV}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-700">Total PV</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">{userDetails.pv.totalPV}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-700">Daily Used</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">{userDetails.pv.dailyPVUsed || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" /> Activity
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Joined</p>
                  <p className="text-[10px] sm:text-sm font-medium text-foreground">
                    {new Date(userDetails.joinedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Last Active</p>
                  <p className="text-[10px] sm:text-sm font-medium text-foreground">
                    {new Date(userDetails.lastActive).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">Failed to load user details</div>
        )}
      </div>
    </div>
  );
}

export default function AdminBinaryTreePage() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const treeWrapperRef = useRef<HTMLDivElement>(null);

  // Zoom and Pan state
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Touch state for mobile
  const [isTouchPanning, setIsTouchPanning] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSpacePressed) { e.preventDefault(); setIsSpacePressed(true); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setIsSpacePressed(false); setIsPanning(false); }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, [isSpacePressed]);

  // Wheel handler — scroll to pan, Ctrl+scroll to zoom towards cursor
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const container = document.getElementById("tree-container");
      if (!container?.contains(e.target as Node)) return;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const rect = container.getBoundingClientRect();
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setZoom((prev) => {
          const newZoom = Math.max(0.2, Math.min(3, prev + delta));
          const ratio = newZoom / prev;
          setPan((p) => ({
            x: cx - ratio * (cx - p.x),
            y: cy - ratio * (cy - p.y),
          }));
          return newZoom;
        });
      } else {
        setPan((prev) => ({ x: prev.x - e.deltaX * 0.8, y: prev.y - e.deltaY * 0.8 }));
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // Fetch tree data
  useEffect(() => {
    if (!mounted) return;
    axiosInstance
      .get("/api/user/team/tree")
      .then((res) => { if (res.data.success) setTreeData(res.data.data); })
      .catch((err) => console.error("Error fetching tree:", err))
      .finally(() => setLoading(false));
  }, [mounted]);

  const handleNodeClick = (nodeId: string) => {
    if (!isPanning && !isSpacePressed && !isTouchPanning) setSelectedUserId(nodeId);
  };

  // Search: find node by referral ID and pan to center it
  const handleSearch = () => {
    const query = searchId.trim().toUpperCase();
    if (!query) return;
    const container = document.getElementById("tree-container");
    if (!container || !treeWrapperRef.current) return;

    const node = treeWrapperRef.current.querySelector(`[data-referral-id="${query}"]`) as HTMLElement;
    if (!node) {
      toast.error(`Member "${query}" not found in tree`);
      setHighlightedId(null);
      return;
    }

    // Get node's screen position and convert to natural (unscaled) offset from container center
    const containerRect = container.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const nodeCenterX = nodeRect.left + nodeRect.width / 2;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2;
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;

    // Reverse the current transform to get the node's natural offset
    const naturalX = (nodeCenterX - containerCenterX - pan.x) / zoom;
    const naturalY = (nodeCenterY - containerCenterY - pan.y) / zoom;

    // At zoom=1, pan to center the node
    setPan({ x: -naturalX, y: -naturalY });
    setZoom(1);
    setHighlightedId(query);
    setTimeout(() => setHighlightedId(null), 3000);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.2));
  const handleResetView = () => { setZoom(0.8); setPan({ x: 0, y: 0 }); };

  // Mouse pan (space + drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed) { setIsPanning(true); setDragStart({ x: e.clientX, y: e.clientY }); setDragOffset(pan); }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && isSpacePressed) {
      setPan({ x: dragOffset.x + e.clientX - dragStart.x, y: dragOffset.y + e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setIsPanning(false);

  // Touch handlers
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsTouchPanning(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setDragOffset(pan);
    } else if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isTouchPanning) {
      setPan({ x: dragOffset.x + e.touches[0].clientX - dragStart.x, y: dragOffset.y + e.touches[0].clientY - dragStart.y });
    } else if (e.touches.length === 2 && lastTouchDistance !== null) {
      const newDist = getTouchDistance(e.touches);
      if (newDist) {
        const scale = newDist / lastTouchDistance;
        setZoom((prev) => Math.max(0.2, Math.min(3, prev * scale)));
        setLastTouchDistance(newDist);
      }
    }
  }, [isTouchPanning, dragStart, dragOffset, lastTouchDistance]);

  const handleTouchEnd = useCallback(() => {
    setIsTouchPanning(false);
    setLastTouchDistance(null);
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <PageHeader
          icon={<Network className="w-6 h-6 text-white" />}
          title="Binary Tree View"
          subtitle="Visualize network structure"
        />
        <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center">
          <Network className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-base sm:text-lg text-muted-foreground">No team data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 sm:px-6 sm:pt-6 sm:pb-0">
        <PageHeader
          icon={<Network className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
          title="Binary Tree View"
          subtitle="Scroll to pan • Ctrl+scroll to zoom • Click nodes for details"
          action={
            <div className="flex gap-1 sm:gap-2">
              {/* Info toggle */}
              <Button
                variant={showLegend ? "default" : "outline"}
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setShowLegend((v) => !v)}
              >
                <Info className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={handleZoomOut} disabled={zoom <= 0.2}>
                <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={handleResetView} title="Reset">
                <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          }
        />
      </div>

      {/* Search bar */}
      <div className="flex-shrink-0 mx-4 sm:mx-6 mb-2">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex gap-2"
        >
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Referral ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button type="submit" size="sm" className="h-9">
            Find
          </Button>
        </form>
      </div>

      {/* Legend panel - collapsible */}
      {showLegend && (
        <div className="flex-shrink-0 mx-4 sm:mx-6 mb-2 bg-card border border-border rounded-xl p-3 shadow-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-foreground">Status:</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" />Active</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Inactive</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-foreground">Side:</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-blue-500 text-[8px] font-bold text-white flex items-center justify-center">L</span>Left</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full bg-purple-500 text-[8px] font-bold text-white flex items-center justify-center">R</span>Right</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-foreground">Plans:</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />Basic</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />Medium</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />Large</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />Premium</span>
            </div>
          </div>
        </div>
      )}

      {/* Tree Container - fills remaining space, no page scroll */}
      <div
        id="tree-container"
        className={cn(
          "flex-1 min-h-0 mx-4 sm:mx-6 mb-4 sm:mb-6 bg-muted/30 border border-border rounded-xl sm:rounded-2xl overflow-hidden flex flex-col items-center justify-center relative select-none touch-none",
          isSpacePressed ? "cursor-grab" : "cursor-default",
          isPanning ? "cursor-grabbing" : ""
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => { if (isSpacePressed) e.preventDefault(); }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
        />

        {/* Zoom indicator */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-card border border-border rounded-lg px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-foreground z-20">
          {Math.round(zoom * 100)}%
        </div>

        {/* Space pan indicator */}
        {isSpacePressed && (
          <div className="absolute top-4 right-4 bg-primary-500 text-white rounded-lg px-3 py-1 text-sm font-medium z-20 hidden sm:block">
            Pan Mode
          </div>
        )}

        {/* Tree content */}
        <div
          ref={treeWrapperRef}
          className="flex justify-center min-w-max z-10 p-4 sm:p-8"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <TreeNodeComponent node={treeData} isRoot={true} onNodeClick={handleNodeClick} highlightedId={highlightedId} />
        </div>
      </div>

      <UserDetailsModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
}
