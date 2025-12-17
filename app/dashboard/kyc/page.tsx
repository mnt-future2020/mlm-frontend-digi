"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { axiosInstance } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, CheckCircle2, XCircle, Clock, AlertCircle, FileImage, User, Camera, CreditCard, FileText } from "lucide-react";

interface KYCData {
  kycStatus: string;
  isActive: boolean;
  submission: {
    id: string;
    form: any;
    status: string;
    remarks?: string;
    createdAt: string;
  } | null;
}

export default function KYCPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycData, setKycData] = useState<KYCData | null>(null);

  // File refs
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const panCardInputRef = useRef<HTMLInputElement>(null);
  const aadharCardInputRef = useRef<HTMLInputElement>(null);
  const bankPassbookInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    nomineeName: "",
    bank: {
      accountName: "",
      accountNumber: "",
      ifsc: "",
      bankName: ""
    },
    profilePhotoBase64: "",
    panCardBase64: "",
    aadharCardBase64: "",
    bankPassbookBase64: ""
  });

  // Previews
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [panCardPreview, setPanCardPreview] = useState<string | null>(null);
  const [aadharCardPreview, setAadharCardPreview] = useState<string | null>(null);
  const [bankPassbookPreview, setBankPassbookPreview] = useState<string | null>(null);

  // Errors
  const [profilePhotoError, setProfilePhotoError] = useState<string | null>(null);
  const [panCardError, setPanCardError] = useState<string | null>(null);
  const [aadharCardError, setAadharCardError] = useState<string | null>(null);
  const [bankPassbookError, setBankPassbookError] = useState<string | null>(null);

  // Sizes for display
  const [profilePhotoSize, setProfilePhotoSize] = useState<number>(0);
  const [panCardSize, setPanCardSize] = useState<number>(0);
  const [aadharCardSize, setAadharCardSize] = useState<number>(0);
  const [bankPassbookSize, setBankPassbookSize] = useState<number>(0);

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.mobile || ""
      }));
    }
  }, [user]);

  const fetchKYCStatus = async () => {
    try {
      const response = await axiosInstance.get("/api/kyc/me");
      if (response.data?.success) {
        setKycData(response.data.data);

        // Pre-fill form if there's a previous submission
        if (response.data.data?.submission?.form) {
          const form = response.data.data.submission.form;
          setFormData(prev => ({
            ...prev,
            name: form.name || "",
            email: form.email || "",
            phone: form.phone || "",
            address: form.address || "",
            dob: form.dob || "",
            nomineeName: form.nomineeName || "",
            bank: form.bank || { accountName: "", accountNumber: "", ifsc: "", bankName: "" },
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profilePhoto' | 'panCard' | 'aadharCard' | 'bankPassbook'
  ) => {
    const file = e.target.files?.[0];
    let setError, setPreview, setSize, fieldName;

    switch (type) {
      case 'profilePhoto':
        setError = setProfilePhotoError;
        setPreview = setProfilePhotoPreview;
        setSize = setProfilePhotoSize;
        fieldName = 'profilePhotoBase64';
        break;
      case 'panCard':
        setError = setPanCardError;
        setPreview = setPanCardPreview;
        setSize = setPanCardSize;
        fieldName = 'panCardBase64';
        break;
      case 'aadharCard':
        setError = setAadharCardError;
        setPreview = setAadharCardPreview;
        setSize = setAadharCardSize;
        fieldName = 'aadharCardBase64';
        break;
      case 'bankPassbook':
        setError = setBankPassbookError;
        setPreview = setBankPassbookPreview;
        setSize = setBankPassbookSize;
        fieldName = 'bankPassbookBase64';
        break;
    }

    if (setError) setError(null);

    if (!file) return;

    // Validate file type
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      if (setError) setError("Only JPEG images are allowed");
      return;
    }

    // Validate file size (500KB = 512000 bytes)
    const sizeKB = file.size / 1024;
    if (setSize) setSize(sizeKB);

    if (sizeKB > 500) {
      if (setError) setError(`File size must be under 500KB. Current size: ${sizeKB.toFixed(1)}KB`);
      return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (setPreview) setPreview(base64);
      setFormData(prev => ({ ...prev, [fieldName]: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.panCardBase64 || !formData.aadharCardBase64 || !formData.bankPassbookBase64) {
      toast.error("Please upload all required documents (PAN, Aadhar, Bank Passbook)");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post("/api/kyc/submit", formData);
      if (response.data?.success) {
        toast.success(response.data.message || "KYC submitted successfully!");
        await fetchKYCStatus();
        await refreshUser();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to submit KYC");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_KYC":
        return (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>KYC Pending - Please complete your KYC details</span>
          </div>
        );
      case "KYC_SUBMITTED":
        return (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5" />
            <span>KYC Submitted - Waiting for admin approval</span>
          </div>
        );
      case "KYC_REJECTED":
        return (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            <XCircle className="w-5 h-5" />
            <span>KYC Rejected - Please resubmit</span>
          </div>
        );
      case "ACTIVE":
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span>KYC Approved - Account Active</span>
          </div>
        );
      default:
        return null;
    }
  };

  const UploadBox = ({ label, inputRef, preview, error, size, onChange, icon: Icon }: any) => (
    <div className="space-y-2">
      <Label>{label} *</Label>
      <div className="mt-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg"
          onChange={onChange}
          className="hidden"
        />
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors relative h-48 flex flex-col items-center justify-center
              ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
        >
          {preview ? (
            <div className="space-y-2 w-full h-full flex flex-col items-center justify-center">
              <img src={preview} alt="Preview" className="max-h-32 object-contain rounded" />
              <div className="text-xs text-center w-full">
                <p className="text-gray-600">{size.toFixed(1)}KB</p>
                <p className="text-blue-600">Click to change</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Icon className="w-10 h-10 mx-auto text-gray-400" />
              <p className="text-sm font-medium text-gray-700">Upload {label}</p>
              <p className="text-xs text-gray-500">JPEG, Max 500KB</p>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If KYC is approved, show success state
  if (kycData?.kycStatus === "ACTIVE") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              KYC Verified
            </CardTitle>
            <CardDescription>Your KYC has been approved and your account is now active.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">You now have full access to all features of the platform.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If KYC is submitted and pending
  if (kycData?.kycStatus === "KYC_SUBMITTED") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Clock className="w-6 h-6" />
              KYC Under Review
            </CardTitle>
            <CardDescription>Your KYC submission is being reviewed by the admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700">Please wait while we verify your documents. This usually takes 24-48 hours.</p>
            </div>
            {kycData.submission && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">Submitted on: {new Date(kycData.submission.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show KYC form for PENDING_KYC or KYC_REJECTED
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your KYC</CardTitle>
          <CardDescription>
            Please fill in your details and upload your documents to activate your account.
          </CardDescription>
          <div className="mt-4">
            {renderStatusBadge(kycData?.kycStatus || "PENDING_KYC")}
          </div>
          {kycData?.kycStatus === "KYC_REJECTED" && kycData.submission?.remarks && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Rejection Reason:</p>
              <p className="text-red-600">{kycData.submission.remarks}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8" data-testid="kyc-form">

            {/* 1. Profile Photo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" /> Profile Photo
              </h3>
              <div className="flex justify-center">
                <div className="relative">
                  <input
                    ref={profilePhotoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg"
                    onChange={(e) => handleFileChange(e, 'profilePhoto')}
                    className="hidden"
                    data-testid="profile-photo-input"
                  />
                  <div
                    onClick={() => profilePhotoInputRef.current?.click()}
                    className={`w-32 h-32 rounded-full border-4 cursor-pointer overflow-hidden transition-all shadow-sm
                      ${profilePhotoError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-400 bg-gray-50'}`}
                  >
                    {profilePhotoPreview ? (
                      <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <User className="w-10 h-10" />
                        <Camera className="w-5 h-5 mt-1" />
                      </div>
                    )}
                  </div>
                  {profilePhotoPreview && (
                    <p className="text-xs text-center mt-2 text-gray-500">{profilePhotoSize.toFixed(1)}KB</p>
                  )}
                </div>
              </div>
              {profilePhotoError && (
                <p className="text-sm text-red-600 text-center">{profilePhotoError}</p>
              )}
              <p className="text-xs text-gray-500 text-center">Click to upload (JPEG, max 500KB)</p>
            </div>

            {/* 2. Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    data-testid="kyc-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    data-testid="kyc-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    data-testid="kyc-phone-input"
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                    required
                    data-testid="kyc-dob-input"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                  rows={3}
                  data-testid="kyc-address-input"
                />
              </div>
              <div>
                <Label htmlFor="nomineeName">Nominee Name *</Label>
                <Input
                  id="nomineeName"
                  value={formData.nomineeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, nomineeName: e.target.value }))}
                  placeholder="Enter nominee name"
                  required
                  data-testid="kyc-nominee-name-input"
                />
              </div>
            </div>

            {/* 3. Document Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" /> Documents Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UploadBox
                  label="PAN Card"
                  inputRef={panCardInputRef}
                  preview={panCardPreview}
                  error={panCardError}
                  size={panCardSize}
                  onChange={(e: any) => handleFileChange(e, 'panCard')}
                  icon={CreditCard}
                />
                <UploadBox
                  label="Aadhar Card"
                  inputRef={aadharCardInputRef}
                  preview={aadharCardPreview}
                  error={aadharCardError}
                  size={aadharCardSize}
                  onChange={(e: any) => handleFileChange(e, 'aadharCard')}
                  icon={CreditCard}
                />
                <UploadBox
                  label="Bank Passbook"
                  inputRef={bankPassbookInputRef}
                  preview={bankPassbookPreview}
                  error={bankPassbookError}
                  size={bankPassbookSize}
                  onChange={(e: any) => handleFileChange(e, 'bankPassbook')}
                  icon={FileText}
                />
              </div>
            </div>

            {/* 4. Bank Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                <i className="lucide-banknote w-5 h-5 text-primary-600" /> Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    value={formData.bank.accountName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bank: { ...prev.bank, accountName: e.target.value }
                    }))}
                    data-testid="kyc-account-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.bank.accountNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bank: { ...prev.bank, accountNumber: e.target.value }
                    }))}
                    data-testid="kyc-account-number-input"
                  />
                </div>
                <div>
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    value={formData.bank.ifsc}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bank: { ...prev.bank, ifsc: e.target.value }
                    }))}
                    data-testid="kyc-ifsc-input"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bank.bankName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      bank: { ...prev.bank, bankName: e.target.value }
                    }))}
                    data-testid="kyc-bank-name-input"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-lg font-semibold"
              disabled={submitting || !!panCardError || !!aadharCardError || !!bankPassbookError}
              data-testid="kyc-submit-btn"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting KYC...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Submit KYC Verification
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
