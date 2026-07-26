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
  RotateCcw, Lock, ChevronRight, Sun, ArrowRightCircle, ArrowLeftCircle,
  SmileIcon, Zap
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

const POSE_NAMES = ['front', 'right', 'left', 'smile', 'blink'] as const;
type PoseName = typeof POSE_NAMES[number];

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
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  // Auto-capture sequence state
  const [autoCaptureActive, setAutoCaptureActive] = useState(false);
  const [autoCaptureStep, setAutoCaptureStep] = useState(0); // 0-4 for 5 poses
  const [countdown, setCountdown] = useState(0); // 3, 2, 1 countdown
  const [poseTransition, setPoseTransition] = useState(false); // brief transition between poses
  const [allCaptured, setAllCaptured] = useState(false); // all 5 poses captured

  // Pre-check screen state (before Step 2)
  const [showPreCheck, setShowPreCheck] = useState(false);
  const [preCheckLoading, setPreCheckLoading] = useState(false);

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

  // Auto-capture countdown sequence
  useEffect(() => {
    if (!autoCaptureActive) return;

    // During pose transition (1 second pause between poses)
    if (poseTransition) {
      const transitionTimer = setTimeout(() => {
        setPoseTransition(false);
        setCountdown(3);
      }, 1000);
      return () => clearTimeout(transitionTimer);
    }

    // Countdown phase
    if (countdown > 0) {
      const countdownTimer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(countdownTimer);
    }

    // countdown === 0: capture current pose
    if (countdown === 0) {
      const captureCurrentPose = async () => {
        try {
          const url = await capturePhoto();
          switch (POSE_NAMES[autoCaptureStep]) {
            case 'front': setSelfiePhoto(url); break;
            case 'right': setSelfieRight(url); break;
            case 'left': setSelfieLeft(url); break;
            case 'smile': setSelfieSmile(url); break;
            case 'blink': setSelfieBlink(url); break;
          }
        } catch {
          toast.error(isBn ? 'ক্যাপচার ব্যর্থ, পুনরায় শুরু করুন' : 'Capture failed, please retake');
          setAutoCaptureActive(false);
          setAllCaptured(false);
          return;
        }

        // Check if all poses captured
        if (autoCaptureStep >= 4) {
          setAutoCaptureActive(false);
          setAllCaptured(true);
          setCountdown(0);
        } else {
          // Move to next pose with brief transition
          setAutoCaptureStep(autoCaptureStep + 1);
          setPoseTransition(true);
        }
      };
      captureCurrentPose();
    }
  }, [autoCaptureActive, countdown, poseTransition, autoCaptureStep, isBn]);

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
        setCameraPermission('granted');
      }
    } catch {
      setCameraPermission('denied');
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
    const poseName = POSE_NAMES[autoCaptureStep] || 'front';
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `selfie-${poseName}.jpg`, { type: 'image/jpeg' });
    return await uploadFile(file);
  }, [autoCaptureStep]);

  // Start auto-capture sequence
  const startAutoCapture = async () => {
    // Ensure camera is on first
    if (!cameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setCameraPermission('granted');
        }
      } catch {
        setCameraPermission('denied');
        toast.error(isBn ? 'ক্যামেরা অ্যাক্সেস ব্যর্থ' : 'Camera access failed');
        return;
      }
    }

    // Reset all selfie states
    setSelfiePhoto('');
    setSelfieRight('');
    setSelfieLeft('');
    setSelfieSmile('');
    setSelfieBlink('');
    setAllCaptured(false);
    setAutoCaptureStep(0);
    setPoseTransition(false);
    setCountdown(3);
    setAutoCaptureActive(true);
  };

  // Retake - restart entire sequence
  const handleRetake = async () => {
    stopCamera();
    setAllCaptured(false);
    setAutoCaptureActive(false);
    setAutoCaptureStep(0);
    setCountdown(0);
    setPoseTransition(false);
    // Small delay to allow camera to stop, then restart
    await new Promise(r => setTimeout(r, 500));
    startAutoCapture();
  };

  // Pre-check: verify GPS and Camera before allowing Step 2
  const runPreCheck = async () => {
    setPreCheckLoading(true);
    setError('');

    // Check GPS
    if (gpsStatus === 'pending') {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
        });
        setGpsLatitude(pos.coords.latitude);
        setGpsLongitude(pos.coords.longitude);
        setGpsStatus('granted');
      } catch {
        setGpsStatus('denied');
      }
    }

    // Check Camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      setCameraPermission('granted');
      // Stop the stream immediately - we'll restart when needed
      stream.getTracks().forEach(track => track.stop());
    } catch {
      setCameraPermission('denied');
    }

    setPreCheckLoading(false);
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

  // Step 2 validation - require ALL 5 selfies + GPS granted + camera permission granted
  const isStep2Valid = () => {
    return (
      selfiePhoto &&
      selfieRight &&
      selfieLeft &&
      selfieSmile &&
      selfieBlink &&
      gpsStatus === 'granted' &&
      cameraPermission === 'granted'
    );
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

  // Get pose instruction text
  const getPoseInstructionText = (pose: PoseName): string => {
    switch (pose) {
      case 'front': return isBn ? 'সোজা তাকান' : 'Look straight ahead';
      case 'right': return isBn ? 'ডান দিকে তাকান' : 'Turn face right';
      case 'left': return isBn ? 'বাম দিকে তাকান' : 'Turn face left';
      case 'smile': return isBn ? 'মুচকি হাসুন' : 'Smile!';
      case 'blink': return isBn ? 'চোখ বন্ধ করুন' : 'Close your eyes briefly';
    }
  };

  // Get pose instruction icon/arrow
  const getPoseIcon = (pose: PoseName) => {
    switch (pose) {
      case 'front': return <User className="w-5 h-5" />;
      case 'right': return <ArrowRightCircle className="w-5 h-5" />;
      case 'left': return <ArrowLeftCircle className="w-5 h-5" />;
      case 'smile': return <SmileIcon className="w-5 h-5" />;
      case 'blink': return <EyeOff className="w-5 h-5" />;
    }
  };

  // Round progress bar calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const currentPose = POSE_NAMES[autoCaptureStep];
  const completedPoses = autoCaptureStep + (countdown === 0 && autoCaptureActive ? 1 : 0);
  const progressOffset = circumference - ((allCaptured ? 5 : completedPoses) / 5) * circumference;

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

        {/* Pre-check screen between Step 1 → Step 2 */}
        {showPreCheck && (
          <Card className="shadow-xl border-primary/10">
            <CardContent className="p-3 sm:p-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
                <div className="text-center">
                  <h3 className={`text-base sm:text-lg font-semibold mb-1 ${fontClass}`}>
                    {isBn ? 'জিপিএস ও ক্যামেরা প্রি-চেক' : 'GPS & Camera Pre-Check'}
                  </h3>
                  <p className={`text-xs sm:text-sm text-muted-foreground ${fontClass}`}>
                    {isBn ? 'সেলফি ধাপে যাওয়ার আগে জিপিএস ও ক্যামেরা অনুমতি প্রয়োজন' : 'GPS and Camera permissions are required before proceeding to the selfie step'}
                  </p>
                </div>

                {/* GPS Check */}
                <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                  gpsStatus === 'granted' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' :
                  gpsStatus === 'denied' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      gpsStatus === 'granted' ? 'bg-emerald-200 dark:bg-emerald-800' :
                      gpsStatus === 'denied' ? 'bg-red-200 dark:bg-red-800' :
                      'bg-amber-200 dark:bg-amber-800'
                    }`}>
                      {gpsStatus === 'granted' ? <Check className="w-5 h-5 text-emerald-600" /> :
                       gpsStatus === 'denied' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                       <MapPin className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${fontClass}`}>
                        {isBn ? 'জিপিএস অবস্থান' : 'GPS Location'}
                      </p>
                      <p className={`text-xs ${gpsStatus === 'granted' ? 'text-emerald-600' : gpsStatus === 'denied' ? 'text-red-600' : 'text-amber-600'} ${fontClass}`}>
                        {gpsStatus === 'granted' && (isBn ? `সক্রিয়: ${gpsLatitude?.toFixed(4)}, ${gpsLongitude?.toFixed(4)}` : `Active: ${gpsLatitude?.toFixed(4)}, ${gpsLongitude?.toFixed(4)}`)}
                        {gpsStatus === 'denied' && (isBn ? 'অস্বীকৃত — ব্রাউজার সেটিংসে অনুমতি দিন' : 'Denied — enable in browser settings')}
                        {gpsStatus === 'pending' && (isBn ? 'অপেক্ষায়...' : 'Checking...')}
                      </p>
                      {gpsStatus === 'denied' && (
                        <div className={`mt-2 p-2 rounded bg-red-100 dark:bg-red-900/30 text-xs text-red-700 dark:text-red-400 ${fontClass}`}>
                          <p className="font-semibold mb-1">{isBn ? 'কিভাবে জিপিএস সক্রিয় করবেন:' : 'How to enable GPS:'}</p>
                          <ol className="list-decimal list-inside space-y-0.5">
                            <li>{isBn ? 'ব্রাউজার সেটিংস → প্রাইভেসি → লোকেশন' : 'Browser Settings → Privacy → Location'}</li>
                            <li>{isBn ? 'এই সাইটের জন্য "Allow" নির্বাচন করুন' : 'Select "Allow" for this site'}</li>
                            <li>{isBn ? 'পৃষ্ঠা রিফ্রেশ করুন এবং পুনরায় চেক করুন' : 'Refresh the page and try again'}</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Camera Check */}
                <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                  cameraPermission === 'granted' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' :
                  cameraPermission === 'denied' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      cameraPermission === 'granted' ? 'bg-emerald-200 dark:bg-emerald-800' :
                      cameraPermission === 'denied' ? 'bg-red-200 dark:bg-red-800' :
                      'bg-amber-200 dark:bg-amber-800'
                    }`}>
                      {cameraPermission === 'granted' ? <Check className="w-5 h-5 text-emerald-600" /> :
                       cameraPermission === 'denied' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                       <Camera className="w-5 h-5 text-amber-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${fontClass}`}>
                        {isBn ? 'ক্যামেরা অনুমতি' : 'Camera Permission'}
                      </p>
                      <p className={`text-xs ${cameraPermission === 'granted' ? 'text-emerald-600' : cameraPermission === 'denied' ? 'text-red-600' : 'text-amber-600'} ${fontClass}`}>
                        {cameraPermission === 'granted' && (isBn ? 'সক্রিয় — ক্যামেরা প্রস্তুত' : 'Granted — Camera ready')}
                        {cameraPermission === 'denied' && (isBn ? 'অস্বীকৃত — ব্রাউজার সেটিংসে অনুমতি দিন' : 'Denied — enable in browser settings')}
                        {cameraPermission === 'pending' && (isBn ? 'অপেক্ষায়...' : 'Checking...')}
                      </p>
                      {cameraPermission === 'denied' && (
                        <div className={`mt-2 p-2 rounded bg-red-100 dark:bg-red-900/30 text-xs text-red-700 dark:text-red-400 ${fontClass}`}>
                          <p className="font-semibold mb-1">{isBn ? 'কিভাবে ক্যামেরা সক্রিয় করবেন:' : 'How to enable Camera:'}</p>
                          <ol className="list-decimal list-inside space-y-0.5">
                            <li>{isBn ? 'ব্রাউজার সেটিংস → প্রাইভেসি → ক্যামেরা' : 'Browser Settings → Privacy → Camera'}</li>
                            <li>{isBn ? 'এই সাইটের জন্য "Allow" নির্বাচন করুন' : 'Select "Allow" for this site'}</li>
                            <li>{isBn ? 'পৃষ্ঠা রিফ্রেশ করুন এবং পুনরায় চেক করুন' : 'Refresh the page and try again'}</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={runPreCheck}
                    disabled={preCheckLoading}
                    className="min-h-[44px] bg-primary w-full"
                  >
                    {preCheckLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    {isBn ? 'পুনরায় চেক করুন' : 'Try Again'}
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setShowPreCheck(false); setCurrentStep(1); }} className={`min-h-[44px] flex-1 ${fontClass}`}>
                      <ArrowLeft className="w-4 h-4 mr-1" />{t('back', language)}
                    </Button>
                    <Button
                      onClick={() => {
                        if (gpsStatus !== 'granted' || cameraPermission !== 'granted') {
                          setError(isBn ? 'জিপিএস ও ক্যামেরা অনুমতি প্রয়োজন' : 'GPS and Camera permissions are required');
                          return;
                        }
                        setError('');
                        setShowPreCheck(false);
                        setCurrentStep(2);
                      }}
                      disabled={gpsStatus !== 'granted' || cameraPermission !== 'granted'}
                      className="min-h-[44px] flex-1 bg-primary"
                    >
                      {isBn ? 'সেলফি ধাপে যান' : 'Proceed to Selfie'}<ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        )}

        {!showPreCheck && (
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

                {/* STEP 2: Selfie + GPS — Auto-capture with round progress */}
                {currentStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 sm:space-y-5">

                    {/* GPS Status bar */}
                    <div className={`flex items-start gap-2 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm ${fontClass} ${
                      gpsStatus === 'granted' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                      gpsStatus === 'denied' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                      'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    }`}>
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        {gpsStatus === 'granted' && (isBn ? `জিপিএস সক্রিয়: ${gpsLatitude?.toFixed(4)}, ${gpsLongitude?.toFixed(4)}` : `GPS active: ${gpsLatitude?.toFixed(4)}, ${gpsLongitude?.toFixed(4)}`)}
                        {gpsStatus === 'denied' && (isBn ? 'জিপিএস অস্বীকৃত। সাবমিট ব্যাহত হবে।' : 'GPS denied. Submission will be blocked.')}
                        {gpsStatus === 'pending' && (isBn ? 'জিপিএস অনুমতির অপেক্ষায়...' : 'Waiting for GPS permission...')}
                      </div>
                    </div>

                    {/* Camera Permission bar */}
                    <div className={`flex items-start gap-2 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm ${fontClass} ${
                      cameraPermission === 'granted' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                      cameraPermission === 'denied' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                      'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    }`}>
                      <Camera className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        {cameraPermission === 'granted' && (isBn ? 'ক্যামেরা সক্রিয়' : 'Camera permission granted')}
                        {cameraPermission === 'denied' && (isBn ? 'ক্যামেরা অস্বীকৃত। সাবমিট ব্যাহত হবে।' : 'Camera denied. Submission will be blocked.')}
                        {cameraPermission === 'pending' && (isBn ? 'ক্যামেরা অনুমতির অপেক্ষায়...' : 'Waiting for camera permission...')}
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
                        <li className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-primary" />{isBn ? '5 পোজ অটো-ক্যাপচার (~20 সেকেন্ড)' : '5-pose auto-capture (~20 seconds)'}</li>
                      </ul>
                    </div>

                    {/* === SUCCESS SCREEN: All 5 poses captured === */}
                    {allCaptured && !autoCaptureActive && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                        <div className="text-center p-4 sm:p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center mb-3">
                            <Check className="w-7 h-7 text-emerald-600" />
                          </div>
                          <h3 className={`text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 ${fontClass}`}>
                            {isBn ? 'সকল সেলফি ক্যাপচার সম্পন্ন!' : 'All selfie captures completed!'}
                          </h3>
                          <p className={`text-xs sm:text-sm text-muted-foreground mt-1 ${fontClass}`}>
                            {isBn ? 'নিচের 5টি ছবি পর্যালোচন করুন' : 'Review your 5 captured photos below'}
                          </p>
                        </div>

                        {/* 5 captured thumbnails */}
                        <div className="grid grid-cols-5 gap-2 sm:gap-3">
                          {[
                            { src: selfiePhoto, label: isBn ? 'সামনে' : 'Front', pose: 'front' },
                            { src: selfieRight, label: isBn ? 'ডান' : 'Right', pose: 'right' },
                            { src: selfieLeft, label: isBn ? 'বাম' : 'Left', pose: 'left' },
                            { src: selfieSmile, label: isBn ? 'হাসি' : 'Smile', pose: 'smile' },
                            { src: selfieBlink, label: isBn ? 'চোখ বন্ধ' : 'Blink', pose: 'blink' },
                          ].map((item, idx) => (
                            <div key={idx} className="relative">
                              <div className="aspect-square rounded-lg overflow-hidden border-2 border-emerald-500">
                                {item.src ? (
                                  <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Camera className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <p className={`text-xs text-center mt-1 truncate ${fontClass}`}>{item.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Retake button */}
                        <div className="flex justify-center">
                          <Button variant="outline" onClick={handleRetake} className={`min-h-[44px] ${fontClass}`}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {isBn ? 'পুনরায় ক্যাপচার' : 'Retake All Poses'}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* === AUTO-CAPTURE IN PROGRESS === */}
                    {autoCaptureActive && !allCaptured && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {/* Pose progress indicator */}
                        <div className="flex justify-center gap-1.5 sm:gap-2">
                          {POSE_NAMES.map((pose, idx) => (
                            <div key={pose} className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                              idx === autoCaptureStep
                                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                : idx < autoCaptureStep
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-muted text-muted-foreground'
                            } ${fontClass}`}>
                              {idx < autoCaptureStep && <Check className="w-3 h-3" />}
                              {idx === autoCaptureStep && getPoseIcon(pose)}
                              <span className="hidden sm:inline">{getPoseInstructionText(pose)}</span>
                              <span className="sm:hidden">{idx + 1}</span>
                            </div>
                          ))}
                        </div>

                        {/* Camera view with round progress bar */}
                        <div className="relative rounded-lg sm:rounded-xl overflow-hidden border bg-black aspect-[4/3]">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                          <canvas ref={canvasRef} className="hidden" />

                          {/* Face guide overlay */}
                          {cameraActive && (
                            <div className="absolute inset-0 pointer-events-none">
                              {/* Animated face guide oval */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                  animate={{
                                    scale: [1, 1.03, 1],
                                    opacity: [0.6, 0.8, 0.6],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                  className="relative"
                                >
                                  {/* Oval face guide */}
                                  <div className="w-32 h-44 sm:w-44 sm:h-60 border-2 border-white/50 rounded-full" style={{
                                    boxShadow: '0 0 20px rgba(255,255,255,0.15), inset 0 0 20px rgba(255,255,255,0.05)',
                                  }} />

                                  {/* Pose-specific directional indicator inside oval */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    {currentPose === 'front' && (
                                      <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/70 text-lg sm:text-xl font-semibold">
                                        ↑
                                      </motion.div>
                                    )}
                                    {currentPose === 'right' && (
                                      <motion.div animate={{ x: [0, 15, 0], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/80 text-2xl sm:text-3xl">
                                        →
                                      </motion.div>
                                    )}
                                    {currentPose === 'left' && (
                                      <motion.div animate={{ x: [0, -15, 0], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/80 text-2xl sm:text-3xl">
                                        ←
                                      </motion.div>
                                    )}
                                    {currentPose === 'smile' && (
                                      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="text-white/80 text-2xl sm:text-3xl">
                                        😊
                                      </motion.div>
                                    )}
                                    {currentPose === 'blink' && (
                                      <motion.div animate={{ opacity: [0.9, 0.3, 0.9] }} transition={{ duration: 1, repeat: Infinity }} className="text-white/80 text-lg sm:text-xl font-bold">
                                        ✕✕
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>
                              </div>

                              {/* Pose instruction text at top */}
                              <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2">
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={currentPose}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-black/70 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
                                  >
                                    {getPoseIcon(currentPose)}
                                    <span className={fontClass}>{getPoseInstructionText(currentPose)}</span>
                                  </motion.div>
                                </AnimatePresence>
                              </div>

                              {/* Round progress bar with countdown */}
                              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                                <div className="relative w-[70px] h-[70px] sm:w-[85px] sm:h-[85px]">
                                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                                    {/* Background circle */}
                                    <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                                    {/* Progress circle */}
                                    <circle
                                      cx="80" cy="80" r={radius} fill="none"
                                      stroke={allCaptured ? "#10b981" : "#ffffff"}
                                      strokeWidth="6"
                                      strokeLinecap="round"
                                      strokeDasharray={circumference}
                                      strokeDashoffset={progressOffset}
                                      style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                                    />
                                  </svg>
                                  {/* Center content: countdown or checkmark */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    {poseTransition ? (
                                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70 text-xs font-medium">
                                        ...
                                      </motion.div>
                                    ) : countdown > 0 ? (
                                      <AnimatePresence mode="wait">
                                        <motion.div
                                          key={countdown}
                                          initial={{ scale: 1.5, opacity: 0 }}
                                          animate={{ scale: 1, opacity: 1 }}
                                          exit={{ scale: 0.5, opacity: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="text-white text-2xl sm:text-3xl font-bold"
                                        >
                                          {countdown}
                                        </motion.div>
                                      </AnimatePresence>
                                    ) : countdown === 0 && autoCaptureActive ? (
                                      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-emerald-400">
                                        <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                                      </motion.div>
                                    ) : null}
                                  </div>
                                  {/* Pose count text below center */}
                                  <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2">
                                    <span className="text-white/60 text-[10px] sm:text-xs font-medium">
                                      {allCaptured ? '5/5' : `${completedPoses}/5`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Pose status grid below camera */}
                        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2">
                          {POSE_NAMES.map((pose, idx) => {
                            const src = pose === 'front' ? selfiePhoto :
                              pose === 'right' ? selfieRight :
                              pose === 'left' ? selfieLeft :
                              pose === 'smile' ? selfieSmile : selfieBlink;
                            return (
                              <div key={pose} className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                idx === autoCaptureStep ? 'border-primary scale-110' :
                                idx < autoCaptureStep && src ? 'border-emerald-500' :
                                'border-muted'
                              } relative`}>
                                {src ? (
                                  <img src={src} alt={pose} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                                    {idx === autoCaptureStep ? (
                                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    ) : (
                                      <Camera className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </div>
                                )}
                                {idx < autoCaptureStep && src && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* === INITIAL STATE: Before auto-capture starts === */}
                    {!autoCaptureActive && !allCaptured && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {/* Pose progress indicator (all empty) */}
                        <div className="flex justify-center gap-1.5 sm:gap-2">
                          {POSE_NAMES.map((pose, idx) => (
                            <div key={pose} className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium ${
                              'bg-muted text-muted-foreground'
                            } ${fontClass}`}>
                              {getPoseIcon(pose)}
                              <span className="hidden sm:inline">{getPoseInstructionText(pose)}</span>
                              <span className="sm:hidden">{idx + 1}</span>
                            </div>
                          ))}
                        </div>

                        {/* Camera view - initial state */}
                        <div className="relative rounded-lg sm:rounded-xl overflow-hidden border bg-black aspect-[4/3]">
                          {!cameraActive ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                              <Camera className="w-12 h-12 text-white/50" />
                              <p className={`text-white/40 text-xs sm:text-sm ${fontClass}`}>
                                {isBn ? 'ক্যামেরা চালু করতে নিচের বাটন ক্লিক করুন' : 'Press the button below to start camera'}
                              </p>
                            </div>
                          ) : (
                            <>
                              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                              {/* Simple face guide oval when camera active but not capturing */}
                              <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <motion.div animate={{ opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <div className="w-32 h-44 sm:w-44 sm:h-60 border-2 border-white/30 rounded-full" />
                                  </motion.div>
                                </div>
                                <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white/80 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                  {isBn ? 'মুখ oval এ রাখুন' : 'Position face in oval'}
                                </div>
                              </div>
                            </>
                          )}
                          <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {/* Empty pose slots */}
                        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2">
                          {POSE_NAMES.map((pose, idx) => {
                            const src = pose === 'front' ? selfiePhoto :
                              pose === 'right' ? selfieRight :
                              pose === 'left' ? selfieLeft :
                              pose === 'smile' ? selfieSmile : selfieBlink;
                            return (
                              <div key={pose} className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 ${
                                src ? 'border-emerald-500' : 'border-muted'
                              } relative`}>
                                {src ? (
                                  <img src={src} alt={pose} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Start Selfie Capture button */}
                        <div className="flex justify-center">
                          <Button
                            onClick={startAutoCapture}
                            disabled={cameraPermission === 'denied' || gpsStatus === 'denied'}
                            className="min-h-[44px] bg-primary px-6 sm:px-8 text-sm sm:text-base"
                          >
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            {isBn ? 'সেলফি ক্যাপচার শুরু করুন' : 'Start Selfie Capture'}
                          </Button>
                        </div>

                        {(cameraPermission === 'denied' || gpsStatus === 'denied') && (
                          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className={fontClass}>
                              {cameraPermission === 'denied' && gpsStatus === 'denied'
                                ? (isBn ? 'ক্যামেরা ও জিপিএস অনুমতি প্রয়োজন' : 'Camera and GPS permissions are required')
                                : cameraPermission === 'denied'
                                ? (isBn ? 'ক্যামেরা অনুমতি প্রয়োজন' : 'Camera permission is required')
                                : (isBn ? 'জিপিএস অনুমতি প্রয়োজন' : 'GPS permission is required')
                              }
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}
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
                {currentStep > 1 && !showPreCheck && (
                  <Button variant="outline" onClick={() => setCurrentStep((prev) => (prev - 1) as Step)} className={`min-h-[44px] ${fontClass}`}>
                    <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />{t('back', language)}
                  </Button>
                )}

                {currentStep < 2 && !showPreCheck ? (
                  <Button
                    onClick={() => {
                      setError('');
                      if (!isStep1Valid()) {
                        setError(isBn ? 'সকল প্রয়োজনীয় তথ্য পূরণ করুন' : 'Please fill in all required fields');
                        return;
                      }
                      // Show pre-check screen before Step 2
                      setShowPreCheck(true);
                    }}
                    className="flex-1 min-h-[44px] bg-primary"
                    disabled={!isStep1Valid()}
                  >
                    {t('next', language)}<ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
                  </Button>
                ) : currentStep === 2 && !showPreCheck ? (
                  <div className="flex-1 space-y-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={!isStep2Valid() || loading}
                      className="w-full min-h-[44px] bg-primary"
                    >
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                      {t('submit', language)}
                    </Button>
                    {/* Show red warning if GPS or Camera not granted */}
                    {!isStep2Valid() && allCaptured && (
                      <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className={fontClass}>
                          {gpsStatus !== 'granted' && cameraPermission !== 'granted'
                            ? (isBn ? 'জিপিএস ও ক্যামেরা অনুমতি প্রয়োজন' : 'GPS and Camera permissions required to submit')
                            : gpsStatus !== 'granted'
                            ? (isBn ? 'জিপিএস অনুমতি প্রয়োজন' : 'GPS permission required to submit')
                            : cameraPermission !== 'granted'
                            ? (isBn ? 'ক্যামেরা অনুমতি প্রয়োজন' : 'Camera permission required to submit')
                            : (isBn ? 'সকল 5 সেলফি প্রয়োজন' : 'All 5 selfies required to submit')
                          }
                        </span>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
