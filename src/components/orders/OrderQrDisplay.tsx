'use client';

import { useEffect, useState, useCallback } from 'react';
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
import {
  QrCode,
  Download,
  CheckCircle,
  Clock,
  Package,
  MapPin,
  Truck,
} from 'lucide-react';

interface OrderQrDisplayProps {
  orderId: string;
  deliveryMethod: string;
  ticketType: string;
  isQrScanned: boolean;
  deliveryStatus: string;
}

// Delivery instructions based on method
const DELIVERY_INSTRUCTIONS: Record<string, { icon: React.ElementType; text: string; label: string }> = {
  in_person: {
    icon: MapPin,
    label: 'In Person',
    text: 'Show this QR code to the buyer when you meet. They will scan it to confirm delivery.',
  },
  courier: {
    icon: Truck,
    label: 'Courier',
    text: 'Download this QR code and include it with the ticket in the courier package. The buyer will scan it upon receipt.',
  },
  online_pdf: {
    icon: Package,
    label: 'Online Copy',
    text: 'No QR code needed for Online Copy. Escrow will release after journey verification.',
  },
};

// Status config
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
  scanned: { label: 'Scanned', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
};

export default function OrderQrDisplay({
  orderId,
  deliveryMethod,
  ticketType,
  isQrScanned,
  deliveryStatus,
}: OrderQrDisplayProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrDataStr, setQrDataStr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shouldShowQr =
    ticketType === 'counter_copy' &&
    (deliveryMethod === 'in_person' || deliveryMethod === 'courier');

  const fetchQr = useCallback(async () => {
    if (!shouldShowQr) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('etr_token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/orders/qr-verify?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch QR code');
        setLoading(false);
        return;
      }
      setQrImage(data.qrImageBase64);
      setQrDataStr(data.qrData);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [orderId, shouldShowQr]);

  useEffect(() => {
    fetchQr();
  }, [fetchQr]);

  const downloadQr = useCallback(() => {
    if (!qrImage) return;
    // Convert data URL to blob for download
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qr-order-${orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [qrImage, orderId]);

  const deliveryInfo = DELIVERY_INSTRUCTIONS[deliveryMethod] || DELIVERY_INSTRUCTIONS.in_person;
  const statusInfo = STATUS_CONFIG[deliveryStatus] || STATUS_CONFIG.pending;
  const StatusIcon = isQrScanned ? CheckCircle : statusInfo.icon;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="size-5 text-[#16a34a]" />
          Delivery QR Code
        </CardTitle>
        <CardDescription>
          Order #{orderId}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Delivery Method & Instructions */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <deliveryInfo.icon className="size-5 mt-0.5 text-[#f97316]" />
          <div>
            <p className="font-medium text-sm">{deliveryInfo.label} Delivery</p>
            <p className="text-sm text-muted-foreground mt-1">{deliveryInfo.text}</p>
          </div>
        </div>

        <Separator />

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <StatusIcon className="size-4" />
          <Badge variant="outline" className={statusInfo.color}>
            {isQrScanned ? 'Confirmed' : statusInfo.label}
          </Badge>
          {isQrScanned && (
            <span className="text-sm text-[#16a34a] font-medium">
              QR has been scanned
            </span>
          )}
        </div>

        <Separator />

        {/* QR Code Display or Placeholder */}
        {shouldShowQr ? (
          <div className="flex flex-col items-center gap-3">
            {loading && (
              <div className="flex flex-col items-center gap-2 py-8">
                <div className="size-8 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading QR code...</p>
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <QrCode className="size-8 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchQr}>
                  Retry
                </Button>
              </div>
            )}

            {!loading && !error && qrImage && (
              <div className="relative">
                {isQrScanned ? (
                  <div className="relative">
                    <img
                      src={qrImage}
                      alt={`QR code for order ${orderId}`}
                      className="w-64 h-64 object-contain rounded-lg opacity-50 mx-auto"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-[#16a34a] rounded-full p-3 shadow-lg">
                        <CheckCircle className="size-8 text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={qrImage}
                    alt={`QR code for order ${orderId}`}
                    className="w-64 h-64 object-contain rounded-lg mx-auto border border-border"
                  />
                )}
              </div>
            )}

            {!loading && !error && !qrImage && !isQrScanned && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <QrCode className="size-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  QR code will be generated once ready.
                </p>
              </div>
            )}

            {/* QR Data String (for reference) */}
            {!loading && !error && qrDataStr && !isQrScanned && (
              <div className="w-full">
                <p className="text-xs text-muted-foreground text-center mb-1">
                  QR Data Reference:
                </p>
                <code className="block text-xs bg-muted px-3 py-2 rounded-md text-center break-all">
                  {qrDataStr}
                </code>
              </div>
            )}
          </div>
        ) : (
          /* No QR needed - online_pdf */
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Package className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">
              No QR code required
            </p>
            <p className="text-xs text-muted-foreground">
              For Online Copy tickets, escrow is released automatically after journey verification.
            </p>
          </div>
        )}
      </CardContent>

      {/* Download Button */}
      {shouldShowQr && !isQrScanned && qrImage && (
        <CardFooter className="flex-col gap-2">
          <Button
            onClick={downloadQr}
            className="w-full bg-[#16a34a] hover:bg-[#16a34a]/90 text-white"
            size="default"
          >
            <Download className="size-4" />
            Download QR Code
          </Button>
          {deliveryMethod === 'courier' && (
            <p className="text-xs text-muted-foreground text-center">
              Print and include this QR in the courier package with the ticket.
            </p>
          )}
        </CardFooter>
      )}

      {/* Already Scanned Footer */}
      {shouldShowQr && isQrScanned && (
        <CardFooter>
          <div className="w-full flex items-center justify-center gap-2 py-2 bg-[#16a34a]/10 rounded-lg">
            <CheckCircle className="size-5 text-[#16a34a]" />
            <span className="text-sm font-medium text-[#16a34a]">
              Delivery confirmed — QR code has been scanned by buyer
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
