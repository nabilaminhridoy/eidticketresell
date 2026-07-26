/**
 * SMS Service — integrates BulkSMSBD and Alpha SMS (sms.net.bd) gateways.
 * Follows the same singleton/factory pattern as bkash.ts and sslcommerz.ts.
 */

// ─── Types ────────────────────────────────────────────────────────────────

export interface SmsConfig {
  provider: 'bulk_sms_bd' | 'alpha_sms' | 'custom';
  apiKey: string;
  senderId?: string;
  apiUrl?: string;
  enabled: boolean;
}

export interface SendSmsParams {
  to: string | string[];  // Phone number(s) — BD format 01X... or 880...
  message: string;
  schedule?: string;      // Y-m-d H:i:s for scheduled SMS (Alpha SMS only)
}

export interface SmsResponse {
  success: boolean;
  requestId?: string;
  error?: string;
  rawResponse?: string;
}

export interface SmsBalanceResponse {
  balance: string;
  error?: string;
}

export interface SmsReportResponse {
  requestId: string;
  status: string;
  charge: string;
  recipients: { number: string; charge: string; status: string }[];
  error?: string;
}

// ─── BulkSMSBD Gateway ────────────────────────────────────────────────────

const BULK_SMS_BASE_URL = 'https://bulksmsbd.com/api';

async function sendBulkSms(config: SmsConfig, params: SendSmsParams): Promise<SmsResponse> {
  try {
    const numbers = Array.isArray(params.to) ? params.to.join(',') : params.to;
    const url = `${BULK_SMS_BASE_URL}/send_sms`;

    const formData = new FormData();
    formData.append('api_key', config.apiKey);
    formData.append('sender_id', config.senderId || '');
    formData.append('mobile', numbers);
    formData.append('message', params.message);

    const response = await fetch(url, { method: 'POST', body: formData });
    const text = await response.text();

    // BulkSMSBD returns JSON or plain text responses
    try {
      const json = JSON.parse(text);
      if (json.error === 0 || json.response === 'success') {
        return { success: true, requestId: json.request_id?.toString(), rawResponse: text };
      }
      return { success: false, error: json.message || json.error_msg || 'Unknown error', rawResponse: text };
    } catch {
      // Plain text response
      if (text.includes('success') || text.includes('SMS Sent')) {
        return { success: true, rawResponse: text };
      }
      return { success: false, error: text, rawResponse: text };
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return { success: false, error: msg };
  }
}

async function getBulkSmsBalance(config: SmsConfig): Promise<SmsBalanceResponse> {
  try {
    const url = `${BULK_SMS_BASE_URL}/get_balance?api_key=${config.apiKey}`;
    const response = await fetch(url);
    const text = await response.text();

    try {
      const json = JSON.parse(text);
      if (json.error === 0) {
        return { balance: json.balance?.toString() || json.data?.balance?.toString() || '0' };
      }
      return { balance: '0', error: json.message || 'Unknown error' };
    } catch {
      // Plain text: might be a number
      const num = parseFloat(text);
      if (!isNaN(num)) {
        return { balance: num.toFixed(4) };
      }
      return { balance: '0', error: text };
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return { balance: '0', error: msg };
  }
}

// ─── Alpha SMS (sms.net.bd) Gateway ──────────────────────────────────────

const ALPHA_SMS_BASE_URL = 'https://api.sms.net.bd';

async function sendAlphaSms(config: SmsConfig, params: SendSmsParams): Promise<SmsResponse> {
  try {
    const numbers = Array.isArray(params.to) ? params.to.join(',') : params.to;
    const url = `${ALPHA_SMS_BASE_URL}/sendsms`;

    const formData = new FormData();
    formData.append('api_key', config.apiKey);
    formData.append('msg', params.message);
    formData.append('to', numbers);
    if (config.senderId) formData.append('sender_id', config.senderId);
    if (params.schedule) formData.append('schedule', params.schedule);

    const response = await fetch(url, { method: 'POST', body: formData });
    const json = await response.json();

    if (json.error === 0) {
      return {
        success: true,
        requestId: json.data?.request_id?.toString(),
        rawResponse: JSON.stringify(json),
      };
    }
    return {
      success: false,
      error: `Error ${json.error}: ${json.msg || 'Unknown error'}`,
      rawResponse: JSON.stringify(json),
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return { success: false, error: msg };
  }
}

async function getAlphaSmsBalance(config: SmsConfig): Promise<SmsBalanceResponse> {
  try {
    const url = `${ALPHA_SMS_BASE_URL}/user/balance/?api_key=${config.apiKey}`;
    const response = await fetch(url);
    const json = await response.json();

    if (json.error === 0) {
      return { balance: json.data?.balance || '0' };
    }
    return { balance: '0', error: `Error ${json.error}: ${json.msg}` };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return { balance: '0', error: msg };
  }
}

async function getAlphaSmsReport(config: SmsConfig, requestId: string): Promise<SmsReportResponse> {
  try {
    const url = `${ALPHA_SMS_BASE_URL}/report/request/${requestId}/?api_key=${config.apiKey}`;
    const response = await fetch(url);
    const json = await response.json();

    if (json.error === 0) {
      return {
        requestId: json.data?.request_id?.toString() || requestId,
        status: json.data?.request_status || 'Unknown',
        charge: json.data?.request_charge || '0',
        recipients: json.data?.recipients?.map((r: { number: string; charge: string; status: string }) => ({
          number: r.number,
          charge: r.charge,
          status: r.status,
        })) || [],
      };
    }
    return {
      requestId,
      status: 'Error',
      charge: '0',
      recipients: [],
      error: `Error ${json.error}: ${json.msg}`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return { requestId, status: 'Error', charge: '0', recipients: [], error: msg };
  }
}

// ─── SMS Service Class ────────────────────────────────────────────────────

export class SmsService {
  private config: SmsConfig;

  constructor(config: SmsConfig) {
    this.config = config;
  }

  get provider(): string { return this.config.provider; }
  get enabled(): boolean { return this.config.enabled; }

  async send(params: SendSmsParams): Promise<SmsResponse> {
    if (!this.config.enabled) {
      return { success: false, error: 'SMS service is disabled' };
    }
    if (!this.config.apiKey) {
      return { success: false, error: 'SMS API key not configured' };
    }

    switch (this.config.provider) {
      case 'bulk_sms_bd':
        return sendBulkSms(this.config, params);
      case 'alpha_sms':
        return sendAlphaSms(this.config, params);
      case 'custom':
        return this.sendCustom(params);
      default:
        return { success: false, error: `Unknown SMS provider: ${this.config.provider}` };
    }
  }

  async getBalance(): Promise<SmsBalanceResponse> {
    if (!this.config.apiKey) {
      return { balance: '0', error: 'SMS API key not configured' };
    }

    switch (this.config.provider) {
      case 'bulk_sms_bd':
        return getBulkSmsBalance(this.config);
      case 'alpha_sms':
        return getAlphaSmsBalance(this.config);
      default:
        return { balance: '0', error: `Balance check not supported for provider: ${this.config.provider}` };
    }
  }

  async getReport(requestId: string): Promise<SmsReportResponse> {
    if (this.config.provider === 'alpha_sms') {
      return getAlphaSmsReport(this.config, requestId);
    }
    return { requestId, status: 'Unsupported', charge: '0', recipients: [], error: 'Report not supported for this provider' };
  }

  private async sendCustom(params: SendSmsParams): Promise<SmsResponse> {
    try {
      const numbers = Array.isArray(params.to) ? params.to.join(',') : params.to;
      const url = this.config.apiUrl || '';

      if (!url) {
        return { success: false, error: 'Custom SMS API URL not configured' };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.config.apiKey,
          to: numbers,
          message: params.message,
          sender_id: this.config.senderId,
        }),
      });

      const text = await response.text();
      try {
        const json = JSON.parse(text);
        return { success: response.ok, requestId: json.request_id?.toString(), rawResponse: text, error: json.error || json.message };
      } catch {
        return { success: response.ok, rawResponse: text };
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Network error';
      return { success: false, error: msg };
    }
  }
}

// ─── Factory from environment / DB settings ───────────────────────────────

let smsServiceInstance: SmsService | null = null;
let smsConfigCache: SmsConfig | null = null;
let smsConfigCacheExpiry = 0;
const SMS_CONFIG_CACHE_TTL = 60_000; // 1 minute

export function createSmsService(config: SmsConfig): SmsService {
  return new SmsService(config);
}

/** Create SMS service from DB settings (with 1-minute cache) */
export async function getSmsServiceFromDb(): Promise<SmsService> {
  const now = Date.now();
  if (smsServiceInstance && smsConfigCache && now < smsConfigCacheExpiry) {
    return smsServiceInstance;
  }

  const settings = await getSmsSettingsFromDb();
  const config: SmsConfig = {
    provider: (settings['sms_provider'] as SmsConfig['provider']) || 'alpha_sms',
    apiKey: settings['sms_api_key'] || '',
    senderId: settings['sms_sender_id'] || '',
    apiUrl: settings['sms_api_url'] || '',
    enabled: settings['sms_enabled'] === 'true',
  };

  smsConfigCache = config;
  smsConfigCacheExpiry = now + SMS_CONFIG_CACHE_TTL;
  smsServiceInstance = new SmsService(config);
  return smsServiceInstance;
}

/** Read SMS settings from DB */
async function getSmsSettingsFromDb(): Promise<Record<string, string>> {
  try {
    const { db } = await import('@/lib/db');
    const settings = await db.setting.findMany({ where: { group: 'sms' } });
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  } catch {
    return {};
  }
}

export function clearSmsConfigCache() {
  smsConfigCache = null;
  smsConfigCacheExpiry = 0;
  smsServiceInstance = null;
}
