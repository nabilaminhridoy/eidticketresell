import { NextResponse } from 'next/server';
import { createSSLCommerz, SSLCommerzError } from '@/lib/sslcommerz';

// In-memory cache for Google Pay config (3 requests/day limit)
let gpayConfigCache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  try {
    // Check if we have a valid cached response
    if (gpayConfigCache && (Date.now() - gpayConfigCache.timestamp) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        cached: true,
        cachedAt: new Date(gpayConfigCache.timestamp).toISOString(),
        ...gpayConfigCache.data,
      });
    }

    const sslcz = createSSLCommerz(
      process.env.SSLCOMMERZ_STORE_ID!,
      process.env.SSLCOMMERZ_STORE_PASSWORD!,
      process.env.SSLCOMMERZ_IS_SANDBOX === 'true'
    );

    const result = await sslcz.getGooglePayConfig();

    if (result.status !== 'SUCCESS' && result.status !== '200') {
      return NextResponse.json(
        { error: result.error || result.reason || result.message || 'Google Pay config retrieval failed', details: result },
        { status: 400 }
      );
    }

    // Cache the successful response
    const configData = {
      apiVersion: '2',
      apiVersionMinor: '0',
      gatewayMerchantId: result.gateway_merchant_id || process.env.SSLCOMMERZ_STORE_ID!,
      gateway: result.gateway || 'sslcommerz',
      merchantId: result.google_merchant_id || result.merchant_id || '',
      merchantName: result.google_merchant_name || result.merchant_name || '',
      allowedAuthMethods: result.allowed_card_auth_methods || ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: result.allowed_card_networks || ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'],
      environment: result.environment || (process.env.SSLCOMMERZ_IS_SANDBOX === 'true' ? 'TEST' : 'PRODUCTION'),
      totalAmount: result.total_amount,
      currency: result.currency,
      countryCode: result.country_code || 'BD',
    };

    gpayConfigCache = {
      data: configData,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      success: true,
      cached: false,
      ...configData,
    });
  } catch (error) {
    if (error instanceof SSLCommerzError) {
      return NextResponse.json(
        { error: error.message, statusCode: error.statusCode, apiResponse: error.apiResponse },
        { status: error.statusCode || 500 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
