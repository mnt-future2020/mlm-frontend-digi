"use client";

import { useState, useEffect } from "react";
import { CreditCard, Check, Loader2, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer, PageHeader } from "@/components/ui/page-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  amount: number;
  pv: number;
  referralIncome: number;
  dailyCapping: number;
}

export default function TopUpPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans
        const plansResponse = await axiosInstance.get('/api/plans');
        if (plansResponse.data.success) {
          setPlans(plansResponse.data.data || []);
        }

        // Fetch fresh user data from dashboard API (not from JWT token)
        const dashboardResponse = await axiosInstance.get('/api/user/dashboard');
        if (dashboardResponse.data.success) {
          const dashboardData = dashboardResponse.data.data;
          // Set current plan from fresh database data
          if (dashboardData.currentPlan) {
            setCurrentPlan(dashboardData.currentPlan.name);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post('/api/topup/request', {
        planId: selectedPlan,
        paymentMethod: "Direct Request",
        transactionDetails: "User requested upgrade via simplified flow"
      });

      if (response.data.success) {
        toast.success("Plan upgrade request sent successfully! Waiting for admin approval.");
        setSelectedPlan("");
      }
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error(error.response?.data?.detail || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedPlan("");
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
        icon={<Zap className="w-6 h-6 text-white" />}
        title="Upgrade Plan"
        subtitle="Select a plan to upgrade your account"
      />

      {/* Current Plan Display */}
      {currentPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Current Active Plan</h3>
            <p className="text-2xl font-bold text-blue-700">{currentPlan}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Check className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select New Plan</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {plans.map((plan, index) => {
          const isCurrentPlan = currentPlan === plan.name;

          return (
            <button
              key={plan.id}
              onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
              disabled={isCurrentPlan}
              className={cn(
                "relative p-6 rounded-xl border-2 transition-all text-left group hover:shadow-lg flex flex-col justify-between h-full",
                isCurrentPlan
                  ? "border-green-500 bg-green-50 cursor-not-allowed opacity-70"
                  : selectedPlan === plan.id
                    ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                    : "border-border bg-card hover:border-primary-200"
              )}
            >
              <div>
                {isCurrentPlan && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm z-10">
                    Current
                  </span>
                )}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary-600 transition-colors">
                    {plan.name}
                  </h3>
                  {selectedPlan === plan.id && !isCurrentPlan && <div className="bg-primary-500 rounded-full p-1"><Check className="w-4 h-4 text-white" /></div>}
                </div>

                <p className="text-4xl font-extrabold text-primary-600 mb-4">₹{plan.amount?.toLocaleString()}</p>

                <div className="space-y-2 text-sm text-gray-600 bg-white/50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between">
                    <span>PV Points:</span>
                    <span className="font-semibold text-gray-900">{plan.pv}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ref Income:</span>
                    <span className="font-semibold text-gray-900">₹{plan.referralIncome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Cap:</span>
                    <span className="font-semibold text-gray-900">₹{plan.dailyCapping}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirmation Area */}
      {selectedPlan && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">Selected Plan upgrade to</p>
              <p className="text-xl font-bold text-primary-600">{plans.find(p => p.id === selectedPlan)?.name}</p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={submitting}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={submitting}
                className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 text-white shadow-lg min-w-[200px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Confirm Upgrade
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed bottom bar */}
      {selectedPlan && <div className="h-24"></div>}

    </PageContainer>
  );
}
