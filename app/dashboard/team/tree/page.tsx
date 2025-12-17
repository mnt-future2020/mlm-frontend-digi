"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

import { Users, ZoomIn, ZoomOut, Maximize, Network, ChevronDown, CheckCircle, XCircle, DollarSign, Activity, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


// Update TreeNode type to match backend
type TreeNode = {
  id: string;
  _id?: string;
  referralId?: string;
  name: string;
  package?: string;
  packageAmount?: number;
  position: "left" | "right" | "root";
  isActive?: boolean;
  leftPV?: number;
  rightPV?: number;
  totalPV?: number;
  rank?: string;
  joinDate?: string;
  dailyPVUsed?: number;
  dailyCapping?: number;
  walletBalance?: number;
  totalEarnings?: number;
  directReferrals?: number;
  children?: TreeNode[];
  hasChildren?: boolean;
  isExpanded?: boolean;
  isLoading?: boolean;
};

// User Details Modal Component
function UserDetailsModal({
  node,
  isOpen,
  onClose,
}: {
  node: TreeNode | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!node) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center border-2",
              node.isActive ? "bg-green-100 border-green-200 text-green-600" : "bg-red-100 border-red-200 text-red-600"
            )}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">{node.name}</DialogTitle>
              <DialogDescription className="font-mono text-xs mt-1">
                ID: {node.referralId || node.id || node._id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Status & Rank */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/40 rounded-lg border">
              <span className="text-xs text-muted-foreground block mb-1">Status</span>
              <div className="flex items-center gap-2">
                {node.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={cn(
                  "font-bold text-sm",
                  node.isActive ? "text-green-600" : "text-red-600"
                )}>
                  {node.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="p-3 bg-muted/40 rounded-lg border">
              <span className="text-xs text-muted-foreground block mb-1">Rank</span>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-sm text-foreground">
                  {node.rank || "Member"}
                </span>
              </div>
            </div>
          </div>

          {/* Wallet & Referral Info (NEW) */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Wallet Bal</p>
                  <p className="text-lg font-bold text-blue-900 mt-1">₹{node.walletBalance?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">Total Earn</p>
                  <p className="text-lg font-bold text-indigo-900 mt-1">₹{node.totalEarnings?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">Direct Refs</p>
                  <p className="text-lg font-bold text-teal-900 mt-1">{node.directReferrals || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PV Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Matching Stats (Calculated at EOD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center p-2 bg-blue-50 rounded-md border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-blue-500">Carry Fwd (L)</span>
                  <span className="text-lg font-black text-blue-700">{node.leftPV || 0}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-purple-50 rounded-md border border-purple-100">
                  <span className="text-[10px] uppercase font-bold text-purple-500">Carry Fwd (R)</span>
                  <span className="text-lg font-black text-purple-700">{node.rightPV || 0}</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-slate-50 rounded-md border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Matched</span>
                  <span className="text-lg font-black text-slate-700">{node.totalPV || 0}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-muted-foreground">Daily Capping Usage</span>
                  <span className="text-xs font-bold text-foreground">
                    {node.dailyPVUsed || 0} / {node.dailyCapping || 0} PV
                  </span>
                </div>
                {/* Simple Progress Bar */}
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${Math.min(((node.dailyPVUsed || 0) / (node.dailyCapping || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 text-right">
                  Reset daily at midnight IST
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Plan Info */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Current Package</p>
                <p className="text-xs text-muted-foreground">
                  {node.joinDate ? `Joined: ${new Date(node.joinDate).toLocaleDateString()}` : "Join date unknown"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{node.package || "No Plan"}</p>
              <p className="text-xs text-muted-foreground">₹{node.packageAmount || 0}</p>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BinaryTreePage() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Modal State
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch tree data from API
  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true);
        // Use the generic /api/team/tree endpoint which works for both User and Admin (if token is user)
        const response = await axiosInstance.get('/api/team/tree');
        if (response.data.success) {
          setTreeData(response.data.data);
        }
      } catch (error: any) {
        console.error('Failed to fetch tree data:', error);
        toast.error('Failed to load binary tree', {
          description: error.response?.data?.message || 'Please try again',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, []);

  // Handle Node Click
  const handleNodeClick = async (node: TreeNode) => {
    // 1. Open Details Modal (Always open on click)
    setSelectedNode(node);
    setIsModalOpen(true);

    // 2. Expand/Collapse Logic (Only if has children)
    if (!node.hasChildren) return;

    const nodeKey = node._id || node.id;

    // Only fetch/toggle if NOT handled by modal close or specific expand button
    // Actually, let's decouple expand from view details.
    // Clicking the "Expand" button handles expansion.
    // Clicking the CARD handles details.
  };

  // Separate handler for expansion
  const handleToggleExpand = async (e: React.MouseEvent, node: TreeNode) => {
    e.stopPropagation(); // prevent opening modal

    if (!node.hasChildren) return;

    const nodeKey = node._id || node.id;

    // If already expanded, just collapse
    if (expandedNodes.has(nodeKey)) {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(nodeKey);
        return newSet;
      });
      return;
    }

    // If has children already loaded, just expand
    if (node.children && node.children.length > 0) {
      setExpandedNodes(prev => new Set(prev).add(nodeKey));
      return;
    }

    // Fetch children from API
    try {
      const response = await axiosInstance.get(`/api/team/node/${nodeKey}/children`);

      if (response.data.success) {
        const { left, right } = response.data.data;

        const updateNodeChildren = (n: TreeNode): TreeNode => {
          if ((n._id || n.id) === nodeKey) {
            return {
              ...n,
              children: [left, right].filter(Boolean),
            };
          }
          if (n.children) {
            return {
              ...n,
              children: n.children.map(updateNodeChildren),
            };
          }
          return n;
        };

        if (treeData) {
          setTreeData(updateNodeChildren(treeData));
          setExpandedNodes(prev => new Set(prev).add(nodeKey));
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch node children:', error);
      toast.error('Failed to load children');
    }
  };

  function TreeNodeComponent({
    node,
    onNodeClick,
    onToggleExpand,
    expandedNodes
  }: {
    node: TreeNode;
    onNodeClick: (node: TreeNode) => void;
    onToggleExpand: (e: React.MouseEvent, node: TreeNode) => void;
    expandedNodes: Set<string>;
  }) {
    const isRoot = node.position === "root";
    const isLeft = node.position === "left";
    const hasChildren = node.hasChildren || (node.children && node.children.length > 0);
    const nodeKey = node._id || node.id;
    const isExpanded = expandedNodes.has(nodeKey);

    return (
      <div className="flex flex-col items-center">
        {/* Node Card */}
        <div
          onClick={() => onNodeClick(node)}
          className={cn(
            "relative px-6 py-4 rounded-xl border-2 min-w-[160px] transition-all hover:scale-105 hover:shadow-lg bg-card z-10 cursor-pointer group",
            isRoot
              ? "border-primary-500 shadow-primary-100"
              : isLeft
                ? "border-blue-400 shadow-blue-100"
                : "border-purple-400 shadow-purple-100",
            // Inactive style override
            !node.isActive && "border-slate-300 opacity-90"
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm border-2",
                node.isActive
                  ? (isRoot ? "bg-primary-100 border-primary-200 text-primary-600" : isLeft ? "bg-blue-100 border-blue-200 text-blue-600" : "bg-purple-100 border-purple-200 text-purple-600")
                  : "bg-slate-100 border-slate-200 text-slate-500"
              )}
            >
              <Users className="w-6 h-6" />
            </div>

            <p className="text-sm font-bold text-foreground truncate max-w-[120px]">{node.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
              {node.referralId || node.id || "Unknown"}
            </p>

            <div className="flex flex-col items-center gap-1 mt-1">
              {/* Status Badge */}
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                node.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {node.isActive ? "Active" : "Inactive"}
              </span>

              {/* Plan Badge */}
              {node.package && (
                <span className="text-[9px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100 truncate max-w-[120px]">
                  {node.package}
                </span>
              )}
            </div>

            {/* Expand Indicator Button */}
            {hasChildren && (
              <button
                onClick={(e) => onToggleExpand(e, node)}
                className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 px-2 py-1 rounded transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
                <span>{isExpanded ? 'Collapse Team' : 'View Team'}</span>
              </button>
            )}
          </div>

          {/* Position Badge */}
          {!isRoot && (
            <div className={cn(
              "absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full border bg-white shadow-sm uppercase tracking-widest",
              isLeft
                ? "text-blue-600 border-blue-200"
                : "text-purple-600 border-purple-200"
            )}>
              {node.position}
            </div>
          )}
        </div>

        {/* Children */}
        {isExpanded && node.children && node.children.length > 0 && (
          <>
            {/* Connector Line */}
            <div className="w-0.5 h-8 bg-border my-2"></div>

            {/* Horizontal Line */}
            <div className="relative w-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-border"></div>
              <div className="flex justify-around gap-8 pt-2">
                {node.children.map((child) => (
                  <div key={child.id} className="relative">
                    {/* Vertical connector */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border"></div>
                    <div className="pt-8">
                      <TreeNodeComponent
                        node={child}
                        onNodeClick={onNodeClick}
                        onToggleExpand={onToggleExpand}
                        expandedNodes={expandedNodes}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <PageContainer maxWidth="full">
      <PageHeader
        icon={<Network className="w-6 h-6 text-white" />}
        title="Binary Tree View"
        subtitle="Visualize network structure & performance"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 border-border hover:bg-muted">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 border-border hover:bg-muted">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 border-border hover:bg-muted">
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      {/* Tree Container */}
      <div className="bg-muted/30 border border-border rounded-2xl p-8 sm:p-12 overflow-x-auto min-h-[600px] flex flex-col items-center justify-center relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {loading ? (
          <div className="text-center z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading binary tree...</p>
          </div>
        ) : treeData ? (
          <div className="flex justify-center min-w-max z-10 pb-20">
            <TreeNodeComponent
              node={treeData}
              onNodeClick={handleNodeClick}
              onToggleExpand={handleToggleExpand}
              expandedNodes={expandedNodes}
            />
          </div>
        ) : (
          <div className="text-center z-10">
            <Network className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Team Data</h3>
            <p className="text-muted-foreground">Start building your team to see the binary tree</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-card border border-border rounded-xl p-4 shadow-sm inline-flex flex-wrap gap-6 items-center">
        <span className="text-sm font-semibold text-foreground mr-2">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-100 border border-primary-200"></div>
          <span className="text-sm text-muted-foreground">You (Root)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
          <span className="text-sm text-muted-foreground">Left Team</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-200"></div>
          <span className="text-sm text-muted-foreground">Right Team</span>
        </div>
      </div>

      {/* Details Modal */}
      <UserDetailsModal
        node={selectedNode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </PageContainer>
  );
}
