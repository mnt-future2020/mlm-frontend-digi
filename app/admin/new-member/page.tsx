"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Loader2, CheckCircle, Copy, X, Users, CreditCard, User, Smartphone, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

interface Plan {
  id: string;
  name: string;
  amount: number;
  isActive: boolean;
}

export default function NewMemberPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchingSponsor, setSearchingSponsor] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] = useState({
    sponsorId: user?.referralId || "",
    sponsorName: user?.name || "",
    placement: "LEFT",
    fullName: "",
    username: "",
    gender: "Male",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    planId: "no-plan",
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [newUserData, setNewUserData] = useState<any>(null);

  // Fetch available plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get("/api/plans");
        if (response.data.success) {
          setPlans(response.data.data.filter((p: Plan) => p.isActive));
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
    fetchPlans();
  }, []);

  const handleSearchSponsor = async (sponsorIdToSearch?: string) => {
    const idToSearch = sponsorIdToSearch || formData.sponsorId;

    if (!idToSearch) {
      toast.error("Please enter sponsor ID");
      return;
    }

    setSearchingSponsor(true);
    try {
      const response = await axiosInstance.post("/api/auth/lookup-referral", {
        referralId: idToSearch,
      });

      if (response.data.success) {
        const sponsor = response.data.data;
        setFormData(prev => ({ ...prev, sponsorName: sponsor.name }));
        if (!sponsorIdToSearch) {
          toast.success("Sponsor found!");
        }
      } else {
        const errorMessage = response.data.message || "Sponsor not found";
        toast.error(
          typeof errorMessage === "string" ? errorMessage : "Sponsor not found"
        );
        setFormData(prev => ({ ...prev, sponsorName: "" }));
      }
    } catch (error) {
      toast.error("Error finding sponsor");
      setFormData(prev => ({ ...prev, sponsorName: "" }));
    } finally {
      setSearchingSponsor(false);
    }
  };

  // Auto-lookup sponsor when user leaves the sponsor ID field
  const handleSponsorIdBlur = () => {
    if (formData.sponsorId && formData.sponsorId.length >= 6) {
      handleSearchSponsor(formData.sponsorId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.sponsorId) {
      toast.error("Sponsor ID is required");
      return;
    }
    if (!formData.fullName || !formData.username || !formData.mobile) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const registerData: any = {
        name: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        gender: formData.gender,
        referralId: formData.sponsorId,
        placement: formData.placement,
      };

      // Add plan if selected
      if (formData.planId && formData.planId !== "no-plan") {
        registerData.planId = formData.planId;
      }

      const response = await axiosInstance.post(
        "/api/auth/register",
        registerData
      );

      if (response.data.success) {
        // Store user data and show welcome modal
        setNewUserData({
          name: formData.fullName,
          username: formData.username,
          referralId: response.data.user.referralId,
          password: formData.password,
          planName: formData.planId !== "no-plan" ? plans.find(p => p.id === formData.planId)?.name : null
        });
        setShowWelcomeModal(true);
        handleReset();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Registration failed";
      toast.error(
        typeof errorMessage === "string" ? errorMessage : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      sponsorId: user?.referralId || "",
      sponsorName: user?.name || "",
      placement: "LEFT",
      fullName: "",
      username: "",
      gender: "Male",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      planId: "no-plan",
    });
  };


  const [placementPreview, setPlacementPreview] = useState<any>(null);

  // Preview placement when sponsor or placement changes
  useEffect(() => {
    const fetchPlacementPreview = async () => {
      if (!formData.sponsorId || formData.sponsorId.length < 3) {
        setPlacementPreview(null);
        return;
      }

      try {
        const response = await axiosInstance.post("/api/auth/preview-placement", {
          referralId: formData.sponsorId,
          placement: formData.placement
        });

        if (response.data.success) {
          setPlacementPreview(response.data.data);
        } else {
          setPlacementPreview(null);
        }
      } catch (error) {
        // Silent error, just don't show preview
        console.error("Error fetching placement preview", error);
        setPlacementPreview(null);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPlacementPreview();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [formData.sponsorId, formData.placement]);

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        icon={<UserPlus className="w-6 h-6 text-white" />}
        title="Register New Member"
        subtitle="Add a new member to your team"
      />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. Personal Information */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Personal Details</CardTitle>
                <CardDescription>Enter the new member's personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label required>Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label required>Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label required>Mobile Number</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  className="pl-9"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email ID (Optional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  className="pl-9"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Login Credentials */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Login Credentials</CardTitle>
                <CardDescription>Set up the account access details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label required>Username</Label>
              <Input
                placeholder="Unique username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label required>Password</Label>
              <Input
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label required>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Retype password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Plan Selection */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Plan Selection</CardTitle>
                <CardDescription>Choose a starting package (optional)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:w-1/2">
              <Label>Select Package</Label>
              <Select
                value={formData.planId}
                onValueChange={(value) => setFormData({ ...formData, planId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No plan (can be assigned later)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-plan">No Plan</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.amount}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can assign a plan now or later via Topup.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 4. Sponsor & Placement (MOVED TO BOTTOM) */}
        <Card className="border-border shadow-sm bg-muted/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Sponsor & Placement</CardTitle>
                <CardDescription>Define where this member goes in the structure</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label required>Sponsor ID</Label>
                <div className="relative">
                  <Input
                    placeholder="Enter Sponsor ID"
                    value={formData.sponsorId}
                    onChange={(e) => setFormData({ ...formData, sponsorId: e.target.value })}
                    onBlur={handleSponsorIdBlur}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchSponsor()}
                    disabled={searchingSponsor}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-600 transition-colors"
                  >
                    {searchingSponsor ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">Default is your ID. Change to place under someone else.</p>
              </div>

              <div className="space-y-2">
                <Label>Sponsor Name</Label>
                <Input
                  value={formData.sponsorName}
                  disabled
                  placeholder="Auto-filled"
                  className="bg-muted/50 font-medium text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label required>Placement Side</Label>
                <Select
                  value={formData.placement}
                  onValueChange={(value) => setFormData({ ...formData, placement: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEFT">LEFT</SelectItem>
                    <SelectItem value="RIGHT">RIGHT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Placement Preview */}
            {placementPreview && (
              <div className={`mt-6 p-4 rounded-lg border flex items-start gap-3 ${placementPreview.is_direct_placement
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                }`}>
                <div className={`p-2 rounded-full ${placementPreview.is_direct_placement ? 'bg-green-100' : 'bg-indigo-100'}`}>
                  {placementPreview.is_direct_placement ? (
                    <UserPlus className={`w-5 h-5 ${placementPreview.is_direct_placement ? 'text-green-600' : 'text-indigo-600'}`} />
                  ) : (
                    <Search className={`w-5 h-5 ${placementPreview.is_direct_placement ? 'text-green-600' : 'text-indigo-600'}`} />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    {placementPreview.is_direct_placement ? "Direct Placement Available" : "Auto-Placement Active"}
                  </h4>
                  <p className="text-sm opacity-90">
                    New member will be placed under <span className="font-bold">{placementPreview.actual_sponsor_name}</span> ({placementPreview.actual_sponsor_referral_id}) on the <span className="font-bold">{placementPreview.placement}</span> side.
                  </p>
                  {!placementPreview.is_direct_placement && (
                    <p className="text-xs mt-2 opacity-75">
                      Note: Selected position was occupied. System found the next available spot.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Member...
              </>
            ) : (
              "Register Member"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="px-8 py-6 text-lg border-2 hover:bg-muted"
          >
            Reset Form
          </Button>
        </div>

      </form>

      {/* Welcome Modal */}
      {showWelcomeModal && newUserData && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowWelcomeModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <UserPlus className="w-24 h-24 text-white" />
              </div>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Registration Successful!
                </h2>
                <p className="text-green-50 text-sm">
                  Welcome {newUserData.name} to the team
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="bg-muted/40 rounded-xl p-4 space-y-4 border border-border/50">

                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{newUserData.username}</span>
                    <Copy
                      className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-primary-600"
                      onClick={() => { navigator.clipboard.writeText(newUserData.username); toast.success("Copied!"); }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Referral ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary-600">{newUserData.referralId}</span>
                    <Copy
                      className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-primary-600"
                      onClick={() => { navigator.clipboard.writeText(newUserData.referralId); toast.success("Copied!"); }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-muted px-2 py-1 rounded text-sm">{newUserData.password}</span>
                    <Copy
                      className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-primary-600"
                      onClick={() => { navigator.clipboard.writeText(newUserData.password); toast.success("Copied!"); }}
                    />
                  </div>
                </div>

              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3 items-start">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Please share these credentials securely with the new member immediately. For security, ask them to change their password after first login.
                </p>
              </div>

              <Button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-6 rounded-xl"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}