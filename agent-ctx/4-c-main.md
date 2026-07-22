# Task 4-c: Fix RegisterPage Mobile Responsiveness

## Agent: main
## Status: Completed

## Summary
Fixed all 7 mobile responsiveness issues in RegisterPage.tsx to ensure the 3-step registration wizard works properly on 375px screens.

## Changes Made

### 1. Outer Container & Card Width
- Outer wrapper: `p-4` → `p-3 sm:p-4`
- Container: `w-full max-w-lg` → `w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg mx-auto`
- Card: added `overflow-hidden`

### 2. Step Indicator (Compact on Mobile)
- Container: `gap-2 mb-6` → `gap-1 sm:gap-2 mb-4 sm:mb-6`
- Pills: `gap-2 px-3` → `gap-1.5 sm:gap-2 px-2 sm:px-3`
- Connectors: `w-8 mx-1` → `w-4 sm:w-8 mx-0.5 sm:mx-1`

### 3. Card Internal Padding
- CardHeader: added `px-4 sm:px-6`
- CardContent: added `px-4 sm:px-6`

### 4. Step 1 - Personal Info
- All inputs: `h-11` via `[&_input]:h-11` on container
- Select trigger: `h-11 w-full` via descendant selectors
- Gender/DOB: `grid-cols-1 sm:grid-cols-2` (stack on mobile)
- Password criteria: `grid-cols-1 sm:grid-cols-2` (stack on mobile)

### 5. Step 2 - Agreement
- Summary: `p-3 sm:p-4`, `grid-cols-1 sm:grid-cols-2`, email field `break-all`
- Agreement items: `min-h-[44px]`, `p-3 sm:p-4`, checkbox `shrink-0`

### 6. Step 3 - OTP Verification
- OTP sections: `p-3 sm:p-4`
- Badges: `max-w-[140px] truncate`
- OTP slots: `w-10 h-12 text-base` on mobile, `w-12 h-14` on sm+
- Verify/Resend: `flex-col sm:flex-row`, both `h-11`
- Send OTP buttons: `h-11`

### 7. Action Buttons & Login Link
- Back/Continue/Create Account: `h-11` (44px touch target)
- Login link: `min-h-[44px] min-w-[44px] inline-flex items-center justify-center`

## Verification
- ESLint: passes (no new errors)
- Dev server: compiles successfully
