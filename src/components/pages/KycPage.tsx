'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore, useLanguageStore } from '@/lib/store';
import { useNav } from '@/lib/use-nav';
import { t } from '@/lib/i18n';
import { BD_DIVISIONS, BD_DISTRICTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  ShieldCheck, User, Upload, Camera, MapPin, ArrowLeft, ArrowRight,
  Loader2, Check, AlertCircle, FileText, ImageIcon, Eye, EyeOff,
  RotateCcw, Lock, ChevronRight, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type Step = 1 | 2;

interface KycData {
  kycName: string;
  kycDob: string;
  kycGender: string;
  nameChanged: boolean;
  dobChanged: boolean;
  genderChanged: boolean;
  documentType: string;
  documentNumber: string;
  documentFront: string;
  documentBack: string;
  houseRoadVillage: string;
  upazilaThana: string;
  district: string;
  division: string;
  postalCode: string;
  selfiePhoto: string;
  selfieRight: string;
  selfieLeft: string;
  selfieSmile: string;
  selfieBlink: string;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  status: string;
  reviewNote: string | null;
}

export default function KycPage() {
  const { navigate } = useNav();
  const { user, token, updateUser } = useAuthStore();
  const { language } = useLanguageStore();
  const isBn = language === 'bn';
  const fontClass = isBn ? 'font-bangla' : '';

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingKyc, setExistingKyc] = useState<KycData | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  // Step 1: Personal Info + Document + Address
  const [kycName, setKycName] = useState('');
  const [kycDob, setKycDob] = useState('');
  const [kycGender, setKycGender] = useState('');
  const [nameLocked, setNameLocked] = useState(false);
  const [dobLocked, setDobLocked] = useState(false);
  const [genderLocked, setGenderLocked] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFront, setDocumentFront] = useState('');
  const [documentBack, setDocumentBack] = useState('');
  const [houseRoadVillage, setHouseRoadVillage] = useState('');
  const [upazilaThana, setUpazilaThana] = useState('');
  const [district, setDistrict] = useState('');
  const [division, setDivision] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Step 2: Selfie + GPS
  const [selfiePhoto, setSelfiePhoto] = useState('');
  const [selfieRight, setSelfieRight] = useState('');
  const [selfieLeft, setSelfieLeft] = useState('');
  const [selfieSmile, setSelfieSmile] = useState('');
  const [selfieBlink, setSelfieBlink] = useState('');
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'pending' | 'granted' | 'denied'>('pending');

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [currentPose, setCurrentPose] = useState<'front' | 'right' | 'left' | 'smile' | 'blink'>('front');
  const [capturing, setCapturing] = useState(false);

  // Upload states
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  // Load existing KYC data
  useEffect(() => {
    if (!token) { navigate('login'); return; }
    fetch('/api/kyc', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.kyc) {
          setExistingKyc(data.kyc);
          setKycStatus(data.kyc.status);
          // Pre-fill form
          setKycName(data.kyc.kycName || '');
          setKycDob(data.kyc.kycDob || '');
          setKycGender(data.kyc.kycGender || '');
          setNameLocked(data.kyc.nameChanged);
          setDobLocked(data.kyc.dobChanged);
          setGenderLocked(data.kyc.genderChanged);
          setDocumentType(data.kyc.documentType || '');
          setDocumentNumber(data.kyc.documentNumber || '');
          setDocumentFront(data.kyc.documentFront || '');
          setDocumentBack(data.kyc.documentBack || '');
          setHouseRoadVillage(data.kyc.houseRoadVillage || '');
          setUpazilaThana(data.kyc.upazilaThana || '');
          setDistrict(data.kyc.district || '');
          setDivision(data.kyc.division || '');
          setPostalCode(data.kyc.postalCode || '');
          setSelfiePhoto(data.kyc.selfiePhoto || '');
          setSelfieRight(data.kyc.selfieRight || '');
          setSelfieLeft(data.kyc.selfieLeft || '');
          setSelfieSmile(data.kyc.selfieSmile || '');
          setSelfieBlink(data.kyc.selfieBlink || '');
          setGpsLatitude(data.kyc.gpsLatitude);
          setGpsLongitude(data.kyc.gpsLongitude);
        } else {
          // Pre-fill from profile
          if (data.profileName) setKycName(data.profileName);
          if (data.profileDob) setKycDob(data.profileDob);
          if (data.profileGender) setKycGender(data.profileGender);
        }
        setKycStatus(data.isKycVerified ? 'approved' : data.kyc?.status || null);
      })
      .catch(() => {});
  }, [token, navigate]);

  // Request GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLatitude(pos.coords.latitude);
          setGpsLongitude(pos.coords.longitude);
          setGpsStatus('granted');
        },
        () => setGpsStatus('denied'),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Get districts for selected division
  const districts = division ? (BD_DISTRICTS[division] || []) : [];

  // File upload handler
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (side === 'front') setUploadingFront(true);
    else setUploadingBack(true);

    try {
      const url = await uploadFile(file);
      if (side === 'front') setDocumentFront(url);
      else setDocumentBack(url);
      toast.success(isBn ? 'আপলোড সফল!' : 'Upload successful!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      if (side === 'front') setUploadingFront(false);
      else setUploadingBack(false);
    }
  };

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch {
      toast.error(isBn ? 'ক্যামেরা অ্যাক্সেস ব্যর্থ' : 'Camera access failed');
    }
  }, [isBn]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(async (): Promise<string> => {
    if (!videoRef.current || !canvasRef.current) return '';
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    // Convert to file and upload
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `selfie-${currentPose}.jpg`, { type: 'image/jpeg' });
    return await uploadFile(file);
  }, [currentPose]);

  const handleCapture = async () => {
    setCapturing(true);
    try {
      const url = await capturePhoto();
      switch (currentPose) {
        case 'front': setSelfiePhoto(url); break;
        case 'right': setSelfieRight(url); break;
        case 'left': setSelfieLeft(url); break;
        case 'smile': setSelfieSmile(url); break;
        case 'blink': setSelfieBlink(url); break;
      }
    } catch (err) {
      toast.error(isBn ? 'ক্যাপচার ব্যর্থ' : 'Capture failed');
    } finally {
      setCapturing(false);
    }
  };

  // Document number label based on type
  const getDocNumberLabel = () => {
    switch (documentType) {
      case 'nid': return t('nidNumber', language);
      case 'driving_licence': return t('drivingLicenceNumber', language);
      case 'passport': return t('passportNumber', language);
      default: return t('documentNumber', language);
    }
  };

  // Validate NID
  const isValidNid = (num: string) => {
    const digits = num.replace(/\D/g, '');
    return [10, 13, 17].includes(digits.length);
  };

  // Step 1 validation
  const isStep1Valid = () => {
    return (
      kycName.trim().length >= 2 &&
      kycDob &&
      kycGender &&
      documentType &&
      documentNumber &&
      documentFront &&
      (documentType === 'passport' || documentBack) &&
      houseRoadVillage &&
      upazilaThana &&
      district &&
      division
    );
  };

  // Step 2 validation
  const isStep2Valid = () => {
    return selfiePhoto && gpsStatus === 'granted';
  };

  // Submit KYC
  const handleSubmit = async () => {
    if (!isStep2Valid()) {
      setError(isBn ? 'সেলফি ক্যাপচার ও জিপিএস প্রয়োজন' : 'Selfie capture and GPS are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          kycName, kycDob, kycGender,
          documentType, documentNumber, documentFront, documentBack,
          houseRoadVillage, upazilaThana, district, division, postalCode,
          selfiePhoto, selfieRight, selfieLeft, selfieSmile, selfieBlink,
          gpsLatitude, gpsLongitude,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'KYC submission failed');

      toast.success(t('kycSubmitSuccess', language));
      setKycStatus('pending');
      setExistingKyc(data.kyc);
      stopCamera();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Show status page if already submitted
  if (kycStatus === 'pending' && existingKyc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-xl border-primary/10">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
            <h2 className={`text-xl font-bold ${fontClass}`}>{t('kycPending', language)}</h2>
            <p className={`text-sm text-muted-foreground ${fontClass}`}>{t('kycPendingMessage', language)}</p>
            {existingKyc.reviewNote && (
              <div className="p-3 rounded-lg bg-muted text-sm">{existingKyc.reviewNote}</div>
            )}
            <Button variant="outline" onClick={() => navigate('home')} className={fontClass}>
              {t('back', language)}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (kycStatus === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md shadow-xl border-emerald-200 dark:border-emerald-900/30">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className={`text-xl font-bold ${fontClass}`}>{t('kycApproved', language)}</h2>
            <p className={`text-sm text-muted-foreground ${fontClass}`}>{t('kycApprovedMessage', language)}</p>
            <div className="grid grid-cols-3 gap-3 py-4">
              {[
                { icon: Check, label: t('verifiedBadge', language) },
                { icon: FileText, label: t('canSellTickets', language) },
                { icon: MapPin, label: t('canWithdraw', language) },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <item.icon className="w-5 h-5 text-emerald-600" />
                  <span className={`text-xs text-emerald-700 dark:text-emerald-400 text-center ${fontClass}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate('home')} className="bg-primary">
              {isBn ? 'হোমে যান' : 'Go Home'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-4 sm:py-6 px-3 sm:px-4 overflow-x-hidden">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4 sm:mb-6">
          <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary flex items-center justify-center mb-2 sm:mb-3 shadow-lg">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
          </div>
          <h1 className={`text-xl sm:text-2xl font-bold ${fontClass}`}>{t('kycVerification', language)}</h1>
          <p className={`text-xs sm:text-sm text-muted-foreground mt-1 ${fontClass}`}>{t('becomeVerifiedSeller', language)}</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
          {[
            { num: 1, label: isBn ? 'নথি ও ঠিকানা' : 'Document & Address', shortLabel: isBn ? 'নথি' : 'Docs', icon: FileText },
            { num: 2, label: isBn ? 'সেলফি ও জিপিএস' : 'Selfie & GPS', shortLabel: isBn ? 'সেলফি' : 'Selfie', icon: Camera },
          ].map((step, idx) => (
            <div key={step.num} className="flex items-center">
              <div className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all ${
                currentStep >= step.num
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground'
              } ${fontClass}`}>
                <step.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel}</span>
              </div>
              {idx < 1 && (
                <div className={`w-4 sm:w-8 h-0.5 mx-0.5 sm:mx-1 rounded transition-all ${
                  currentStep > step.num ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-xl border-primary/10">
          <CardContent className="p-3 sm:p-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Personal Info + Document + Address */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className={`text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${fontClass}`}>
                      <User className="w-4 h-4 text-primary" />
                      {t('kycPersonalInfo', language)}
                    </h3>
                    <div className="space-y-3">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <Label className={`text-sm ${fontClass}`}>
                          {t('fullName', language)} <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Input value={kycName} onChange={(e) => !nameLocked && setKycName(e.target.value)} disabled={nameLocked} className={`h-11 ${nameLocked ? 'opacity-70' : ''}`} />
                          {nameLocked && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                        </div>
                        {nameLocked ? (
                          <p className="text-xs text-amber-600 flex items-center gap-1"><Lock className="w-3 h-3" />{t('kycChangedOnce', language)}</p>
                        ) : (
                          <p className="text-xs text-amber-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{t('kycNameChangeWarning', language)}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* DOB */}
                        <div className="space-y-1.5">
                          <Label className={`text-sm ${fontClass}`}>
                            {t('dateOfBirth', language)} <span className="text-destructive">*</span>
                          </Label>
                          <Input type="date" value={kycDob} onChange={(e) => !dobLocked && setKycDob(e.target.value)} disabled={dobLocked} className={`h-11 ${dobLocked ? 'opacity-70' : ''}`} />
                          {dobLocked && <p className="text-xs text-amber-600 flex items-center gap-1"><Lock className="w-3 h-3" />{t('kycChangedOnce', language)}</p>}
                          {!dobLocked && <p className="text-xs text-amber-600">{t('kycDobChangeWarning', language)}</p>}
                        </div>

                        {/* Gender */}
                        <div className="space-y-1.5">
                          <Label className={`text-sm ${fontClass}`}>
                            {t('gender', language)} <span className="text-destructive">*</span>
                          </Label>
                          <Select value={kycGender} onValueChange={genderLocked ? undefined : setKycGender} disabled={genderLocked}>
                            <SelectTrigger className={`h-11 ${genderLocked ? 'opacity-70' : ''}`}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">{t('male', language)}</SelectItem>
                              <SelectItem value="female">{t('female', language)}</SelectItem>
                              <SelectItem value="other">{t('other', language)}</SelectItem>
                            </SelectContent>
                          </Select>
                          {genderLocked && <p className="text-xs text-amber-600 flex items-center gap-1"><Lock className="w-3 h-3" />{t('kycChangedOnce', language)}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Document Upload */}
                  <div>
                    <h3 className={`text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${fontClass}`}>
                      <FileText className="w-4 h-4 text-primary" />
                      {t('uploadDocument', language)}
                    </h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Document Type */}
                        <div className="space-y-1.5">
                          <Label className={`text-sm ${fontClass}`}>
                            {t('documentType', language)} <span className="text-destructive">*</span>
                          </Label>
                          <Select value={documentType} onValueChange={(v) => { setDocumentType(v); setDocumentNumber(''); }}>
                            <SelectTrigger className="h-11"><SelectValue placeholder={isBn ? 'নির্বাচন' : 'Select'} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nid">{t('nid', language)}</SelectItem>
                              <SelectItem value="driving_licence">{t('drivingLicence', language)}</SelectItem>
                              <SelectItem value="passport">{t('passport', language)}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Document Number */}
                        <div className="space-y-1.5">
                          <Label className={`text-sm ${fontClass}`}>
                            {getDocNumberLabel()} <span className="text-destructive">*</span>
                          </Label>
                          <Input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className="h-11" placeholder={
                            documentType === 'nid' ? '1990123456' :
                            documentType === 'driving_licence' ? 'DL-12345' :
                            documentType === 'passport' ? 'AB1234567' : ''
                          } />
                          {documentType === 'nid' && documentNumber && !isValidNid(documentNumber) && (
                            <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{t('nidDigitsWarning', language)}</p>
                          )}
                        </div>
                      </div>

                      {/* File uploads */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Front */}
                        <div className="space-y-1.5">
                          <Label className={`text-sm ${fontClass}`}>
                            {documentType === 'passport' ? t('uploadFrontOnly', language) : t('uploadFront', language)} <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            {documentFront ? (
                              <div className="relative rounded-lg overflow-hidden border">
                                <img src={documentFront} alt="Front" className="w-full h-28 sm:h-32 object-cover" />
                                <button onClick={() => setDocumentFront('')} className="absolute top-1 right-1 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center touch-manipulation">
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-28 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors min-h-[44px]">
                                {uploadingFront ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
                                <span className={`text-xs text-muted-foreground mt-1 ${fontClass}`}>{t('uploadFront', language)}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'front')} />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Back (not for passport) */}
                        {documentType !== 'passport' && (
                          <div className="space-y-1.5">
                            <Label className={`text-sm ${fontClass}`}>
                              {t('uploadBack', language)} <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                              {documentBack ? (
                                <div className="relative rounded-lg overflow-hidden border">
                                  <img src={documentBack} alt="Back" className="w-full h-28 sm:h-32 object-cover" />
                                  <button onClick={() => setDocumentBack('')} className="absolute top-1 right-1 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center touch-manipulation">
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center h-28 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors min-h-[44px]">
                                  {uploadingBack ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
                                  <span className={`text-xs text-muted-foreground mt-1 ${fontClass}`}>{t('uploadBack', language)}</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'back')} />
                                </label>
                              )}
                            </div>
                          </div>
                        )}

                        {documentType === 'passport' && (
                          <div className="flex items-center justify-center h-28 sm:h-32 rounded-lg border bg-muted/30">
                            <p className={`text-xs text-muted-foreground text-center px-4 ${fontClass}`}>
                              {isBn ? 'পাসপোর্টের শুধু সামনের দিক প্রয়োজন' : 'Passport requires front side only'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Present Address */}
                  <div>
                    <h3 className={`text-sm sm:text-base font-semibold mb-2 sm:mb-3 flex items-center gap-2 ${fontClass}`}>
                      <MapPin className="w-4 h-4 text-primary" />
                      {t('presentAddress', language)}
                    </h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className={`text-sm ${fontClass}`}>{t('houseRoadVillage', language)} <span className="text-destructive">*</span></Label>
                        <Input value={houseRoadVillage} onChange={(e) => setHouseRoadVillage(e.target.value)} className="h-11" placeholder={isBn ? 'বাড়ি/রাস্তা/গ্রাম' : 'House/Road/Village'} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className={`text-sm ${fontClass}`}>{t('upazilaThana', language)} <span className="text-destructive">*</span></Label>
                        <Input value={upazilaThana} onChange={(e) => setUpazilaThana(e.target.value)} className="h-11" placeholder={isBn ? 'উপজেলা/থানা' : 'Upazila/Thana'} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className={`text-sm ${fontClass}`}>{t('division', language)} <span className="text-destructive">*</span></Label>
                          <Select value={division} onValueChange={(v) => { setDivision(v); setDistrict(''); }}>
                            <SelectTrigger className="h-11"><SelectValue placeholder={t('selectDivision', language)} /></SelectTrigger>
                            <SelectContent>
                              {BD_DIVISIONS.map(d => <SelectItem key={d.id} value={d.id}>{isBn ? d.labelBn : d.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className={`text-sm ${fontClass}`}>{t('district', language)} <span className="text-destructive">*</span></Label>
                          <Select value={district} onValueChange={setDistrict} disabled={!division}>
                            <SelectTrigger className="h-11"><SelectValue placeholder={t('selectDistrict', language)} /></SelectTrigger>
                            <SelectContent>
                              {districts.map(d => <SelectItem key={d.label} value={d.label}>{isBn ? d.labelBn : d.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className={`text-sm ${fontClass}`}>{t('postalCode', language)}</Label>
                        <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="h-11" placeholder="1200" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Selfie + GPS */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-5">
                  {/* GPS Status */}
                  <div className={`flex items-start gap-2 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm ${fontClass} ${
                    gpsStatus === 'granted' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                    gpsStatus === 'denied' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                    'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                  }`}>
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      {gpsStatus === 'granted' && (isBn ? `জিপিএস সক্রিয়: ${gpsLatitude?.toFixed(4)}, ${gpsLongitude?.toFixed(4)}` : `GPS active: ${gpsLatitude?.toFixed(4)}, ${gpsLongitude?.toFixed(4)}`)}
                      {gpsStatus === 'denied' && (isBn ? 'জিপিএস অ্যাক্সেস অস্বীকৃত। অনুগ্রহ করে ব্রাউজার সেটিংসে অনুমতি দিন।' : 'GPS access denied. Please enable in browser settings.')}
                      {gpsStatus === 'pending' && (isBn ? 'জিপিএস অনুমতির অপেক্ষায়...' : 'Waiting for GPS permission...')}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-primary/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h4 className={`text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 flex items-center gap-2 ${fontClass}`}>
                      <Sun className="w-4 h-4 text-primary" />
                      {t('selfieInstructions', language)}
                    </h4>
                    <ul className={`space-y-1 text-xs text-muted-foreground ${fontClass}`}>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" />{t('mustBeInLight', language)}</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" />{t('gpsLocationOn', language)}</li>
                    </ul>
                  </div>

                  {/* Pose selector */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      { key: 'front' as const, label: isBn ? 'সামনে' : 'Front', captured: !!selfiePhoto, icon: User },
                      { key: 'right' as const, label: t('faceRight', language), captured: !!selfieRight, icon: Eye },
                      { key: 'left' as const, label: t('faceLeft', language), captured: !!selfieLeft, icon: EyeOff },
                      { key: 'smile' as const, label: t('faceSmile', language), captured: !!selfieSmile, icon: Camera },
                      { key: 'blink' as const, label: t('eyeBlink', language), captured: !!selfieBlink, icon: Camera },
                    ].map(pose => (
                      <button
                        key={pose.key}
                        onClick={() => setCurrentPose(pose.key)}
                        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] sm:min-h-0 touch-manipulation ${
                          currentPose === pose.key
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : pose.captured
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        } ${fontClass}`}
                      >
                        {pose.captured && <Check className="w-3 h-3" />}
                        {pose.label}
                      </button>
                    ))}
                  </div>

                  {/* Camera area */}
                  <div className="relative rounded-lg sm:rounded-xl overflow-hidden border bg-black aspect-[4/3]">
                    {/* Show captured photo preview or live camera */}
                    {(() => {
                      const currentPhoto = currentPose === 'front' ? selfiePhoto :
                        currentPose === 'right' ? selfieRight :
                        currentPose === 'left' ? selfieLeft :
                        currentPose === 'smile' ? selfieSmile : selfieBlink;

                      if (currentPhoto && !cameraActive) {
                        return (
                          <div className="relative w-full h-full">
                            <img src={currentPhoto} alt="Captured" className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                              <Button size="sm" variant="secondary" onClick={startCamera} className="min-h-[36px]">
                                <RotateCcw className="w-3 h-3 mr-1" />{t('retake', language)}
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <>
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                          <canvas ref={canvasRef} className="hidden" />

                          {/* Pose instruction overlay */}
                          {cameraActive && (
                            <div className="absolute inset-0 pointer-events-none">
                              {/* Face guide oval */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-36 h-48 sm:w-48 sm:h-64 border-2 border-white/40 rounded-full" />
                              </div>
                              {/* Pose label */}
                              <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs">
                                {currentPose === 'front' && (isBn ? 'সোজা তাকান' : 'Look straight')}
                                {currentPose === 'right' && t('faceRight', language)}
                                {currentPose === 'left' && t('faceLeft', language)}
                                {currentPose === 'smile' && t('faceSmile', language)}
                                {currentPose === 'blink' && t('eyeBlink', language)}
                              </div>
                            </div>
                          )}

                          {!cameraActive && !currentPhoto && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                              <Camera className="w-12 h-12 text-white/50" />
                              <Button size="sm" onClick={startCamera}>
                                <Camera className="w-4 h-4 mr-2" />
                                {isBn ? 'ক্যামেরা চালু করুন' : 'Start Camera'}
                              </Button>
                            </div>
                          )}

                          {/* Capture button */}
                          {cameraActive && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                              <Button
                                size="lg"
                                onClick={handleCapture}
                                disabled={capturing}
                                className="rounded-full w-14 h-14 bg-white text-black hover:bg-white/90 shadow-lg"
                              >
                                {capturing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                              </Button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Captured photos grid */}
                  <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2">
                    {[
                      { src: selfiePhoto, label: isBn ? 'সামনে' : 'Front', required: true },
                      { src: selfieRight, label: t('faceRight', language), required: false },
                      { src: selfieLeft, label: t('faceLeft', language), required: false },
                      { src: selfieSmile, label: t('faceSmile', language), required: false },
                      { src: selfieBlink, label: t('eyeBlink', language), required: false },
                    ].map((item, idx) => (
                      <div key={idx} className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 ${
                        item.src ? 'border-emerald-500' : 'border-muted'
                      } relative`}>
                        {item.src ? (
                          <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                          </div>
                        )}
                        {item.required && !item.src && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className={fontClass}>{error}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep((prev) => (prev - 1) as Step)} className={`min-h-[44px] ${fontClass}`}>
                  <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />{t('back', language)}
                </Button>
              )}

              {currentStep < 2 ? (
                <Button
                  onClick={() => {
                    setError('');
                    if (!isStep1Valid()) {
                      setError(isBn ? 'সকল প্রয়োজনীয় তথ্য পূরণ করুন' : 'Please fill in all required fields');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="flex-1 min-h-[44px] bg-primary"
                  disabled={!isStep1Valid()}
                >
                  {t('next', language)}<ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStep2Valid() || loading}
                  className="flex-1 min-h-[44px] bg-primary"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  {t('submit', language)}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
