# Task 4-d: Fix KycPage Mobile Responsiveness

## Summary
Fixed all 7 mobile responsiveness issues in `/home/z/my-project/src/components/pages/KycPage.tsx`.

## Changes Made

### Container & Layout
- Container padding: `py-4 sm:py-6 px-3 sm:px-4 overflow-x-hidden`
- Card content: `p-3 sm:p-6`
- Header: smaller icon, title, and margins on mobile

### Step Indicator
- Short labels on mobile (`Docs`/`Selfie`), full labels on `sm+`
- Compact padding and connector line

### Grid Layouts (all changed to `grid-cols-1 sm:grid-cols-2`)
- DOB/Gender fields
- Document Type/Number fields
- File uploads (Front/Back)
- Division/District cascading dropdowns

### Input Fields & Selects
- All have `h-11` minimum height

### Touch Targets
- Buttons: `min-h-[44px]`
- Upload labels: `min-h-[44px]`
- Pose selector: `min-h-[36px] sm:min-h-0 touch-manipulation`
- Remove buttons on uploaded images: `w-8 h-8 touch-manipulation`

### GPS Display
- Compact text (`text-xs sm:text-sm`), `flex items-start` with `min-w-0` wrapper

### Camera Overlay
- Smaller face guide oval on mobile
- Compact pose label
- Smaller captured photo thumbnails (`w-14 h-14 sm:w-16 sm:h-16`)

## Verification
- Lint check passed (no new errors in KycPage.tsx)
- Dev server running successfully
