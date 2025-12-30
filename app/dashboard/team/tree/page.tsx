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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
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
  wallet: {
    balance: number;
    totalEarnings: number;
    totalWithdrawals: number;
  };
  pv: {
    leftPV: number;
    rightPV: number;
    totalPV: number;
    planPV: number;
    dailyPVUsed: number;
  };
  team: {
    total: number;
    left: number;
    right: number;
  };
  joinedAt: string;
  lastActive: string;
  incomeBreakdown?: {
    REFERRAL_INCOME: number;
    MATCHING_INCOME: number;
    LEVEL_INCOME: number;
  };
};

// Plan color mapping
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
}: {
  node: TreeNode;
  isRoot?: boolean;
  onNodeClick: (nodeId: string) => void;
}) {
  const planColors = getPlanColors(node.currentPlan);
  const avatarColor = node.isActive ? "bg-green-500" : "bg-red-500";
  const isLeft = node.placement === "LEFT";
  const isRight = node.placement === "RIGHT";

  return (
    <div className="flex flex-col items-center">
      {/* L/R Side Indicator */}
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

      {/* Node Card - Responsive sizing */}
      <div
        onClick={() => onNodeClick(node.referralId)}
        className={cn(
          "relative px-3 py-2 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl border-2 min-w-[100px] sm:min-w-[160px] transition-all hover:scale-105 hover:shadow-lg bg-card z-10 cursor-pointer",
          isRoot ? "border-primary-500 shadow-primary-100" : planColors.border,
          !isRoot && planColors.shadow
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
          <p className="text-xs sm:text-sm font-bold text-foreground text-center line-clamp-1">
            {node.name}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {node.referralId}
          </p>
          {node.currentPlan && (
            <div className={cn(
              "mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border",
              node.currentPlan === "Basic" && "bg-slate-50 border-slate-300 text-slate-700",
              node.currentPlan === "Medium" && "bg-blue-50 border-blue-300 text-blue-700",
              node.currentPlan === "Large" && "bg-purple-50 border-purple-300 text-purple-700",
              node.currentPlan === "Premium" && "bg-amber-50 border-amber-300 text-amber-700"
            )}>
              <p className="text-[10px] sm:text-xs font-medium">
                {node.currentPlan}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {(node.left || node.right) && (
        <>
          {/* Vertical Line Down */}
          <div className="w-0.5 h-4 sm:h-8 bg-border my-1 sm:my-2"></div>

          {/* Horizontal Line */}
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
                    <div className="px-3 py-2 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl border-2 border-dashed border-border bg-muted/30 min-w-[100px] sm:min-w-[160px] flex items-center justify-center">
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
                    <div className="px-3 py-2 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl border-2 border-dashed border-border bg-muted/30 min-w-[100px] sm:min-w-[160px] flex items-center justify-center">
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
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/user/details/${userId}`);
      if (response.data.success) {
        setUserDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10"
            onClick={onClose}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-6 sm:p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : userDetails ? (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <div className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">
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
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <p className="text-xs sm:text-sm font-medium text-primary-600">
                      {userDetails.referralId}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(userDetails.referralId);
                        toast.success("Referral ID copied!");
                      }}
                      className="p-0.5 sm:p-1 hover:bg-muted rounded transition-colors"
                      title="Copy Referral ID"
                    >
                      <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground hover:text-primary-600" />
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
            <div className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">
                Contact Information
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-foreground truncate">
                    {userDetails.email}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                  <p className="text-xs sm:text-sm text-foreground">
                    {userDetails.mobile}
                  </p>
                </div>
              </div>
            </div>

            {/* Sponsor Info */}
            {userDetails.sponsor && (
              <div className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">
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
                      <p className="text-xs sm:text-sm font-medium text-foreground">
                        -
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Plan Info */}
            {userDetails.currentPlan && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-primary-900 mb-2 sm:mb-3">
                  Current Plan
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs text-primary-700">
                      Plan Name
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
                      PV Value
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-primary-900">
                      {userDetails.currentPlan.pv} PV
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-primary-700">
                      Daily Capping
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-primary-900">
                      ₹{userDetails.currentPlan.dailyCapping}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-green-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Wallet Details
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
              <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-amber-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Income Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {/* <div>
                    <p className="text-[10px] sm:text-xs text-amber-700">
                      Referral
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-amber-900">
                      ₹{userDetails.incomeBreakdown.REFERRAL_INCOME || 0}
                    </p>
                  </div> */}
                  <div>
                    <p className="text-[10px] sm:text-xs text-amber-700">
                      Matching
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-amber-900">
                      ₹{userDetails.incomeBreakdown.MATCHING_INCOME || 0}
                    </p>
                  </div>
                  {/* <div>
                    <p className="text-[10px] sm:text-xs text-amber-700">
                      Level
                    </p>
                    <p className="text-sm sm:text-lg font-bold text-amber-900">
                      ₹{userDetails.incomeBreakdown.LEVEL_INCOME || 0}
                    </p>
                  </div> */}
                </div>
              </div>
            )}

            {/* PV Stats */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                PV Statistics
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
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

            {/* Dates */}
            <div className="bg-muted/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Activity
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Joined
                  </p>
                  <p className="text-[10px] sm:text-sm font-medium text-foreground">
                    {new Date(userDetails.joinedAt).toLocaleDateString(
                      "en-IN",
                      {
                        timeZone: "Asia/Kolkata",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Last Active
                  </p>
                  <p className="text-[10px] sm:text-sm font-medium text-foreground">
                    {new Date(userDetails.lastActive).toLocaleDateString(
                      "en-IN",
                      {
                        timeZone: "Asia/Kolkata",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 text-center text-sm text-muted-foreground">
            Failed to load user details
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserBinaryTreePage() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard event handlers for spacebar pan mode
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

  // Wheel event handler for zoom and scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const treeContainer = document.getElementById("tree-container");
      if (!treeContainer?.contains(e.target as Node)) return;

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom((prev) => Math.max(0.3, Math.min(3, prev + zoomDelta)));
      } else {
        e.preventDefault();
        const scrollDelta = e.deltaY * 0.5;
        setPan((prev) => ({
          x: prev.x,
          y: prev.y - scrollDelta,
        }));
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchTree = async () => {
      try {
        const response = await axiosInstance.get("/api/user/team/tree");
        if (response.data.success) {
          setTreeData(response.data.data);
        }
      } catch (error: any) {
        console.error("Error fetching tree:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, [mounted]);

  const handleNodeClick = (nodeId: string) => {
    if (!isPanning && !isSpacePressed) {
      setSelectedUserId(nodeId);
    }
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.3));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed) {
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setDragOffset(pan);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && isSpacePressed) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setPan({
        x: dragOffset.x + deltaX,
        y: dragOffset.y + deltaY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isSpacePressed) {
      e.preventDefault();
    }
  };

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
          subtitle="Visualize your network structure"
        />
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
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
        subtitle="Tap on any user to view details"
        action={
          <div className="flex gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 border-border hover:bg-muted"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 border-border hover:bg-muted"
              onClick={handleZoomOut}
              disabled={zoom <= 0.3}
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 border-border hover:bg-muted"
              onClick={handleResetView}
              title="Reset View"
            >
              <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        }
      />

      {/* Tree Container */}
      <div
        id="tree-container"
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
        onTouchStart={(e) => {
          if (e.touches.length === 1) {
            setIsPanning(true);
            setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
            setDragOffset(pan);
          }
        }}
        onTouchMove={(e) => {
          if (isPanning && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - dragStart.x;
            const deltaY = e.touches[0].clientY - dragStart.y;
            setPan({
              x: dragOffset.x + deltaX,
              y: dragOffset.y + deltaY,
            });
          }
        }}
        onTouchEnd={() => setIsPanning(false)}
      >
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
          }}
        />

        {/* Zoom Level Indicator */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-card border border-border rounded-md sm:rounded-lg px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-foreground z-20">
          {Math.round(zoom * 100)}%
        </div>

        {/* Pan Mode Indicator */}
        {isSpacePressed && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-primary-500 text-white rounded-md sm:rounded-lg px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium z-20 flex items-center gap-1 sm:gap-2">
            <span>🖐️</span>
            <span className="hidden sm:inline">
              Pan Mode - Hold Space & Drag
            </span>
            <span className="sm:hidden">Pan</span>
          </div>
        )}

        <div
          className="flex justify-center min-w-max z-10 transition-transform duration-150 ease-out"
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

      {/* Legend & Controls */}
      <div className="mt-4 sm:mt-6 bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Status Legend */}
          <div className="flex flex-wrap gap-3 sm:gap-6 items-center">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Status:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">Inactive</span>
            </div>
          </div>
          
          {/* Side Legend */}
          <div className="flex flex-wrap gap-3 sm:gap-6 items-center">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Side:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white">
                L
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">Left</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-500 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white">
                R
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">Right</span>
            </div>
          </div>

          {/* Plan Legend */}
          <div className="flex flex-wrap gap-3 sm:gap-6 items-center">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Plans:
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-slate-400"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">Basic</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-500"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-purple-500"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">Large</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-amber-500"></div>
              <span className="text-xs sm:text-sm text-muted-foreground">Premium</span>
            </div>
          </div>

          {/* Controls hint - desktop only */}
          <div className="hidden sm:flex flex-wrap gap-4 text-xs text-muted-foreground border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <span>💡</span>
              <span>Click nodes for details</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⌨️</span>
              <span>Hold SPACE + drag to pan</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔍</span>
              <span>Ctrl+scroll to zoom</span>
            </div>
          </div>

          {/* Mobile hint */}
          <p className="sm:hidden text-[10px] text-muted-foreground text-center border-t border-border pt-2">
            💡 Tap nodes for details • Pinch to zoom • Drag to pan
          </p>
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </PageContainer>
  );
}
