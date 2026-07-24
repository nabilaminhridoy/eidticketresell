import crypto from 'crypto';

// ============================================================================
// Type Definitions & Interfaces
// ============================================================================

/**
 * Core Payment API - Initiate Payment Parameters
 */
export interface InitiatePaymentParams {
  // Mandatory parameters
  store_id?: string;
  store_passwd?: string;
  total_amount: string | number;
  currency: string;
  tran_id: string;
  product_category: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;

  // Customer information
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_add2?: string;
  cus_city: string;
  cus_state?: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  cus_fax?: string;

  // Shipping information
  shipping_method?: string;
  num_of_item?: string | number;
  ship_name?: string;
  ship_add1?: string;
  ship_add2?: string;
  ship_area?: string;
  ship_city?: string;
  ship_sub_city?: string;
  ship_state?: string;
  ship_postcode?: string;
  ship_country?: string;

  // Product information
  product_name?: string;
  product_profile?: string;
  cart?: string; // JSON string

  // EMI options
  emi_option?: string | number;
  emi_max_inst_option?: string | number;
  emi_selected_inst?: string | number;
  emi_allow_only?: string | number;

  // Card restrictions
  multi_card_name?: string;
  allowed_bin?: string;

  // Custom values
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;

  // Additional amount fields
  product_amount?: string | number;
  vat?: string | number;
  discount_amount?: string | number;
  convenience_fee?: string | number;

  // Airline-tickets vertical
  hours_till_departure?: string | number;
  flight_type?: string;
  pnr?: string;
  journey_from_to?: string;
  third_party_booking?: string;

  // Travel-vertical
  hotel_name?: string;
  length_of_stay?: string | number;
  check_in_time?: string;
  hotel_city?: string;

  // Telecom-vertical
  product_type?: string;
  topup_number?: string;
  country_topup?: string;
}

/**
 * Core Payment API - Session Creation Response
 */
export interface SessionResponse {
  status: string;
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
  directPayURL?: string;
  token?: string;
  tran_id?: string;
  emi_bank?: string;
  emi_inst_option?: string;
  emi_info?: string;
  emi_max_inst_option?: string;
  emi_allow_only?: string;
  emi_0_interest?: string;
}

/**
 * Core Payment API - Order Validation Response
 */
export interface ValidationResponse {
  status: string;
  tran_date?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  store_amount?: string;
  bank_tran_id?: string;
  card_type?: string;
  card_no?: string;
  currency?: string;
  currency_amount?: string;
  currency_rate?: string;
  base_fair?: string;
  risk_level?: string;
  risk_title?: string;
  card_country?: string;
  card_type_name?: string;
  validated_on?: string;
  gw_version?: string;
  bank_gateway?: string;
  ap_code?: string;
  no_of_installment?: string;
  installment_emi_amount?: string;
  reason?: string;
  emi_bank?: string;
  emi_inst_option?: string;
  emi_info?: string;
  emi_max_inst_option?: string;
  emi_allow_only?: string;
  emi_0_interest?: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
  error?: string;
}

/**
 * Core Payment API - Transaction Query Response
 */
export interface TransactionQueryResponse {
  APIConnect?: string;
  no_of_trans_found?: string | number;
  tran_date?: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  store_amount?: string;
  bank_tran_id?: string;
  card_type?: string;
  card_no?: string;
  card_country?: string;
  card_type_name?: string;
  currency?: string;
  currency_amount?: string;
  currency_rate?: string;
  base_fair?: string;
  status?: string;
  bank_gateway?: string;
  gw_version?: string;
  ap_code?: string;
  validated_on?: string;
  risk_level?: string;
  risk_title?: string;
  no_of_installment?: string;
  installment_emi_amount?: string;
  emi_bank?: string;
  emi_inst_option?: string;
  emi_info?: string;
  emi_max_inst_option?: string;
  emi_allow_only?: string;
  emi_0_interest?: string;
  element?: TransactionQueryElement[];
  error?: string;
}

export interface TransactionQueryElement {
  tran_date: string;
  tran_id: string;
  val_id: string;
  amount: string;
  store_amount: string;
  bank_tran_id: string;
  card_type: string;
  card_no: string;
  card_country: string;
  card_type_name: string;
  currency: string;
  currency_amount: string;
  currency_rate: string;
  base_fair: string;
  status: string;
  bank_gateway: string;
  gw_version: string;
  ap_code: string;
  validated_on: string;
  risk_level: string;
  risk_title: string;
  no_of_installment: string;
  installment_emi_amount: string;
  emi_bank: string;
  emi_inst_option: string;
  emi_info: string;
  emi_max_inst_option: string;
  emi_allow_only: string;
  emi_0_interest: string;
}

/**
 * Core Payment API - Refund Parameters
 */
export interface RefundParams {
  bank_tran_id: string;
  refund_trans_id: string;
  refund_amount: string | number;
  refund_remarks: string;
}

/**
 * Core Payment API - Refund Response
 */
export interface RefundResponse {
  APIConnect?: string;
  refund_ref_id?: string;
  bank_tran_id?: string;
  trans_id?: string;
  refund_amount?: string;
  currency?: string;
  refund_status?: string;
  error?: string;
  reason?: string;
}

/**
 * Core Payment API - Refund Status Response
 */
export interface RefundStatusResponse {
  APIConnect?: string;
  refund_ref_id?: string;
  bank_tran_id?: string;
  trans_id?: string;
  refund_amount?: string;
  refund_currency?: string;
  refund_init_on?: string;
  refund_status?: string;
  refund_processed_on?: string;
  error?: string;
  reason?: string;
}

// ============================================================================
// Quick Bank Pay API Types
// ============================================================================

/**
 * Quick Bank Pay - Token Response
 */
export interface QBPTokenResponse {
  status: string;
  token?: string;
  expires_at?: string;
  error?: string;
  reason?: string;
  message?: string;
}

/**
 * Quick Bank Pay - Bill Query Parameters
 */
export interface BillQueryParams {
  token: string;
  stk_code: string;
  account_number: string;
  mobile_number?: string;
  amount?: string | number;
  reference?: string;
}

/**
 * Quick Bank Pay - Bill Query Response
 */
export interface BillQueryResponse {
  status: string;
  stk_code?: string;
  account_number?: string;
  bill_number?: string;
  bill_amount?: string;
  bill_due_date?: string;
  bill_minimum_payment?: string;
  bill_customer_name?: string;
  bill_cycle?: string;
  error?: string;
  reason?: string;
  message?: string;
  bill_data?: Record<string, string>;
}

/**
 * Quick Bank Pay - Bill Payment Confirm Parameters
 */
export interface BillPaymentConfirmParams {
  token: string;
  stk_code: string;
  account_number: string;
  bill_number: string;
  amount: string | number;
  mobile_number?: string;
  reference?: string;
  tran_id: string;
}

/**
 * Quick Bank Pay - Bill Payment Confirm Response
 */
export interface BillPaymentConfirmResponse {
  status: string;
  tran_id?: string;
  bank_tran_id?: string;
  amount?: string;
  payment_date?: string;
  error?: string;
  reason?: string;
  message?: string;
}

/**
 * Quick Bank Pay - Bill Payment Status Parameters
 */
export interface BillPaymentStatusParams {
  token: string;
  stk_code: string;
  tran_id: string;
}

/**
 * Quick Bank Pay - Bill Payment Status Response
 */
export interface BillPaymentStatusResponse {
  status: string;
  tran_id?: string;
  bank_tran_id?: string;
  amount?: string;
  payment_date?: string;
  payment_status?: string;
  error?: string;
  reason?: string;
  message?: string;
}

/**
 * Quick Bank Pay - Service List Response
 */
export interface ServiceListResponse {
  status: string;
  services?: QBService[];
  error?: string;
  reason?: string;
  message?: string;
}

export interface QBService {
  stk_code: string;
  stk_name: string;
  stk_description?: string;
  stk_logo_url?: string;
  stk_category?: string;
  stk_status?: string;
}

// ============================================================================
// Google Pay Integration API Types
// ============================================================================

/**
 * Google Pay - Config Response
 */
export interface GooglePayConfigResponse {
  status: string;
  merchant_id?: string;
  merchant_name?: string;
  gateway?: string;
  gateway_merchant_id?: string;
  allowed_card_networks?: string[];
  allowed_card_auth_methods?: string[];
  environment?: string;
  total_amount?: string;
  currency?: string;
  country_code?: string;
  google_merchant_id?: string;
  google_merchant_name?: string;
  error?: string;
  reason?: string;
  message?: string;
}

/**
 * Google Pay - Transaction Parameters
 */
export interface GooglePayTransactionParams {
  total_amount: string | number;
  currency: string;
  tran_id: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url?: string;
  product_category?: string;
  product_name?: string;
  product_profile?: string;
  emi_option?: string | number;
  shipping_method?: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
}

/**
 * Google Pay - Transaction Initiation Response
 */
export interface GooglePayTransactionResponse {
  status: string;
  sessionkey?: string;
  actionurl?: string;
  GatewayPageURL?: string;
  directPayURL?: string;
  token?: string;
  tran_id?: string;
  error?: string;
  reason?: string;
  failedreason?: string;
  message?: string;
}

/**
 * Google Pay - Token Process Response
 */
export interface GooglePayTokenProcessResponse {
  status: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  bank_tran_id?: string;
  card_type?: string;
  card_no?: string;
  validated_on?: string;
  error?: string;
  reason?: string;
  message?: string;
}

// ============================================================================
// Invoice API Types
// ============================================================================

/**
 * Invoice - Create Invoice Parameters
 */
export interface CreateInvoiceParams {
  store_id?: string;
  store_passwd?: string;
  inv_id?: string;
  inv_name?: string;
  inv_description?: string;
  inv_total_amount: string | number;
  inv_currency?: string;
  inv_due_date?: string;
  inv_billing_period?: string;
  inv_billing_cycle?: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url?: string;
  product_name?: string;
  product_profile?: string;
  product_category?: string;
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;
}

/**
 * Invoice - Create Invoice Response
 */
export interface CreateInvoiceResponse {
  status: string;
  pay_url?: string;
  qr_image_pay_url?: string;
  invoice_id?: string;
  bangla_qr_code?: string;
  inv_id?: string;
  error?: string;
  reason?: string;
  message?: string;
}

/**
 * Invoice - Payment Status Parameters
 */
export interface InvoiceStatusParams {
  inv_id?: string;
  inv_invoice_number?: string;
  sessionkey?: string;
}

/**
 * Invoice - Payment Status Response
 */
export interface InvoiceStatusResponse {
  status: string;
  inv_id?: string;
  inv_invoice_number?: string;
  inv_total_amount?: string;
  inv_currency?: string;
  inv_status?: string;
  tran_id?: string;
  tran_date?: string;
  val_id?: string;
  amount?: string;
  bank_tran_id?: string;
  card_type?: string;
  card_no?: string;
  card_country?: string;
  card_type_name?: string;
  payment_status?: string;
  error?: string;
  reason?: string;
  message?: string;
}

/**
 * Invoice - Cancel Invoice Parameters
 */
export interface InvoiceCancelParams {
  inv_id?: string;
  inv_invoice_number?: string;
  sessionkey?: string;
}

/**
 * Invoice - Cancel Invoice Response
 */
export interface InvoiceCancelResponse {
  status: string;
  inv_id?: string;
  inv_invoice_number?: string;
  cancel_status?: string;
  cancel_date?: string;
  error?: string;
  reason?: string;
  message?: string;
}

// ============================================================================
// Error Class
// ============================================================================

export class SSLCommerzError extends Error {
  public statusCode?: number;
  public apiResponse?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode?: number,
    apiResponse?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SSLCommerzError';
    this.statusCode = statusCode;
    this.apiResponse = apiResponse;
  }
}

// ============================================================================
// Helper: Build URL with Query Parameters
// ============================================================================

function buildUrl(baseUrl: string, params: Record<string, string | number | undefined>): string {
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      filteredParams[key] = String(value);
    }
  }
  const queryString = new URLSearchParams(filteredParams).toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// ============================================================================
// SSLCommerz Payment Gateway Service Class
// ============================================================================

export class SSLCommerz {
  private storeId: string;
  private storePasswd: string;
  private isSandbox: boolean;

  // Base URLs
  private coreBaseUrl: string;
  private coreValidationBaseUrl: string;
  private quickBankPayBaseUrl: string;
  private easyCheckoutJsUrl: string;

  constructor(storeId: string, storePasswd: string, isSandbox: boolean = true) {
    this.storeId = storeId;
    this.storePasswd = storePasswd;
    this.isSandbox = isSandbox;

    if (isSandbox) {
      this.coreBaseUrl = 'https://sandbox.sslcommerz.com';
      this.coreValidationBaseUrl = 'https://sandbox.sslcommerz.com';
      this.quickBankPayBaseUrl = 'https://sandboxbox.sslcommerz.com/api/v1/merchant-hosted-payment';
      this.easyCheckoutJsUrl = 'https://sandbox.sslcommerz.com/embed.min.js';
    } else {
      this.coreBaseUrl = 'https://securepay.sslcommerz.com';
      this.coreValidationBaseUrl = 'https://securepay.sslcommerz.com';
      this.quickBankPayBaseUrl = 'https://sslcommerz.com/api/v1/merchant-hosted-payment';
      this.easyCheckoutJsUrl = 'https://seamless-epay.sslcommerz.com/embed.min.js';
    }
  }

  // ========================================================================
  // 1. CORE PAYMENT API
  // ========================================================================

  /**
   * Initiate a payment session
   * POST to /gwprocess/v4/api.php
   */
  async initiatePayment(params: InitiatePaymentParams): Promise<SessionResponse> {
    const url = `${this.coreBaseUrl}/gwprocess/v4/api.php`;

    const body: Record<string, string | number> = {
      store_id: params.store_id || this.storeId,
      store_passwd: params.store_passwd || this.storePasswd,
      total_amount: params.total_amount,
      currency: params.currency,
      tran_id: params.tran_id,
      product_category: params.product_category,
      success_url: params.success_url,
      fail_url: params.fail_url,
      cancel_url: params.cancel_url,
      ipn_url: params.ipn_url,
      cus_name: params.cus_name,
      cus_email: params.cus_email,
      cus_add1: params.cus_add1,
      cus_city: params.cus_city,
      cus_postcode: params.cus_postcode,
      cus_country: params.cus_country,
      cus_phone: params.cus_phone,
    };

    // Add optional customer fields
    if (params.cus_add2) body.cus_add2 = params.cus_add2;
    if (params.cus_state) body.cus_state = params.cus_state;
    if (params.cus_fax) body.cus_fax = params.cus_fax;

    // Add shipping fields
    if (params.shipping_method) body.shipping_method = params.shipping_method;
    if (params.num_of_item) body.num_of_item = params.num_of_item;
    if (params.ship_name) body.ship_name = params.ship_name;
    if (params.ship_add1) body.ship_add1 = params.ship_add1;
    if (params.ship_add2) body.ship_add2 = params.ship_add2;
    if (params.ship_area) body.ship_area = params.ship_area;
    if (params.ship_city) body.ship_city = params.ship_city;
    if (params.ship_sub_city) body.ship_sub_city = params.ship_sub_city;
    if (params.ship_state) body.ship_state = params.ship_state;
    if (params.ship_postcode) body.ship_postcode = params.ship_postcode;
    if (params.ship_country) body.ship_country = params.ship_country;

    // Add product fields
    if (params.product_name) body.product_name = params.product_name;
    if (params.product_profile) body.product_profile = params.product_profile;
    if (params.cart) body.cart = params.cart;

    // Add EMI fields
    if (params.emi_option) body.emi_option = params.emi_option;
    if (params.emi_max_inst_option) body.emi_max_inst_option = params.emi_max_inst_option;
    if (params.emi_selected_inst) body.emi_selected_inst = params.emi_selected_inst;
    if (params.emi_allow_only) body.emi_allow_only = params.emi_allow_only;

    // Add card restriction fields
    if (params.multi_card_name) body.multi_card_name = params.multi_card_name;
    if (params.allowed_bin) body.allowed_bin = params.allowed_bin;

    // Add custom value fields
    if (params.value_a) body.value_a = params.value_a;
    if (params.value_b) body.value_b = params.value_b;
    if (params.value_c) body.value_c = params.value_c;
    if (params.value_d) body.value_d = params.value_d;

    // Add additional amount fields
    if (params.product_amount) body.product_amount = params.product_amount;
    if (params.vat) body.vat = params.vat;
    if (params.discount_amount) body.discount_amount = params.discount_amount;
    if (params.convenience_fee) body.convenience_fee = params.convenience_fee;

    // Add airline-tickets vertical fields
    if (params.hours_till_departure) body.hours_till_departure = params.hours_till_departure;
    if (params.flight_type) body.flight_type = params.flight_type;
    if (params.pnr) body.pnr = params.pnr;
    if (params.journey_from_to) body.journey_from_to = params.journey_from_to;
    if (params.third_party_booking) body.third_party_booking = params.third_party_booking;

    // Add travel-vertical fields
    if (params.hotel_name) body.hotel_name = params.hotel_name;
    if (params.length_of_stay) body.length_of_stay = params.length_of_stay;
    if (params.check_in_time) body.check_in_time = params.check_in_time;
    if (params.hotel_city) body.hotel_city = params.hotel_city;

    // Add telecom-vertical fields
    if (params.product_type) body.product_type = params.product_type;
    if (params.topup_number) body.topup_number = params.topup_number;
    if (params.country_topup) body.country_topup = params.country_topup;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body as Record<string, string>).toString(),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Payment initiation failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: SessionResponse = await response.json();

      if (data.status === 'FAILED' || data.status === 'UNSUCCESSFUL') {
        throw new SSLCommerzError(
          `Payment initiation unsuccessful: ${data.failedreason || 'Unknown reason'}`,
          response.status,
          data as unknown as Record<string, unknown>
        );
      }

      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Payment initiation request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate an order using val_id
   * GET to /validator/api/validationserverAPI.php
   */
  async validateOrder(val_id: string): Promise<ValidationResponse> {
    const url = buildUrl(`${this.coreValidationBaseUrl}/validator/api/validationserverAPI.php`, {
      val_id,
      store_id: this.storeId,
      store_passwd: this.storePasswd,
      format: 'json',
    });

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Order validation failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: ValidationResponse = await response.json();

      if (data.status !== 'VALID' && data.status !== 'VALIDATED') {
        throw new SSLCommerzError(
          `Order validation unsuccessful: status=${data.status}, reason=${data.reason || data.error || 'Unknown'}`,
          response.status,
          data as unknown as Record<string, unknown>
        );
      }

      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Order validation request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Query transaction by session key
   * GET to /validator/api/merchantTransIDvalidationAPI.php
   */
  async queryTransactionBySession(sessionkey: string): Promise<TransactionQueryResponse> {
    const url = buildUrl(`${this.coreValidationBaseUrl}/validator/api/merchantTransIDvalidationAPI.php`, {
      sessionkey,
      store_id: this.storeId,
      store_passwd: this.storePasswd,
      format: 'json',
    });

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Transaction query (by session) failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: TransactionQueryResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Transaction query (by session) request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Query transaction by tran_id
   * GET to /validator/api/merchantTransIDvalidationAPI.php
   */
  async queryTransactionByTranId(tran_id: string): Promise<TransactionQueryResponse> {
    const url = buildUrl(`${this.coreValidationBaseUrl}/validator/api/merchantTransIDvalidationAPI.php`, {
      tran_id,
      store_id: this.storeId,
      store_passwd: this.storePasswd,
      format: 'json',
    });

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Transaction query (by tran_id) failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: TransactionQueryResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Transaction query (by tran_id) request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Initiate a refund
   * POST to /validator/api/merchantTransIDvalidationAPI.php
   */
  async initiateRefund(params: RefundParams): Promise<RefundResponse> {
    const url = `${this.coreValidationBaseUrl}/validator/api/merchantTransIDvalidationAPI.php`;

    const body: Record<string, string> = {
      bank_tran_id: params.bank_tran_id,
      refund_trans_id: params.refund_trans_id,
      store_id: this.storeId,
      store_passwd: this.storePasswd,
      refund_amount: String(params.refund_amount),
      refund_remarks: params.refund_remarks,
      format: 'json',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body).toString(),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Refund initiation failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: RefundResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Refund initiation request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Query refund status
   * GET to /validator/api/merchantTransIDvalidationAPI.php
   */
  async queryRefundStatus(refund_ref_id: string): Promise<RefundStatusResponse> {
    const url = buildUrl(`${this.coreValidationBaseUrl}/validator/api/merchantTransIDvalidationAPI.php`, {
      refund_ref_id,
      store_id: this.storeId,
      store_passwd: this.storePasswd,
      format: 'json',
    });

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Refund status query failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: RefundStatusResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Refund status query request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verify IPN hash (verify_sign against verify_key)
   *
   * Process:
   * 1. Parse verify_key to get ordered list of field names
   * 2. Concatenate all values in the order specified by verify_key + store_passwd
   * 3. MD5 hash the concatenated string
   * 4. Compare the hash with verify_sign
   */
  verifyIpnHash(ipnData: Record<string, string>): boolean {
    const verifySign = ipnData.verify_sign;
    const verifyKey = ipnData.verify_key;

    if (!verifySign || !verifyKey) {
      return false;
    }

    // Parse verify_key to get ordered list of field names
    const orderedFields = verifyKey.split(',');

    // Concatenate all values in the specified order + store_passwd
    const concatenatedValues = orderedFields
      .map((field) => ipnData[field] || '')
      .join('') + this.storePasswd;

    // MD5 hash the concatenated string
    const computedHash = crypto
      .createHash('md5')
      .update(concatenatedValues)
      .digest('hex');

    // Compare with verify_sign
    return computedHash === verifySign;
  }

  /**
   * Get the Easy Checkout JS URL based on sandbox/live configuration
   */
  getEasyCheckoutJsUrl(): string {
    return this.easyCheckoutJsUrl;
  }

  // ========================================================================
  // 2. QUICK BANK PAY API
  // ========================================================================

  /**
   * Generate Quick Bank Pay authentication token
   * POST to /api/v1/auth/token
   */
  async generateQuickBankPayToken(username: string, password: string): Promise<QBPTokenResponse> {
    const url = `${this.quickBankPayBaseUrl}/api/v1/auth/token`;

    const body = {
      username,
      password,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-KEY': this.storeId,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Quick Bank Pay token generation failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: QBPTokenResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Quick Bank Pay token generation request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Query a bill
   * POST to /api/v1/bill/query
   */
  async queryBill(params: BillQueryParams): Promise<BillQueryResponse> {
    const url = `${this.quickBankPayBaseUrl}/api/v1/bill/query`;

    const body: Record<string, string | number> = {
      token: params.token,
      stk_code: params.stk_code,
      account_number: params.account_number,
    };

    if (params.mobile_number) body.mobile_number = params.mobile_number;
    if (params.amount) body.amount = params.amount;
    if (params.reference) body.reference = params.reference;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-KEY': this.storeId,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Bill query failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: BillQueryResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Bill query request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Confirm a bill payment
   * POST to /api/v1/bill/payment/confirm
   */
  async confirmBillPayment(params: BillPaymentConfirmParams): Promise<BillPaymentConfirmResponse> {
    const url = `${this.quickBankPayBaseUrl}/api/v1/bill/payment/confirm`;

    const body: Record<string, string | number> = {
      token: params.token,
      stk_code: params.stk_code,
      account_number: params.account_number,
      bill_number: params.bill_number,
      amount: params.amount,
      tran_id: params.tran_id,
    };

    if (params.mobile_number) body.mobile_number = params.mobile_number;
    if (params.reference) body.reference = params.reference;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-KEY': this.storeId,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Bill payment confirmation failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: BillPaymentConfirmResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Bill payment confirmation request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get bill payment status
   * POST to /api/v1/bill/payment/status
   */
  async getBillPaymentStatus(params: BillPaymentStatusParams): Promise<BillPaymentStatusResponse> {
    const url = `${this.quickBankPayBaseUrl}/api/v1/bill/payment/status`;

    const body = {
      token: params.token,
      stk_code: params.stk_code,
      tran_id: params.tran_id,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'API-KEY': this.storeId,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Bill payment status query failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: BillPaymentStatusResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Bill payment status query request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get Quick Bank Pay service list
   * GET with STK-CODE and AUTH-KEY headers
   */
  async getServiceList(stkCode: string, authKey: string): Promise<ServiceListResponse> {
    const url = `${this.quickBankPayBaseUrl}/api/v1/services`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'API-KEY': this.storeId,
          'STK-CODE': stkCode,
          'AUTH-KEY': authKey,
        },
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Service list query failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: ServiceListResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Service list query request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ========================================================================
  // 3. GOOGLE PAY INTEGRATION API
  // ========================================================================

  /**
   * Get Google Pay configuration
   * POST with action="googlepayConfig", store_id, store_passwd
   */
  async getGooglePayConfig(): Promise<GooglePayConfigResponse> {
    const url = this.quickBankPayBaseUrl;

    const body = {
      action: 'googlepayConfig',
      store_id: this.storeId,
      store_passwd: this.storePasswd,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Google Pay config retrieval failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: GooglePayConfigResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Google Pay config retrieval request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Initiate a Google Pay transaction
   * POST with action="initiateTransaction", plus all payment params and enable_cus_googlepay=1
   */
  async initiateGooglePayTransaction(
    params: GooglePayTransactionParams
  ): Promise<GooglePayTransactionResponse> {
    const url = this.quickBankPayBaseUrl;

    const body: Record<string, string | number> = {
      action: 'initiateTransaction',
      store_id: this.storeId,
      store_passwd: this.storePasswd,
      total_amount: params.total_amount,
      currency: params.currency,
      tran_id: params.tran_id,
      cus_name: params.cus_name,
      cus_email: params.cus_email,
      cus_add1: params.cus_add1,
      cus_city: params.cus_city,
      cus_postcode: params.cus_postcode,
      cus_country: params.cus_country,
      cus_phone: params.cus_phone,
      success_url: params.success_url,
      fail_url: params.fail_url,
      cancel_url: params.cancel_url,
      enable_cus_googlepay: 1,
    };

    // Add optional fields
    if (params.ipn_url) body.ipn_url = params.ipn_url;
    if (params.product_category) body.product_category = params.product_category;
    if (params.product_name) body.product_name = params.product_name;
    if (params.product_profile) body.product_profile = params.product_profile;
    if (params.emi_option) body.emi_option = params.emi_option;
    if (params.shipping_method) body.shipping_method = params.shipping_method;
    if (params.value_a) body.value_a = params.value_a;
    if (params.value_b) body.value_b = params.value_b;
    if (params.value_c) body.value_c = params.value_c;
    if (params.value_d) body.value_d = params.value_d;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Google Pay transaction initiation failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: GooglePayTransactionResponse = await response.json();

      if (data.status === 'FAILED' || data.status === 'UNSUCCESSFUL') {
        throw new SSLCommerzError(
          `Google Pay transaction initiation unsuccessful: ${data.failedreason || data.reason || data.error || 'Unknown reason'}`,
          response.status,
          data as unknown as Record<string, unknown>
        );
      }

      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Google Pay transaction initiation request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Process a Google Pay token
   * POST to the actionurl from initiate response with session_key and base64-encoded token
   */
  async processGooglePayToken(
    session_key: string,
    en_signature_data: string,
    actionurl: string
  ): Promise<GooglePayTokenProcessResponse> {
    // Base64 encode the signature data
    const base64Token = Buffer.from(en_signature_data).toString('base64');

    const body = {
      session_key,
      en_signature_data: base64Token,
    };

    try {
      const response = await fetch(actionurl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Google Pay token processing failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: GooglePayTokenProcessResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Google Pay token processing request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ========================================================================
  // 4. INVOICE API
  // ========================================================================

  /**
   * Create an invoice
   * POST to /gwprocess/v4/invoice.php
   */
  async createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResponse> {
    const url = `${this.coreBaseUrl}/gwprocess/v4/invoice.php`;

    const body: Record<string, string | number> = {
      store_id: params.store_id || this.storeId,
      store_passwd: params.store_passwd || this.storePasswd,
      inv_total_amount: params.inv_total_amount,
      cus_name: params.cus_name,
      cus_email: params.cus_email,
      cus_add1: params.cus_add1,
      cus_city: params.cus_city,
      cus_postcode: params.cus_postcode,
      cus_country: params.cus_country,
      cus_phone: params.cus_phone,
      success_url: params.success_url,
      fail_url: params.fail_url,
      cancel_url: params.cancel_url,
    };

    // Add optional invoice fields
    if (params.inv_id) body.inv_id = params.inv_id;
    if (params.inv_name) body.inv_name = params.inv_name;
    if (params.inv_description) body.inv_description = params.inv_description;
    if (params.inv_currency) body.inv_currency = params.inv_currency;
    if (params.inv_due_date) body.inv_due_date = params.inv_due_date;
    if (params.inv_billing_period) body.inv_billing_period = params.inv_billing_period;
    if (params.inv_billing_cycle) body.inv_billing_cycle = params.inv_billing_cycle;
    if (params.ipn_url) body.ipn_url = params.ipn_url;
    if (params.product_name) body.product_name = params.product_name;
    if (params.product_profile) body.product_profile = params.product_profile;
    if (params.product_category) body.product_category = params.product_category;
    if (params.value_a) body.value_a = params.value_a;
    if (params.value_b) body.value_b = params.value_b;
    if (params.value_c) body.value_c = params.value_c;
    if (params.value_d) body.value_d = params.value_d;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body as Record<string, string>).toString(),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Invoice creation failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: CreateInvoiceResponse = await response.json();

      if (data.status === 'FAILED' || data.status === 'ERROR') {
        throw new SSLCommerzError(
          `Invoice creation unsuccessful: ${data.error || data.reason || 'Unknown reason'}`,
          response.status,
          data as unknown as Record<string, unknown>
        );
      }

      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Invoice creation request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get invoice payment status
   * POST to /validator/api/v4/ with action=invoicePaymentStatus
   */
  async getInvoicePaymentStatus(params: InvoiceStatusParams): Promise<InvoiceStatusResponse> {
    const url = `${this.coreValidationBaseUrl}/validator/api/v4/`;

    const body: Record<string, string> = {
      action: 'invoicePaymentStatus',
      store_id: this.storeId,
      store_passwd: this.storePasswd,
    };

    if (params.inv_id) body.inv_id = params.inv_id;
    if (params.inv_invoice_number) body.inv_invoice_number = params.inv_invoice_number;
    if (params.sessionkey) body.sessionkey = params.sessionkey;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body).toString(),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Invoice payment status query failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: InvoiceStatusResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Invoice payment status query request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Cancel an invoice
   * POST to /validator/api/v4/ with action=invoiceCancellation
   */
  async cancelInvoice(params: InvoiceCancelParams): Promise<InvoiceCancelResponse> {
    const url = `${this.coreValidationBaseUrl}/validator/api/v4/`;

    const body: Record<string, string> = {
      action: 'invoiceCancellation',
      store_id: this.storeId,
      store_passwd: this.storePasswd,
    };

    if (params.inv_id) body.inv_id = params.inv_id;
    if (params.inv_invoice_number) body.inv_invoice_number = params.inv_invoice_number;
    if (params.sessionkey) body.sessionkey = params.sessionkey;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body).toString(),
      });

      if (!response.ok) {
        throw new SSLCommerzError(
          `Invoice cancellation failed with HTTP status ${response.status}`,
          response.status
        );
      }

      const data: InvoiceCancelResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SSLCommerzError) throw error;
      throw new SSLCommerzError(
        `Invoice cancellation request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Check if the service is configured for sandbox mode
   */
  isSandboxMode(): boolean {
    return this.isSandbox;
  }

  /**
   * Get the configured store ID
   */
  getStoreId(): string {
    return this.storeId;
  }

  /**
   * Get the core base URL (useful for debugging)
   */
  getCoreBaseUrl(): string {
    return this.coreBaseUrl;
  }

  /**
   * Get the validation base URL
   */
  getValidationBaseUrl(): string {
    return this.coreValidationBaseUrl;
  }

  /**
   * Get the Quick Bank Pay base URL
   */
  getQuickBankPayBaseUrl(): string {
    return this.quickBankPayBaseUrl;
  }
}

// ============================================================================
// Factory function for convenience
// ============================================================================

/**
 * Create an SSLCommerz instance with the given configuration
 */
export function createSSLCommerz(
  storeId: string,
  storePasswd: string,
  isSandbox: boolean = true
): SSLCommerz {
  return new SSLCommerz(storeId, storePasswd, isSandbox);
}
