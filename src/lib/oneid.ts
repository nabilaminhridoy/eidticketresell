// OneID Service Layer — handles all OneID API communication
// Based on the official OneID documentation

interface ServiceTokenCache {
  token: string;
  expiresAt: number; // Unix timestamp in ms
}

interface UnclaimedBindingResponse {
  bind_id: string;
  qr_code: string; // base64 PNG
  algorithm: string;
}

interface TotpVerifyResponse {
  valid: boolean;
  message: string;
}

interface PushSendResponse {
  success: boolean;
  request_id: string;
  valid_number: number;
  message?: string;
}

interface PushStatusResponse {
  status: 'pending' | 'verified' | 'failed' | 'expired';
}

class OneIDService {
  private tokenCache: ServiceTokenCache | null = null;

  private getBaseUrl(): string {
    return process.env.ONEID_BASE_URL || 'https://auth.oneid.com.bd';
  }

  private getApiUrl(): string {
    return process.env.ONEID_API_URL || 'https://auth.oneid.com.bd';
  }

  private getClientId(): string {
    const id = process.env.ONEID_CLIENT_ID;
    if (!id) throw new Error('ONEID_CLIENT_ID is not configured');
    return id;
  }

  private getClientSecret(): string {
    const secret = process.env.ONEID_CLIENT_SECRET;
    if (!secret) throw new Error('ONEID_CLIENT_SECRET is not configured');
    return secret;
  }

  /**
   * Get a service token using client_credentials grant.
   * Caches the token and re-uses until near expiry (30s buffer).
   */
  async getServiceToken(): Promise<string> {
    // Return cached token if still valid (with 30s buffer)
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 30_000) {
      return this.tokenCache.token;
    }

    const url = `${this.getBaseUrl()}/realms/oneid/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.getClientId(),
      client_secret: this.getClientSecret(),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('OneID token request failed:', response.status, text);
      throw new Error(`Failed to obtain OneID service token: ${response.status}`);
    }

    const data = await response.json();
    const expiresIn: number = data.expires_in || 300; // default 5 min

    this.tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    return this.tokenCache.token;
  }

  /**
   * Helper: Make an authenticated request to OneID API.
   * Automatically retries once on 401 (token expired).
   */
  private async authenticatedRequest(
    method: string,
    path: string,
    body?: unknown,
    retry = true
  ): Promise<Response> {
    const token = await this.getServiceToken();
    const url = `${this.getApiUrl()}${path}`;

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    // If 401, token may have expired — clear cache and retry once
    if (response.status === 401 && retry) {
      this.tokenCache = null;
      return this.authenticatedRequest(method, path, body, false);
    }

    return response;
  }

  /**
   * Create an unclaimed binding for MFA setup.
   * Returns bind_id, qr_code (base64 PNG), and algorithm.
   */
  async createUnclaimedBinding(algorithm = 'SHA1'): Promise<UnclaimedBindingResponse> {
    const response = await this.authenticatedRequest(
      'POST',
      '/api/v1/bindings/unclaimed',
      { algorithm }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('OneID create unclaimed binding failed:', response.status, text);
      throw new Error(`Failed to create OneID binding: ${response.status}`);
    }

    const data = await response.json();
    return {
      bind_id: data.bind_id,
      qr_code: data.qr_code,
      algorithm: data.algorithm,
    };
  }

  /**
   * Verify a TOTP code for a given binding.
   */
  async verifyTotp(bindId: string, code: string): Promise<TotpVerifyResponse> {
    const response = await this.authenticatedRequest(
      'POST',
      '/api/v1/totp/verify-by-bind',
      { bind_id: bindId, code }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('OneID verify TOTP failed:', response.status, text);
      throw new Error(`Failed to verify TOTP: ${response.status}`);
    }

    const data = await response.json();
    return {
      valid: data.valid,
      message: data.message || '',
    };
  }

  /**
   * Send a push notification to the user's OneID app.
   */
  async sendPushNotification(bindId: string): Promise<PushSendResponse> {
    const response = await this.authenticatedRequest(
      'POST',
      '/api/v1/push/send-by-bind',
      { bind_id: bindId }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('OneID send push failed:', response.status, text);
      throw new Error(`Failed to send push notification: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success,
      request_id: data.request_id,
      valid_number: data.valid_number,
      message: data.message,
    };
  }

  /**
   * Check the status of a push notification request.
   */
  async checkPushStatus(requestId: string): Promise<PushStatusResponse> {
    const response = await this.authenticatedRequest(
      'GET',
      `/api/v1/push/status/${requestId}`
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('OneID check push status failed:', response.status, text);
      throw new Error(`Failed to check push status: ${response.status}`);
    }

    const data = await response.json();
    return {
      status: data.status,
    };
  }

  /**
   * Delete a binding from OneID.
   */
  async deleteBinding(bindId: string): Promise<boolean> {
    const response = await this.authenticatedRequest(
      'DELETE',
      `/api/v1/bindings/${bindId}`
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('OneID delete binding failed:', response.status, text);
      throw new Error(`Failed to delete OneID binding: ${response.status}`);
    }

    return true;
  }
}

// Export singleton instance
export const oneidService = new OneIDService();
