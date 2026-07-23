'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Camera,
  Video,
  MapPin,
  Clock,
  Upload,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface JourneyVerificationUploadProps {
  orderId: string;
  ticketType: string;
  departureDate: string;
  onSubmitted?: () => void;
}

interface VerificationStatus {
  id: string;
  orderId: string;
  buyerId: string;
  photo: string | null;
  video: string | null;
  gpsLat: number | null;
  gpsLng: number | null;
  gpsTimestamp: string | null;
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  submittedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

type StepKey = 'photo' | 'video' | 'gps';

const STEPS: { key: StepKey; label: string; icon: React.ElementType }[] = [
  { key: 'photo', label: 'Photo', icon: Camera },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'gps', label: 'GPS', icon: MapPin },
];

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCountdown(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return 'Escrow release pending...';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'verified':
      return 'default';
    case 'submitted':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'submitted':
      return 'Submitted';
    case 'rejected':
      return 'Rejected';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
}

export default function JourneyVerificationUpload({
  orderId,
  ticketType,
  departureDate,
  onSubmitted,
}: JourneyVerificationUploadProps) {
  // File state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // GPS state
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);
  const [gpsTimestamp, setGpsTimestamp] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsCapturing, setGpsCapturing] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Conversion state
  const [convertingPhoto, setConvertingPhoto] = useState(false);
  const [convertingVideo, setConvertingVideo] = useState(false);

  // Existing verification state (loaded from API)
  const [existingVerification, setExistingVerification] =
    useState<VerificationStatus | null>(null);
  const [escrowReleaseTime, setEscrowReleaseTime] = useState<string | null>(
    null
  );
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Countdown timer
  const [countdown, setCountdown] = useState<string>('');

  // File input refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Resubmit mode (after rejection)
  const [resubmitMode, setResubmitMode] = useState(false);

  // ---- Load existing verification status ----
  useEffect(() => {
    async function loadStatus() {
      try {
        const token = localStorage.getItem('etr_token');
        if (!token) {
          setLoadingStatus(false);
          return;
        }
        const res = await fetch(
          `/api/orders/journey-verify?orderId=${encodeURIComponent(orderId)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          setLoadingStatus(false);
          return;
        }
        const data = await res.json();
        if (data.journeyVerification) {
          setExistingVerification(data.journeyVerification);
          setEscrowReleaseTime(data.escrowReleaseTime);
        }
      } catch {
        // Silently fail - component will show upload form
      } finally {
        setLoadingStatus(false);
      }
    }
    loadStatus();
  }, [orderId]);

  // ---- Countdown timer ----
  useEffect(() => {
    if (!escrowReleaseTime) return;
    const target = new Date(escrowReleaseTime);
    const update = () => setCountdown(formatCountdown(target));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [escrowReleaseTime]);

  // ---- Step completion tracker ----
  const completedSteps: Record<StepKey, boolean> = {
    photo: !!photoBase64,
    video: !!videoBase64,
    gps: gpsLat !== null && gpsLng !== null,
  };
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  // ---- File to base64 converter ----
  const fileToBase64 = useCallback(
    (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      }),
    []
  );

  // ---- Photo handler ----
  const handlePhotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setPhotoError(null);
      if (!file) return;

      if (file.size > MAX_PHOTO_SIZE) {
        setPhotoError(
          `Photo too large (${formatFileSize(file.size)}). Max size is 5MB.`
        );
        setPhotoFile(null);
        setPhotoBase64(null);
        setPhotoPreview(null);
        return;
      }

      setPhotoFile(file);
      setConvertingPhoto(true);
      try {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPhotoPreview(previewUrl);
        // Convert to base64
        const b64 = await fileToBase64(file);
        setPhotoBase64(b64);
      } catch {
        setPhotoError('Failed to process photo. Please try again.');
        setPhotoBase64(null);
        setPhotoPreview(null);
      } finally {
        setConvertingPhoto(false);
      }
    },
    [fileToBase64]
  );

  // ---- Video handler ----
  const handleVideoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setVideoError(null);
      if (!file) return;

      if (file.size > MAX_VIDEO_SIZE) {
        setVideoError(
          `Video too large (${formatFileSize(file.size)}). Max size is 20MB.`
        );
        setVideoFile(null);
        setVideoBase64(null);
        return;
      }

      setVideoFile(file);
      setConvertingVideo(true);
      try {
        const b64 = await fileToBase64(file);
        setVideoBase64(b64);
      } catch {
        setVideoError('Failed to process video. Please try again.');
        setVideoBase64(null);
      } finally {
        setConvertingVideo(false);
      }
    },
    [fileToBase64]
  );

  // ---- GPS capture ----
  const captureGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsCapturing(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLat(position.coords.latitude);
        setGpsLng(position.coords.longitude);
        setGpsTimestamp(new Date(position.timestamp).toISOString());
        setGpsCapturing(false);
        setGpsError(null);
      },
      (error) => {
        setGpsCapturing(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError(
              'GPS permission denied. Please enable location access in your browser/device settings.'
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('GPS position unavailable. Please try again later.');
            break;
          case error.TIMEOUT:
            setGpsError('GPS request timed out. Please try again.');
            break;
          default:
            setGpsError('An unknown GPS error occurred. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  // ---- Submit handler ----
  const handleSubmit = useCallback(async () => {
    if (gpsLat === null || gpsLng === null) {
      setSubmitError('GPS location is required. Please capture your GPS first.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = localStorage.getItem('etr_token');
      if (!token) {
        setSubmitError('Authentication token not found. Please log in again.');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/orders/journey-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          photo: photoBase64,
          video: videoBase64,
          gpsLat,
          gpsLng,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Submission failed. Please try again.');
        setSubmitting(false);
        return;
      }

      // Success - set verification state
      setExistingVerification(data.verification);
      setEscrowReleaseTime(data.escrowReleaseTime);
      setResubmitMode(false);
      onSubmitted?.();
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [orderId, photoBase64, videoBase64, gpsLat, gpsLng, onSubmitted]);

  // ---- Resubmit handler (for rejected status) ----
  const handleResubmit = useCallback(() => {
    setResubmitMode(true);
    setPhotoFile(null);
    setPhotoBase64(null);
    setPhotoPreview(null);
    setPhotoError(null);
    setVideoFile(null);
    setVideoBase64(null);
    setVideoError(null);
    setGpsLat(null);
    setGpsLng(null);
    setGpsTimestamp(null);
    setGpsError(null);
    setSubmitError(null);
  }, []);

  // ---- Already submitted/verified view ----
  if (!loadingStatus && existingVerification && !resubmitMode) {
    const statusBadgeColor =
      existingVerification.status === 'verified'
        ? 'bg-green-600 text-white'
        : existingVerification.status === 'submitted'
          ? 'bg-orange-500 text-white'
          : existingVerification.status === 'rejected'
            ? 'bg-red-600 text-white'
            : 'bg-gray-500 text-white';

    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">
                Journey Verification Submitted
              </CardTitle>
            </div>
            <Badge
              className={statusBadgeColor}
              variant={getStatusBadgeVariant(existingVerification.status)}
            >
              {getStatusLabel(existingVerification.status)}
            </Badge>
          </div>
          {existingVerification.submittedAt && (
            <CardDescription>
              Submitted on{' '}
              {new Date(existingVerification.submittedAt).toLocaleString()}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* GPS Coordinates */}
          {existingVerification.gpsLat !== null &&
            existingVerification.gpsLng !== null && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <MapPin className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">GPS Location Captured</p>
                  <p className="text-xs text-muted-foreground">
                    Lat: {existingVerification.gpsLat.toFixed(6)}, Lng:{' '}
                    {existingVerification.gpsLng.toFixed(6)}
                  </p>
                  {existingVerification.gpsTimestamp && (
                    <p className="text-xs text-muted-foreground">
                      Captured at:{' '}
                      {new Date(
                        existingVerification.gpsTimestamp
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

          {/* Escrow Release Countdown */}
          {existingVerification.status === 'submitted' && escrowReleaseTime && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <Clock className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  Escrow Release Countdown
                </p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-300 mt-1">
                  {countdown || 'Calculating...'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Payment will be released to seller after 12 hours
                </p>
              </div>
            </div>
          )}

          {/* Verified status */}
          {existingVerification.status === 'verified' && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  Journey Verified
                </p>
                <p className="text-xs text-green-600 dark:text-green-300">
                  Your journey has been verified. Payment has been released to
                  the seller.
                </p>
              </div>
            </div>
          )}

          {/* Rejected status */}
          {existingVerification.status === 'rejected' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Verification Rejected
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300">
                    Your journey verification was rejected. You can resubmit
                    with new evidence.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleResubmit}
                className="w-full h-12 text-base"
                style={{ backgroundColor: '#16a34a' }}
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Resubmit Verification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ---- Loading skeleton ----
  if (loadingStatus) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Loading verification status...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ---- Upload form ----
  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" style={{ color: '#16a34a' }} />
          <CardTitle className="text-lg">Journey Verification</CardTitle>
        </div>
        <CardDescription>
          Upload photo, video, and GPS to verify your journey for this Online
          Copy ticket
        </CardDescription>
        <div className="flex items-center gap-1 mt-1">
          <Badge variant="outline" className="text-xs">
            {ticketType}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {departureDate}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      {/* Progress indicator */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {completedCount}/3 Steps Completed
          </span>
          <span className="text-xs text-muted-foreground">
            {progressPercent}%
          </span>
        </div>
        <Progress
          value={progressPercent}
          className="h-3"
          style={
            {
              '--progress-color': '#16a34a',
            } as React.CSSProperties
          }
        />
        <div className="flex items-center justify-between mt-3 gap-1">
          {STEPS.map((step, idx) => {
            const isComplete = completedSteps[step.key];
            const IconComp = step.icon;
            return (
              <div
                key={step.key}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  isComplete
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isComplete ? (
                  <CheckCircle
                    className="h-3.5 w-3.5"
                    style={{ color: '#16a34a' }}
                  />
                ) : (
                  <IconComp className="h-3.5 w-3.5" />
                )}
                <span>{idx + 1}. {step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <CardContent className="space-y-5 pt-2">
        {/* Step 1: Photo Upload */}
        <div
          className={`rounded-xl border-2 p-4 transition-colors ${
            completedSteps.photo
              ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20'
              : 'border-muted bg-background'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Camera
              className="h-5 w-5 shrink-0"
              style={{ color: completedSteps.photo ? '#16a34a' : '#f97316' }}
            />
            <h3 className="text-sm font-semibold">
              1. Upload Journey Photo
            </h3>
            {completedSteps.photo && (
              <CheckCircle
                className="h-4 w-4 ml-auto"
                style={{ color: '#16a34a' }}
              />
            )}
          </div>

          {photoPreview && (
            <div className="mb-3 relative">
              <img
                src={photoPreview}
                alt="Journey photo preview"
                className="w-full max-h-48 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoBase64(null);
                  setPhotoPreview(null);
                  setPhotoError(null);
                  if (photoInputRef.current) photoInputRef.current.value = '';
                }}
              >
                ×
              </Button>
            </div>
          )}

          {!photoBase64 && (
            <Button
              variant="outline"
              className="w-full h-12 text-base touch-manipulation"
              onClick={() => photoInputRef.current?.click()}
              disabled={convertingPhoto}
            >
              {convertingPhoto ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Select Photo
                </>
              )}
            </Button>
          )}

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {photoError && (
            <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-xs">{photoError}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Take a photo of your journey or transport. Max size: 5MB.
          </p>
        </div>

        {/* Step 2: Video Upload */}
        <div
          className={`rounded-xl border-2 p-4 transition-colors ${
            completedSteps.video
              ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20'
              : 'border-muted bg-background'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Video
              className="h-5 w-5 shrink-0"
              style={{ color: completedSteps.video ? '#16a34a' : '#f97316' }}
            />
            <h3 className="text-sm font-semibold">
              2. Upload Journey Video
            </h3>
            {completedSteps.video && (
              <CheckCircle
                className="h-4 w-4 ml-auto"
                style={{ color: '#16a34a' }}
              />
            )}
          </div>

          {videoFile && videoBase64 && (
            <div className="mb-3 flex items-center gap-2 p-2 rounded-lg bg-muted">
              <Video className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                {videoFile.name}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {formatFileSize(videoFile.size)}
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 w-7 p-0 rounded-full ml-1"
                onClick={() => {
                  setVideoFile(null);
                  setVideoBase64(null);
                  setVideoError(null);
                  if (videoInputRef.current)
                    videoInputRef.current.value = '';
                }}
              >
                ×
              </Button>
            </div>
          )}

          {!videoBase64 && (
            <Button
              variant="outline"
              className="w-full h-12 text-base touch-manipulation"
              onClick={() => videoInputRef.current?.click()}
              disabled={convertingVideo}
            >
              {convertingVideo ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Select Video
                </>
              )}
            </Button>
          )}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoChange}
          />

          {videoError && (
            <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-xs">{videoError}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Upload a short video of your journey (max 30 seconds recommended).
            Max size: 20MB.
          </p>
        </div>

        {/* Step 3: GPS Capture */}
        <div
          className={`rounded-xl border-2 p-4 transition-colors ${
            completedSteps.gps
              ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20'
              : 'border-muted bg-background'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin
              className="h-5 w-5 shrink-0"
              style={{ color: completedSteps.gps ? '#16a34a' : '#f97316' }}
            />
            <h3 className="text-sm font-semibold">
              3. Capture GPS Location
            </h3>
            {completedSteps.gps && (
              <CheckCircle
                className="h-4 w-4 ml-auto"
                style={{ color: '#16a34a' }}
              />
            )}
          </div>

          {gpsLat !== null && gpsLng !== null && (
            <div className="mb-3 p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <CheckCircle
                  className="h-4 w-4 shrink-0"
                  style={{ color: '#16a34a' }}
                />
                <p className="text-sm font-medium">
                  Location Captured Successfully
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Latitude: {gpsLat.toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">
                Longitude: {gpsLng.toFixed(6)}
              </p>
              {gpsTimestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  Captured at: {new Date(gpsTimestamp).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {gpsLat === null && (
            <Button
              className="w-full h-12 text-base touch-manipulation"
              style={{ backgroundColor: '#f97316' }}
              onClick={captureGps}
              disabled={gpsCapturing}
            >
              {gpsCapturing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Capturing GPS...
                </>
              ) : (
                <>
                  <MapPin className="h-5 w-5 mr-2" />
                  Capture My Location
                </>
              )}
            </Button>
          )}

          {gpsError && (
            <div className="flex items-start gap-2 mt-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-xs">{gpsError}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Please enable GPS/Location on your device. This is required for
            verification.
          </p>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">
              {submitError}
            </p>
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="p-6">
        <Button
          className="w-full h-14 text-base font-semibold touch-manipulation"
          style={{ backgroundColor: '#16a34a' }}
          onClick={handleSubmit}
          disabled={
            submitting ||
            convertingPhoto ||
            convertingVideo ||
            gpsLat === null ||
            gpsLng === null
          }
        >
          {submitting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting Verification...
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5 mr-2" />
              Submit Journey Verification
            </>
          )}
        </Button>
      </CardFooter>

      {gpsLat === null && (
        <div className="px-6 pb-4">
          <p className="text-xs text-center text-muted-foreground">
            GPS location capture is required before submission
          </p>
        </div>
      )}
    </Card>
  );
}
