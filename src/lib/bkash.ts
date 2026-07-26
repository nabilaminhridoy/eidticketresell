// ============================================================================
// bKash Tokenized Checkout v1.2.0-beta Payment Gateway Service
// ============================================================================
//
// This service wraps all bKash Tokenized Checkout APIs including:
// - Token management (Grant & Refresh)
// - Agreement operations (Create, Execute, Status, Cancel)
// - Payment operations (Create, Execute, Status, Confirm/Capture)
// - Search Transaction
// - Refund
// - Disbursement (Org Balance, Intra Transfer, B2C, B2B Payout)
//
// Base URLs:
//   Sandbox:    https://tokenized.sandbox.bka.sh/v1.2.0-beta
//   Production: https://tokenized.pay.bka.sh/v1.2.0-beta
//
// Disbursement Base URLs (different pattern):
//   Sandbox:    https://checkout.sandbox.bka.sh/v1.2.0-beta
//   Production: https://checkout.pay.bka.sh/v1.2.0-beta
// ============================================================================

// ============================================================================
// Configuration Interface
// ============================================================================

export interface BkashConfig {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  isSandbox?: boolean;
}

// ============================================================================
// Token Management Types
// ============================================================================

export interface GrantTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  statusCode: string;
  statusMessage?: string;
}

export interface RefreshTokenResponse {
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  statusCode: string;
  statusMessage?: string;
}

// ============================================================================
// Agreement Types
// ============================================================================

export interface CreateAgreementParams {
  mode: '0000';
  payerReference: string;
  callbackURL: string;
  amount?: string;
  currency?: string;
  intent?: string;
  merchantInvoiceNumber?: string;
}

export interface CreateAgreementResponse {
  paymentID: string;
  bkashURL: string;
  statusCode: string;
  statusMessage: string;
}

export interface ExecuteAgreementParams {
  paymentID: string;
}

export interface ExecuteAgreementResponse {
  agreementID: string;
  paymentID: string;
  trxId: string;
  statusCode: string;
  statusMessage: string;
}

export interface AgreementStatusParams {
  agreementID: string;
}

export interface AgreementStatusResponse {
  agreementStatus: string;
  agreementID: string;
  payerReference: string;
  statusCode: string;
  statusMessage?: string;
}

export interface CancelAgreementParams {
  agreementID: string;
}

export interface CancelAgreementResponse {
  agreementID: string;
  statusCode: string;
  statusMessage: string;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface CreatePaymentParams {
  mode: '0001';
  payerReference: string;
  agreementID: string;
  callbackURL: string;
  amount: string;
  currency?: string;
  intent?: string;
  merchantInvoiceNumber?: string;
  merchantAssociationInfo?: string;
}

export interface CreatePaymentResponse {
  paymentID: string;
  bkashURL: string;
  statusCode: string;
  statusMessage: string;
}

export interface ExecutePaymentParams {
  paymentID: string;
}

export interface ExecutePaymentResponse {
  trxId: string;
  paymentID: string;
  amount: string;
  statusCode: string;
  statusMessage: string;
}

export interface PaymentStatusParams {
  paymentID: string;
}

export interface PaymentStatusResponse {
  paymentID: string;
  trxId: string;
  amount: string;
  statusCode: string;
  statusMessage: string;
  payerReference?: string;
}

export interface ConfirmPaymentParams {
  paymentID: string;
}

export interface ConfirmPaymentResponse {
  trxId: string;
  paymentID: string;
  amount: string;
  statusCode: string;
  statusMessage: string;
}

// ============================================================================
// Search Transaction Types
// ============================================================================

export interface SearchTransactionParams {
  trxID: string;
}

export interface SearchTransactionResponse {
  trxId: string;
  amount: string;
  currency: string;
  trxDate: string;
  statusCode: string;
  statusMessage?: string;
  payerReference?: string;
  merchantInvoiceNumber?: string;
  // Additional fields may be present
  [key: string]: unknown;
}

// ============================================================================
// Refund Types
// ============================================================================

export interface RefundParams {
  paymentId: string;
  trxId: string;
  refundAmount: string;
  sku?: string;
  reason?: string;
}

export interface RefundResponse {
  originalTrxId: string;
  refundTrxId: string;
  refundTransactionStatus: string;
  refundAmount: string;
  statusCode?: string;
  statusMessage?: string;
}

// ============================================================================
// Disbursement Types
// ============================================================================

export interface OrgBalanceResponse {
  collectionBalance: string;
  disbursementBalance: string;
  statusCode: string;
  statusMessage?: string;
}

export interface IntraAccountTransferParams {
  amount: string;
  currency?: string;
  transferType: 'collection2disbursement' | 'disbursement2collection';
}

export interface IntraAccountTransferResponse {
  trxId: string;
  amount: string;
  statusCode: string;
  statusMessage?: string;
}

export interface B2CPayoutParams {
  amount: string;
  pin: string;
  receiver: string;
  currency?: string;
}

export interface B2CPayoutResponse {
  trxId: string;
  amount: string;
  completedAt: string;
  statusCode: string;
  statusMessage?: string;
}

export interface B2BPayoutInitiateParams {
  amount: string;
  currency?: string;
  receiver: string;
  receiverType?: string;
  ref?: string;
  pin?: string;
}

export interface B2BPayoutInitiateResponse {
  payoutID: string;
  statusCode: string;
  statusMessage?: string;
}

export interface B2BPayoutExecuteParams {
  payoutID: string;
  pin: string;
}

export interface B2BPayoutExecuteResponse {
  trxId: string;
  amount: string;
  completedAt: string;
  statusCode: string;
  statusMessage?: string;
}

// ============================================================================
// Common / Shared Types
// ============================================================================

/**
 * Generic bKash API error response structure
 */
export interface BkashApiError {
  statusCode: string;
  statusMessage: string;
  [key: string]: unknown;
}

// ============================================================================
// Error Code Mapping
// ============================================================================

/**
 * Known bKash error codes and their descriptions
 */
export const BKASH_ERROR_CODES: Record<string, string> = {
  '2001': 'Invalid App Key',
  '2002': 'Invalid App Secret',
  '2003': 'Invalid User Name or Password',
  '2004': 'User is not active',
  '2005': 'Insufficient Balance',
  '2006': 'Invalid Payment ID',
  '2007': 'Duplicate Invoice Number',
  '2008': 'Invalid Amount',
  '2009': 'Invalid Payer Reference',
  '2010': 'Invalid Agreement ID',
  '2011': 'Payment is already completed',
  '2012': 'Payment is already cancelled',
  '2013': 'Payment is expired',
  '2014': 'Invalid Token',
  '2015': 'Token is expired',
  '2016': 'Token refresh limit exceeded',
  '2017': 'Invalid Callback URL',
  '2018': 'Invalid Currency',
  '2019': 'Invalid Intent',
  '2020': 'Invalid Mode',
  '2021': 'Agreement is not active',
  '2022': 'Agreement is already cancelled',
  '2023': 'Merchant is not active',
  '2024': 'Invalid Merchant Association Info',
  '2025': 'Transaction not found',
  '2026': 'Refund amount exceeds original amount',
  '2027': 'Refund limit exceeded',
  '2028': 'Invalid refund request',
  '2029': 'Disbursement failed',
  '2030': 'B2C Payment failed',
  '2031': 'Payout failed',
  '2032': 'Invalid PIN',
  '2033': 'Receiver mobile number is invalid',
  '2034': 'Transfer type is invalid',
  '2035': 'Organization balance query limit exceeded',
  '2036': 'Intra-account transfer failed',
  '2037': 'Amount is too low',
  '2038': 'Amount is too high',
  '2039': 'Merchant account is suspended',
  '2040': 'Network error',
  '2041': 'Internal server error',
  '2042': 'Timeout',
  '2043': 'Payment creation failed',
  '2044': 'Agreement creation failed',
  '2045': 'Payment execution failed',
  '2046': 'Agreement execution failed',
  '2047': 'Payment confirmation failed',
  '2048': 'Payment cancellation failed',
  '2049': 'Refund processing failed',
  '2050': 'Search transaction failed',
  '2051': 'Invalid merchant invoice number',
  '2052': 'Payout ID not found',
  '2053': 'Payout execution failed',
};

// ============================================================================
// Error Class
// ============================================================================

export class BkashError extends Error {
  public statusCode?: string;
  public bkashErrorCode?: string;
  public apiResponse?: BkashApiError;

  constructor(
    message: string,
    statusCode?: string,
    bkashErrorCode?: string,
    apiResponse?: BkashApiError
  ) {
    super(message);
    this.name = 'BkashError';
    this.statusCode = statusCode;
    this.bkashErrorCode = bkashErrorCode;
    this.apiResponse = apiResponse;
  }

  /**
   * Get a human-readable description for the bKash error code
   */
  getErrorDescription(): string {
    if (this.bkashErrorCode && BKASH_ERROR_CODES[this.bkashErrorCode]) {
      return BKASH_ERROR_CODES[this.bkashErrorCode];
    }
    return this.message;
  }
}

// ============================================================================
// Token Cache (In-Memory)
// ============================================================================

interface TokenCacheEntry {
  idToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in ms
  refreshCount: number; // Track refreshes per hour
  refreshWindowStart: number; // Start of current 1-hour refresh window
}

// ============================================================================
// bKash Payment Gateway Service Class
// ============================================================================

export class BkashService {
  private appKey: string;
  private appSecret: string;
  private username: string;
  private password: string;
  private isSandbox: boolean;

  // Base URLs
  private baseUrl: string;
  private disbursementBaseUrl: string;

  // Token cache
  private tokenCache: TokenCacheEntry | null = null;

  // Token refresh timing constants
  private readonly TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
  private readonly MAX_REFRESH_PER_HOUR = 2;

  constructor(config: BkashConfig) {
    this.appKey = config.appKey;
    this.appSecret = config.appSecret;
    this.username = config.username;
    this.password = config.password;
    this.isSandbox = config.isSandbox ?? true;

    if (this.isSandbox) {
      this.baseUrl = 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
      this.disbursementBaseUrl = 'https://checkout.sandbox.bka.sh/v1.2.0-beta';
    } else {
      this.baseUrl = 'https://tokenized.pay.bka.sh/v1.2.0-beta';
      this.disbursementBaseUrl = 'https://checkout.pay.bka.sh/v1.2.0-beta';
    }
  }

  // ========================================================================
  // INTERNAL: Token Management
  // ========================================================================

  /**
   * Get a valid id_token, automatically refreshing or granting as needed.
   * This method handles all token lifecycle management:
   * - Returns cached token if still valid (with margin)
   * - Refreshes token if expired but within refresh limits
   * - Grants a new token if refresh is not possible
   */
  async getToken(): Promise<string> {
    // If we have a cached token that's still valid (with margin), use it
    if (this.tokenCache && !this.isTokenExpired()) {
      return this.tokenCache.idToken;
    }

    // If we have a cached token but it's expired, try to refresh
    if (this.tokenCache) {
      const canRefresh = this.canRefreshToken();
      if (canRefresh) {
        try {
          await this.refreshToken();
          return this.tokenCache!.idToken;
        } catch {
          // Refresh failed, fall through to grant new token
          this.tokenCache = null;
        }
      } else {
        // Refresh limit exceeded, need to grant a new token
        this.tokenCache = null;
      }
    }

    // Grant a new token
    await this.grantToken();
    return this.tokenCache!.idToken;
  }

  /**
   * Check if the cached token is expired (with margin)
   */
  private isTokenExpired(): boolean {
    if (!this.tokenCache) return true;
    const now = Date.now();
    return now >= (this.tokenCache.expiresAt - this.TOKEN_REFRESH_MARGIN_MS);
  }

  /**
   * Check if we can still refresh the token (max 2 per hour)
   */
  private canRefreshToken(): boolean {
    if (!this.tokenCache) return false;
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;

    // If we're outside the current refresh window, reset the count
    if (now - this.tokenCache.refreshWindowStart > hourMs) {
      this.tokenCache.refreshCount = 0;
      this.tokenCache.refreshWindowStart = now;
    }

    return this.tokenCache.refreshCount < this.MAX_REFRESH_PER_HOUR;
  }

  /**
   * Grant a new token from bKash
   * POST /tokenized/checkout/token/grant
   */
  async grantToken(): Promise<GrantTokenResponse> {
    const url = `${this.baseUrl}/tokenized/checkout/token/grant`;

    const body = {
      app_key: this.appKey,
      app_secret: this.appSecret,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          username: this.username,
          password: this.password,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new BkashError(
          `Grant token request failed with HTTP status ${response.status}`,
          String(response.status)
        );
      }

      const data: GrantTokenResponse = await response.json();

      if (data.statusCode && data.statusCode !== '0000') {
        const errorMsg = BKASH_ERROR_CODES[data.statusCode] || data.statusMessage || 'Unknown error';
        throw new BkashError(
          `Grant token failed: ${errorMsg} (code: ${data.statusCode})`,
          data.statusCode,
          data.statusCode,
          data as unknown as BkashApiError
        );
      }

      // Cache the token
      this.tokenCache = {
        idToken: data.id_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        refreshCount: 0,
        refreshWindowStart: Date.now(),
      };

      return data;
    } catch (error) {
      if (error instanceof BkashError) throw error;
      throw new BkashError(
        `Grant token request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Refresh the existing token
   * POST /tokenized/checkout/token/refresh
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    if (!this.tokenCache) {
      throw new BkashError('No token to refresh. Grant a token first.');
    }

    const url = `${this.baseUrl}/tokenized/checkout/token/refresh`;

    const body = {
      app_key: this.appKey,
      app_secret: this.appSecret,
      refresh_token: this.tokenCache.refreshToken,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          username: this.username,
          password: this.password,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new BkashError(
          `Refresh token request failed with HTTP status ${response.status}`,
          String(response.status)
        );
      }

      const data: RefreshTokenResponse = await response.json();

      if (data.statusCode && data.statusCode !== '0000') {
        const errorMsg = BKASH_ERROR_CODES[data.statusCode] || data.statusMessage || 'Unknown error';
        throw new BkashError(
          `Refresh token failed: ${errorMsg} (code: ${data.statusCode})`,
          data.statusCode,
          data.statusCode,
          data as unknown as BkashApiError
        );
      }

      // Update the cache
      this.tokenCache = {
        idToken: data.id_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        refreshCount: this.tokenCache.refreshCount + 1,
        refreshWindowStart: this.tokenCache.refreshWindowStart,
      };

      return data;
    } catch (error) {
      if (error instanceof BkashError) throw error;
      throw new BkashError(
        `Refresh token request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ========================================================================
  // INTERNAL: API Request Helper
  // ========================================================================

  /**
   * Make an authenticated API request to bKash
   * Automatically retrieves a valid token and includes required headers
   */
  private async makeRequest<T>(
    endpoint: string,
    body: Record<string, unknown>,
    options?: { baseUrl?: string; method?: string }
  ): Promise<T> {
    const idToken = await this.getToken();
    const base = options?.baseUrl || this.baseUrl;
    const method = options?.method || 'POST';
    const url = `${base}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: idToken,
          'X-APP-Key': this.appKey,
        },
        body: method === 'GET' ? undefined : JSON.stringify(body),
      });

      if (!response.ok) {
        throw new BkashError(
          `bKash API request to ${endpoint} failed with HTTP status ${response.status}`,
          String(response.status)
        );
      }

      const data: T & { statusCode?: string; statusMessage?: string } = await response.json();

      // Check for bKash-specific error codes
      if (data.statusCode && data.statusCode !== '0000') {
        const errorMsg = BKASH_ERROR_CODES[data.statusCode] || data.statusMessage || 'Unknown error';
        throw new BkashError(
          `bKash API call ${endpoint} failed: ${errorMsg} (code: ${data.statusCode})`,
          data.statusCode,
          data.statusCode,
          data as unknown as BkashApiError
        );
      }

      return data;
    } catch (error) {
      if (error instanceof BkashError) throw error;
      throw new BkashError(
        `bKash API request to ${endpoint} failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ========================================================================
  // 1. AGREEMENT API
  // ========================================================================

  /**
   * Create an agreement for tokenized checkout
   * POST /tokenized/checkout/create
   * mode: "0000"
   *
   * This is the first step to establish a tokenized agreement with a customer.
   * Returns a paymentID and bkashURL for the customer to authorize the agreement.
   */
  async createAgreement(params: CreateAgreementParams): Promise<CreateAgreementResponse> {
    const body: Record<string, unknown> = {
      mode: params.mode || '0000',
      payerReference: params.payerReference,
      callbackURL: params.callbackURL,
      amount: params.amount || '1',
      currency: params.currency || 'BDT',
      intent: params.intent || 'Sale',
    };

    if (params.merchantInvoiceNumber) {
      body.merchantInvoiceNumber = params.merchantInvoiceNumber;
    }

    return this.makeRequest<CreateAgreementResponse>(
      '/tokenized/checkout/create',
      body
    );
  }

  /**
   * Execute an agreement after customer authorization
   * POST /tokenized/checkout/execute
   *
   * Called after the customer completes the agreement flow at the bkashURL.
   * Returns the agreementID to be used for future payments.
   */
  async executeAgreement(params: ExecuteAgreementParams): Promise<ExecuteAgreementResponse> {
    return this.makeRequest<ExecuteAgreementResponse>(
      '/tokenized/checkout/execute',
      { paymentID: params.paymentID }
    );
  }

  /**
   * Query the status of an agreement
   * POST /tokenized/checkout/agreement/status
   */
  async queryAgreementStatus(params: AgreementStatusParams): Promise<AgreementStatusResponse> {
    return this.makeRequest<AgreementStatusResponse>(
      '/tokenized/checkout/agreement/status',
      { agreementID: params.agreementID }
    );
  }

  /**
   * Cancel an existing agreement
   * POST /tokenized/checkout/agreement/cancel
   */
  async cancelAgreement(params: CancelAgreementParams): Promise<CancelAgreementResponse> {
    return this.makeRequest<CancelAgreementResponse>(
      '/tokenized/checkout/agreement/cancel',
      { agreementID: params.agreementID }
    );
  }

  // ========================================================================
  // 2. PAYMENT API
  // ========================================================================

  /**
   * Create a payment using a tokenized agreement
   * POST /tokenized/checkout/create
   * mode: "0001"
   *
   * This initiates a payment using an existing agreementID.
   * Returns a paymentID and bkashURL for the customer to complete the payment.
   */
  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResponse> {
    const body: Record<string, unknown> = {
      mode: params.mode || '0001',
      payerReference: params.payerReference,
      agreementID: params.agreementID,
      callbackURL: params.callbackURL,
      amount: params.amount,
      currency: params.currency || 'BDT',
      intent: params.intent || 'Sale',
    };

    if (params.merchantInvoiceNumber) {
      body.merchantInvoiceNumber = params.merchantInvoiceNumber;
    }

    if (params.merchantAssociationInfo) {
      body.merchantAssociationInfo = params.merchantAssociationInfo;
    }

    return this.makeRequest<CreatePaymentResponse>(
      '/tokenized/checkout/create',
      body
    );
  }

  /**
   * Execute a payment after customer authorization
   * POST /tokenized/checkout/execute
   *
   * Called after the customer completes the payment flow at the bkashURL.
   * Returns the trxId and payment details.
   */
  async executePayment(params: ExecutePaymentParams): Promise<ExecutePaymentResponse> {
    return this.makeRequest<ExecutePaymentResponse>(
      '/tokenized/checkout/execute',
      { paymentID: params.paymentID }
    );
  }

  /**
   * Query the status of a payment
   * POST /tokenized/checkout/payment/status
   */
  async queryPaymentStatus(params: PaymentStatusParams): Promise<PaymentStatusResponse> {
    return this.makeRequest<PaymentStatusResponse>(
      '/tokenized/checkout/payment/status',
      { paymentID: params.paymentID }
    );
  }

  /**
   * Confirm/Capture a payment created with intent "Authorize"
   * POST /tokenized/checkout/payment/confirm
   *
   * For payments created with intent "Authorize" (not "Sale"),
   * this confirms and captures the authorized amount.
   */
  async confirmPayment(params: ConfirmPaymentParams): Promise<ConfirmPaymentResponse> {
    return this.makeRequest<ConfirmPaymentResponse>(
      '/tokenized/checkout/payment/confirm',
      { paymentID: params.paymentID }
    );
  }

  // ========================================================================
  // 3. SEARCH TRANSACTION
  // ========================================================================

  /**
   * Search for a transaction by trxID
   * POST /tokenized/checkout/general/searchTransaction
   */
  async searchTransaction(params: SearchTransactionParams): Promise<SearchTransactionResponse> {
    return this.makeRequest<SearchTransactionResponse>(
      '/tokenized/checkout/general/searchTransaction',
      { trxID: params.trxID }
    );
  }

  // ========================================================================
  // 4. REFUND
  // ========================================================================

  /**
   * Initiate a refund for a payment
   * POST /v2/tokenized-checkout/refund/payment/transaction
   *
   * Can refund partially, up to 10 times per payment.
   */
  async refund(params: RefundParams): Promise<RefundResponse> {
    const body: Record<string, unknown> = {
      paymentId: params.paymentId,
      trxId: params.trxId,
      refundAmount: params.refundAmount,
    };

    if (params.sku) {
      body.sku = params.sku;
    }

    if (params.reason) {
      body.reason = params.reason;
    }

    return this.makeRequest<RefundResponse>(
      '/v2/tokenized-checkout/refund/payment/transaction',
      body
    );
  }

  // ========================================================================
  // 5. DISBURSEMENT API
  // ========================================================================

  /**
   * Query organization balance
   * GET /checkout/payment/organizationBalance
   *
   * Note: 1 minute interval required for consecutive calls.
   */
  async queryOrganizationBalance(): Promise<OrgBalanceResponse> {
    return this.makeRequest<OrgBalanceResponse>(
      '/checkout/payment/organizationBalance',
      {},
      { baseUrl: this.disbursementBaseUrl, method: 'GET' }
    );
  }

  /**
   * Transfer between collection and disbursement accounts
   * POST /checkout/payment/intraAccountTransfer
   */
  async intraAccountTransfer(params: IntraAccountTransferParams): Promise<IntraAccountTransferResponse> {
    const body: Record<string, unknown> = {
      amount: params.amount,
      currency: params.currency || 'BDT',
      transferType: params.transferType,
    };

    return this.makeRequest<IntraAccountTransferResponse>(
      '/checkout/payment/intraAccountTransfer',
      body,
      { baseUrl: this.disbursementBaseUrl }
    );
  }

  /**
   * B2C (Business-to-Consumer) payout
   * POST /checkout/payment/b2cPayment
   *
   * Sends money from merchant account to a customer mobile number.
   */
  async b2cPayout(params: B2CPayoutParams): Promise<B2CPayoutResponse> {
    const body: Record<string, unknown> = {
      amount: params.amount,
      pin: params.pin,
      receiver: params.receiver,
      currency: params.currency || 'BDT',
    };

    return this.makeRequest<B2CPayoutResponse>(
      '/checkout/payment/b2cPayment',
      body,
      { baseUrl: this.disbursementBaseUrl }
    );
  }

  /**
   * B2B Payout - Initiate
   * Creates a payoutID for B2B disbursement
   */
  async initiateB2BPayout(params: B2BPayoutInitiateParams): Promise<B2BPayoutInitiateResponse> {
    const body: Record<string, unknown> = {
      amount: params.amount,
      currency: params.currency || 'BDT',
      receiver: params.receiver,
    };

    if (params.receiverType) {
      body.receiverType = params.receiverType;
    }
    if (params.ref) {
      body.ref = params.ref;
    }

    return this.makeRequest<B2BPayoutInitiateResponse>(
      '/checkout/payment/b2bPayment/create',
      body,
      { baseUrl: this.disbursementBaseUrl }
    );
  }

  /**
   * B2B Payout - Execute
   * Execute a previously initiated B2B payout using the payoutID
   */
  async executeB2BPayout(params: B2BPayoutExecuteParams): Promise<B2BPayoutExecuteResponse> {
    const body: Record<string, unknown> = {
      payoutID: params.payoutID,
      pin: params.pin,
    };

    return this.makeRequest<B2BPayoutExecuteResponse>(
      '/checkout/payment/b2bPayment/execute',
      body,
      { baseUrl: this.disbursementBaseUrl }
    );
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Get the base URL currently configured (useful for debugging)
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the disbursement base URL currently configured
   */
  getDisbursementBaseUrl(): string {
    return this.disbursementBaseUrl;
  }

  /**
   * Check if running in sandbox mode
   */
  isSandboxMode(): boolean {
    return this.isSandbox;
  }

  /**
   * Clear the cached token (useful for forcing re-authentication)
   */
  clearTokenCache(): void {
    this.tokenCache = null;
  }

  /**
   * Check if a token is currently cached and valid
   */
  hasValidToken(): boolean {
    return this.tokenCache !== null && !this.isTokenExpired();
  }

  /**
   * Get remaining token lifetime in seconds
   */
  getTokenRemainingTime(): number {
    if (!this.tokenCache) return 0;
    const remaining = this.tokenCache.expiresAt - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }
}

// ============================================================================
// Factory: Create from Environment Variables
// ============================================================================

/**
 * Create a BkashService instance using environment variables:
 * - BKASH_APP_KEY
 * - BKASH_APP_SECRET
 * - BKASH_USERNAME
 * - BKASH_PASSWORD
 * - BKASH_IS_SANDBOX (optional, defaults to "true")
 */
export function createBkashServiceFromEnv(): BkashService {
  const appKey = process.env.BKASH_APP_KEY;
  const appSecret = process.env.BKASH_APP_SECRET;
  const username = process.env.BKASH_USERNAME;
  const password = process.env.BKASH_PASSWORD;
  const isSandbox = process.env.BKASH_IS_SANDBOX !== 'false'; // Default to sandbox

  if (!appKey || !appSecret || !username || !password) {
    throw new BkashError(
      'Missing required bKash configuration. ' +
      'Set BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME, and BKASH_PASSWORD environment variables.'
    );
  }

  return new BkashService({
    appKey,
    appSecret,
    username,
    password,
    isSandbox,
  });
}

// ============================================================================
// Default Export: Singleton Instance (Lazy Initialization)
// ============================================================================

let _bkashInstance: BkashService | null = null;

/**
 * Get a singleton BkashService instance configured from environment variables.
 * The instance is lazily created on first access.
 */
export function getBkashService(): BkashService {
  if (!_bkashInstance) {
    _bkashInstance = createBkashServiceFromEnv();
  }
  return _bkashInstance;
}
