"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, MapPin, Edit, Copy, Check, Share2, Landmark, Users } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [copiedLeft, setCopiedLeft] = useState(false);
  const [copiedRight, setCopiedRight] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/api/user/profile');
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const copyLink = (placement: 'LEFT' | 'RIGHT') => {
    const link = `${window.location.origin}/register?ref=${profile?.referralId}&place=${placement}`;
    navigator.clipboard.writeText(link);
    if (placement === 'LEFT') {
      setCopiedLeft(true);
      setTimeout(() => setCopiedLeft(false), 2000);
    } else {
      setCopiedRight(true);
      setTimeout(() => setCopiedRight(false), 2000);
    }
  };

  const shareOnWhatsApp = (placement: 'LEFT' | 'RIGHT') => {
    const link = `${window.location.origin}/register?ref=${profile?.referralId}&place=${placement}`;
    const text = `Join my team on VSV Unite! Register here: ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <PageContainer maxWidth="2xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl">
      <PageHeader
        icon={<User className="w-6 h-6 text-white" />}
        title="My Profile"
        subtitle="Manage your profile and referral links"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Stats Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
              <User className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{profile?.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{profile?.email}</p>
            <div className={cn(
              "inline-flex px-3 py-1 rounded-full text-xs font-medium",
              profile?.isActive ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            )}>
              {profile?.isActive ? "Active Member" : "Inactive"}
            </div>
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Introduced By</p>
                <p className="font-semibold text-primary-600">
                  {profile?.sponsorName && profile?.sponsorId
                    ? `${profile.sponsorName} (${profile.sponsorId})`
                    : (profile?.sponsorId || "None")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">My Referral ID</p>
                <p className="font-semibold text-primary-600">{profile?.referralId}</p>
              </div>
            </div>
          </div>

          {/* Referral Links Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg text-white">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5" /> Referral Center
            </h3>

            {/* Left Link */}
            <div className="mb-6">
              <p className="text-sm text-indigo-100 mb-2">Left Team Link</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => copyLink('LEFT')}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  {copiedLeft ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => shareOnWhatsApp('LEFT')}
                  className="bg-green-500 hover:bg-green-600 text-white border-0"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Link */}
            <div>
              <p className="text-sm text-indigo-100 mb-2">Right Team Link</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => copyLink('RIGHT')}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  {copiedRight ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => shareOnWhatsApp('RIGHT')}
                  className="bg-green-500 hover:bg-green-600 text-white border-0"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal & Contact Info */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                <p className="font-medium">{profile?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                <p className="font-medium">{profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mobile</p>
                <p className="font-medium">{profile?.mobile}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="font-medium text-gray-700">{profile?.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nominee Name</p>
                <p className="font-medium">{profile?.nomineeName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary-600" /> Bank Information
            </h3>
            {profile?.bank && profile.bank.accountNumber ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
                  <p className="font-medium">{profile.bank.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Holder</p>
                  <p className="font-medium">{profile.bank.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                  <p className="font-medium font-mono bg-muted/30 px-2 py-1 rounded inline-block">
                    {profile.bank.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">IFSC Code</p>
                  <p className="font-medium font-mono">{profile.bank.ifsc}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Bank details available after KYC approval</p>
              </div>
            )}
          </div>

          {/* Business Summary */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" /> Business Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-blue-600 mb-1">Plan</p>
                <p className="font-bold text-blue-900 text-sm truncate">{profile?.currentPlanName || "None"}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-green-600 mb-1">Total Team</p>
                <p className="font-bold text-green-900">{profile?.teamSize || 0}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-xs text-purple-600 mb-1">Left PV</p>
                <p className="font-bold text-purple-900">{profile?.leftTeamSize || 0}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <p className="text-xs text-orange-600 mb-1">Right PV</p>
                <p className="font-bold text-orange-900">{profile?.rightTeamSize || 0}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}
