# Task 3-5: OneID Service Layer and API Routes

## Work Summary

Created the complete OneID MFA backend infrastructure including:

### Files Created
1. **`/src/lib/oneid.ts`** — OneID service class (singleton) with:
   - Token caching with 30s expiry buffer
   - Auto-retry on 401 (clears cached token, re-authenticates)
   - 6 API methods: getServiceToken, createUnclaimedBinding, verifyTotp, sendPushNotification, checkPushStatus, deleteBinding
   - Proper TypeScript interfaces for all responses
   - Environment variable configuration (ONEID_CLIENT_ID, ONEID_CLIENT_SECRET, ONEID_BASE_URL, ONEID_API_URL)

2. **`/src/app/api/oneid/setup/route.ts`** — POST /api/oneid/setup
   - Creates unclaimed binding, stores bind_id temporarily on user
   - Does NOT enable MFA yet (that happens after TOTP verification)

3. **`/src/app/api/oneid/verify-totp/route.ts`** — POST /api/oneid/verify-totp
   - Dual-purpose: `purpose: 'setup'` enables MFA, `purpose: 'login'` verifies login
   - Setup: validates bind_id matches user's stored bind_id, then enables MFA
   - Login: uses user's stored bind_id (ignores request body for security), logs success/failure

4. **`/src/app/api/oneid/push/send/route.ts`** — POST /api/oneid/push/send
   - Sends push notification using user's stored bind_id
   - Returns request_id for polling

5. **`/src/app/api/oneid/push/status/route.ts`** — GET /api/oneid/push/status?request_id=X
   - Polls push notification status
   - Logs activity on verified/failed/expired states

6. **`/src/app/api/oneid/disable/route.ts`** — POST /api/oneid/disable
   - Requires TOTP code verification before disabling
   - Deletes binding from OneID, then clears user MFA fields
   - Gracefully handles OneID deletion failure (continues with local disable)

### Files Modified
7. **`/src/app/api/auth/login/route.ts`** — Added MFA interception:
   - After successful password login: checks `oneidMfaEnabled && oneidBindId`
   - After successful OTP login: same MFA check
   - Returns `{ mfaRequired: true, mfaToken, message, user }` when MFA required
   - Added `oneidMfaEnabled` to normal login response user object
   - Login notification only created when MFA is NOT required (avoids premature notification)

8. **`/src/app/api/auth/me/route.ts`** — Added to user response:
   - `oneidMfaEnabled` (boolean)
   - `oneidHasBinding` (boolean, derived from !!oneidBindId — not exposing actual ID)
   - `oneidLastVerifiedAt` (DateTime | null)

9. **`/src/app/api/auth/register/route.ts`** — Added `oneidMfaEnabled: false` to response

### Key Decisions
- Token caching uses 30s buffer before expiry for safety
- Retry-on-401 only happens once (prevents infinite loops)
- Login MFA uses user's stored bind_id, not the one from request body (security)
- Push status endpoint logs activity for all terminal states (verified, failed, expired)
- Disable MFA continues even if OneID binding deletion fails (resilience)
- All routes return 503 when OneID service is not configured
