---
Task ID: 2
Agent: Main Agent
Task: Redesign Sell Ticket Page UI per user requirements

Work Log:
- Rewrote SellTicketPage.tsx completely with all requested UI changes
- Transport Type: Changed from dropdown to horizontal 4-column button tabs (Bus|Train|Flight|Launch) with icons, gradient active states, and smooth transitions
- Ticket Type: Changed from dropdown to horizontal 2-column button tabs (Online Copy|Counter Copy) with icons
- Upload: Full-width drag & drop zone with CloudUpload icon, dashed border, "browse files" link, drag event handlers (onDrop, onDragOver, onDragLeave), and uploaded file preview with remove button
- From & To: Side-by-side layout using grid-cols-[1fr_auto_1fr] with ArrowLeftRight icon in circular badge between them
- Departure Date & Time: Side-by-side in 2-column grid
- Price Panel: Redesigned with 4-line breakdown:
  1. Ticket Price → ৳amount
  2. Platform Fee 2% (min ৳20) → -৳fee
  3. Buyer will pay to you (seller) total → ৳total
  4. You will receive (after fee deduction) → ৳sellerReceives
- District Dropdown: Sorted A-Z using localeCompare, all 64 unique districts
- Same District Validation: Disabled option in From if selected in To (and vice versa) with "(origin)"/"(destination)" labels, plus warning message
- Updated constants.ts: Added .sort() to ALL_BD_DISTRICTS
- Lint: 0 errors, 0 warnings
- Browser verification: 8/8 checks PASS

Stage Summary:
- All 8 UI changes implemented and verified via Agent Browser
- Transport tabs, ticket type tabs, drag-drop upload, side-by-side layouts, pricing panel, A-Z districts, same-district validation all working
