'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ScanLine,
  ClipboardPaste,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface OrderQrScannerProps {
  orderId: string;
  isQrScanned: boolean;
  deliveryStatus: string;
  onVerified?: () => void;
}

export default function OrderQrScanner({
  orderId,
  isQrScanned,
  deliveryStatus,
  onVerified,
}: OrderQrScannerProps) {
  const [qrInput, setQrInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQrInput(text);
      setError(null);
    } catch {
      setError('Failed to read clipboard. Please paste manually.');
    }
  }, []);

  const handleVerify = useCallback(async () => {
    if (!qrInput.trim()) {
      setError('Please enter or paste the QR code data.');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const token = localStorage.getItem('etr_token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setVerifying(false);
        return;
      }

      const res = await fetch('/api/orders/qr-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrData: qrInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed. Please check the QR code data.');
        setVerifying(false);
        return;
      }

      setVerified(true);
      onVerified?.();
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setVerifying(false);
    }
  }, [qrInput, onVerified]);

  // Already confirmed state
  if (isQrScanned || deliveryStatus === 'confirmed') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="size-5 text-[#16a34a]" />
            Delivery Confirmed
          </CardTitle>
          <CardDescription>Order #{orderId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="bg-[#16a34a]/10 rounded-full p-4">
              <CheckCircle className="size-10 text-[#16a34a]" />
            </div>
            <p className="font-medium text-[#16a34a]">
              Delivery already confirmed
            </p>
            <p className="text-sm text-muted-foreground">
              The QR code for this order has been successfully scanned and verified. No further action needed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Just verified successfully
  if (verified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="size-5 text-[#16a34a]" />
            Verification Successful!
          </CardTitle>
          <CardDescription>Order #{orderId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="bg-[#16a34a]/10 rounded-full p-4">
              <CheckCircle className="size-10 text-[#16a34a]" />
            </div>
            <p className="font-semibold text-[#16a34a]">
              QR Code Verified Successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              Delivery has been confirmed. The seller will be notified and payment will be processed accordingly.
            </p>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 mt-2">
              Delivery Confirmed
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main scanning/input form
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScanLine className="size-5 text-[#f97316]" />
          Verify Delivery
        </CardTitle>
        <CardDescription>
          Enter or paste the QR code data from the seller to confirm delivery for order #{orderId}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* QR Format Hint */}
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Expected format:
          </p>
          <code className="text-xs bg-background px-2 py-1 rounded border border-border block">
            ETR-VERIFY:&#123;ticketId&#125;:&#123;orderId&#125;
          </code>
        </div>

        <Separator />

        {/* Input Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="qr-input">
            QR Code Data
          </label>
          <div className="flex gap-2">
            <Input
              id="qr-input"
              type="text"
              placeholder="ETR-VERIFY:xxx:xxx"
              value={qrInput}
              onChange={(e) => {
                setQrInput(e.target.value);
                setError(null);
              }}
              className="flex-1"
              disabled={verifying}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={pasteFromClipboard}
              disabled={verifying}
              aria-label="Paste from clipboard"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="size-4" />
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="size-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Status */}
        {deliveryStatus === 'pending' && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Awaiting Verification
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          onClick={handleVerify}
          disabled={verifying || !qrInput.trim()}
          className="w-full bg-[#16a34a] hover:bg-[#16a34a]/90 text-white"
          size="default"
        >
          {verifying ? (
            <>
              <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle className="size-4" />
              Verify & Confirm Delivery
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          By verifying, you confirm that you have received the ticket from the seller.
        </p>
      </CardFooter>
    </Card>
  );
}
