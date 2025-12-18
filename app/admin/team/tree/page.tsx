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
  Move,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useCallback } from "react";
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

function TreeNodeComponent({
  node,
  isRoot = false,
  onNodeClick,
}: {
  node: TreeNode;
  isRoot?: boolean;
  onNodeClick: (nodeId: string) => void;
}) {
  const isLeft = node.placement === "LEFT";

  return (
    <div className="flex flex-col items-center">
      {/* Node Card - Mobile responsive */}
      <div
        onClick={() => onNodeClick(node.referralId)}
        className={cn(
          "relative px-3 py-2 sm:px-6 sm:py-4 rounded-xl border-2 min-w-[120px] sm:min-w-[160px] transition-all hover:scale-105 hover:shadow-lg bg-card z-10 cursor-pointer",
          isRoot
            ? "border-primary-500 shadow-primary-100"
            : isLeft
            ? "border-blue-400 shadow-blue-100"
            : "border-purple-400 shadow-purple-100"
        )}
      >
        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
          <div
            className={cn(
              "w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-2",
              isRoot
                ? "bg-primary-500"
                : isLeft
                ? "bg-blue-400"
                : "bg-purple-400"
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
            <div className="mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary-50 border border-primary-200">
              <p className="text-[10px] sm:text-xs font-medium text-primary-700 truncate max-w-[80px] sm:max-w-[120px]">
                {node.currentPlan}
              </p>
            </div>
          )}
          {!node.isActive && (
            <div className="mt-0.5 sm:mt-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
              <p className="text-[10px] sm:text-xs font-medium text-red-600">
                Inactive
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {(node.left || node.right) && (
        <>
          <div className="w-0.5 h-4 sm:h-8 bg-border my-1 sm:my-2"></div>
          <div className="relative w-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-border"></div>
            <div className="flex justify-around gap-2 sm:gap-8 pt-1 sm:pt-2">
              {/* Left Child */}
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 sm:h-8 bg-border"></div>
                <div className="pt-4 sm:pt-8">
                  {node.left ? (
                    <TreeNodeComponent
                      node={node.left}
                      onNodeClick={onNodeClick}
                    />
                  ) : (
                    <div className="px-3 py-2 sm:px-6 sm:py-4 rounded-xl border-2 border-dashed border-border bg-muted/30 min-w-[100px] sm:min-w-[160px] flex items-center justify-center">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Empty
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Right Child */}
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-4 sm:h-8 bg-border"></div>
                <div className="pt-4 sm:pt-8">
                  {node.right ? (
                    <TreeNodeComponent
                      node={node.right}
                      onNodeClick={onNodeClick}
                    />
                  ) : (
                    <div className="px-3 py-2 sm:px-6 sm:py-4 rounded-xl border-2 border-dashed border-border bg-muted/30 min-w-[100px] sm:min-w-[160px] flex items-center justify-center">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Empty
                      </p>
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
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-500 flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                User Details
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Complete information
              </p>
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
            {/* Basic Info */}
            <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Name
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    {userDetails.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Username
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    {userDetails.username}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Referral ID
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <p className="text-xs sm:text-sm font-medium text-primary-600">
                      {userDetails.referralId}
                    </p>
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
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Status
                  </p>
                  <span
                    className={cn(
                      "inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium",
                      userDetails.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {userDetails.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">
                Contact
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-foreground truncate">
                    {userDetails.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-foreground">
                    {userDetails.mobile}
                  </p>
                </div>
              </div>
            </div>

            {/* Sponsor Info */}
            {userDetails.sponsor && (
              <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">
                  Sponsor & Placement
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Sponsor
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                      {userDetails.sponsor.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Sponsor ID
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      {userDetails.sponsor.referralId}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Side
                    </p>
                    {userDetails.placement ? (
                      <span
                        className={cn(
                          "inline-block px-1.5 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-medium border",
                          userDetails.placement === "LEFT"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-purple-100 text-purple-800 border-purple-300"
                        )}
                      >
                        {userDetails.placement}
                      </span>
                    ) : (
                      <p className="text-xs sm:text-sm">-</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Plan Info */}
            {userDetails.currentPlan && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-primary-900 mb-3 text-sm sm:text-base">
                  Current Plan
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-primary-700">
                      Plan
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-primary-900">
                      {userDetails.currentPlan.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-primary-700">
                      Amount
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-primary-900">
                      ₹{userDetails.currentPlan.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-primary-700">
                      PV
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-primary-900">
                      {userDetails.currentPlan.pv}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-primary-700">
                      Daily Cap
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-primary-900">
                      ₹{userDetails.currentPlan.dailyCapping}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
                Wallet
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-green-700">
                    Balance
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-green-900">
                    ₹{userDetails.wallet.balance}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-green-700">
                    Earnings
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-green-900">
                    ₹{userDetails.wallet.totalEarnings}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-green-700">
                    Withdrawn
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-green-900">
                    ₹{userDetails.wallet.totalWithdrawals}
                  </p>
                </div>
              </div>
            </div>

            {/* Income Breakdown */}
            {userDetails.incomeBreakdown && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  Income
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-amber-700">
                      Referral
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-amber-900">
                      ₹{userDetails.incomeBreakdown.REFERRAL_INCOME || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-amber-700">
                      Matching
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-amber-900">
                      ₹{userDetails.incomeBreakdown.MATCHING_INCOME || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-amber-700">
                      Level
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-amber-900">
                      ₹{userDetails.incomeBreakdown.LEVEL_INCOME || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PV Stats */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                PV Stats
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-700">
                    Left PV
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">
                    {userDetails.pv.leftPV}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-700">
                    Right PV
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">
                    {userDetails.pv.rightPV}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-700">
                    Total PV
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">
                    {userDetails.pv.totalPV}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-700">
                    Daily Used
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-blue-900">
                    {userDetails.pv.dailyPVUsed || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="bg-muted/30 rounded-xl p-3 sm:p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                Activity
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Joined
                  </p>
                  <p className="text-[10px] sm:text-sm font-medium text-foreground">
                    {new Date(userDetails.joinedAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Last Active
                  </p>
                  <p className="text-[10px] sm:text-sm font-medium text-foreground">
                    {new Date(userDetails.lastActive).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Failed to load user details
          </div>
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

  // Zoom and Pan state
  const [zoom, setZoom] = useState(0.8); // Start smaller on mobile
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Touch state for mobile
  const [isTouchPanning, setIsTouchPanning] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard handlers (desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSpacePressed]);

  // Wheel handler (desktop zoom/scroll)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const treeContainer = document.getElementById("tree-container");
      if (!treeContainer?.contains(e.target as Node)) return;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((prev) =>
          Math.max(0.3, Math.min(3, prev + (e.deltaY > 0 ? -0.1 : 0.1)))
        );
      } else {
        e.preventDefault();
        setPan((prev) => ({ x: prev.x, y: prev.y - e.deltaY * 0.5 }));
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Fetch tree data
  useEffect(() => {
    if (!mounted) return;
    axiosInstance
      .get("/api/user/team/tree")
      .then((res) => {
        if (res.data.success) setTreeData(res.data.data);
      })
      .catch((err) => console.error("Error fetching tree:", err))
      .finally(() => setLoading(false));
  }, [mounted]);

  const handleNodeClick = (nodeId: string) => {
    if (!isPanning && !isSpacePressed && !isTouchPanning)
      setSelectedUserId(nodeId);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.3));
  const handleResetView = () => {
    setZoom(0.8);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan (desktop with space)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset(pan);
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && isSpacePressed) {
      setPan({
        x: dragOffset.x + e.clientX - dragStart.x,
        y: dragOffset.y + e.clientY - dragStart.y,
      });
    }
  };
  const handleMouseUp = () => setIsPanning(false);
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isSpacePressed) e.preventDefault();
  };

  // Touch handlers (mobile)
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        setIsTouchPanning(true);
        setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setDragOffset(pan);
      } else if (e.touches.length === 2) {
        setLastTouchDistance(getTouchDistance(e.touches));
      }
    },
    [pan]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isTouchPanning) {
        const deltaX = e.touches[0].clientX - dragStart.x;
        const deltaY = e.touches[0].clientY - dragStart.y;
        setPan({ x: dragOffset.x + deltaX, y: dragOffset.y + deltaY });
      } else if (e.touches.length === 2 && lastTouchDistance !== null) {
        const newDistance = getTouchDistance(e.touches);
        if (newDistance) {
          const scale = newDistance / lastTouchDistance;
          setZoom((prev) => Math.max(0.3, Math.min(3, prev * scale)));
          setLastTouchDistance(newDistance);
        }
      }
    },
    [isTouchPanning, dragStart, dragOffset, lastTouchDistance]
  );

  const handleTouchEnd = useCallback(() => {
    setIsTouchPanning(false);
    setLastTouchDistance(null);
  }, []);

  if (loading) {
    return (
      <PageContainer maxWidth="full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (!treeData) {
    return (
      <PageContainer maxWidth="full">
        <PageHeader
          icon={<Network className="w-6 h-6 text-white" />}
          title="Binary Tree View"
          subtitle="Visualize network structure"
        />
        <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center">
          <Network className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-base sm:text-lg text-muted-foreground">
            No team data available
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<Network className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
        title="Binary Tree View"
        subtitle="Tap nodes for details • Drag to pan • Pinch to zoom"
        action={
          <div className="flex gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10"
              onClick={handleZoomOut}
              disabled={zoom <= 0.3}
            >
              <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10"
              onClick={handleResetView}
              title="Reset"
            >
              <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        }
      />

      {/* Tree Container */}
      <div
        id="tree-container"
        ref={containerRef}
        className={cn(
          "bg-muted/30 border border-border rounded-xl sm:rounded-2xl overflow-hidden min-h-[400px] sm:min-h-[600px] flex flex-col items-center justify-center relative select-none touch-none",
          isSpacePressed ? "cursor-grab" : "cursor-default",
          isPanning ? "cursor-grabbing" : ""
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
        />

        {/* Zoom Indicator */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-card border border-border rounded-lg px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-foreground z-20">
          {Math.round(zoom * 100)}%
        </div>

        {/* Mobile Pan Hint */}
        <div className="absolute top-2 right-2 sm:hidden bg-card/80 border border-border rounded-lg px-2 py-0.5 text-[10px] font-medium text-muted-foreground z-20 flex items-center gap-1">
          <Move className="w-3 h-3" /> Drag to pan
        </div>

        {/* Desktop Pan Mode Indicator */}
        {isSpacePressed && (
          <div className="absolute top-4 right-4 bg-primary-500 text-white rounded-lg px-3 py-1 text-sm font-medium z-20 hidden sm:flex items-center gap-2">
            <span>🖐️</span>Pan Mode
          </div>
        )}

        <div
          className="flex justify-center min-w-max z-10 transition-transform duration-150 ease-out p-4 sm:p-8"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <TreeNodeComponent
            node={treeData}
            isRoot={true}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-3 sm:gap-6 items-center">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Legend:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary-500"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Root
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-400"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Left
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-purple-400"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                Right
              </span>
            </div>
          </div>
          <div className="hidden sm:flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>💡</span>
              <span>Click for details</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⌨️</span>
              <span>SPACE + drag</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔍</span>
              <span>Ctrl+scroll zoom</span>
            </div>
          </div>
        </div>
      </div>

      <UserDetailsModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </PageContainer>
  );
}
