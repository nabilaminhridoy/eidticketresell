export type Language = 'en' | 'bn';

type TranslationKeys = {
  // Common
  appName: string;
  appSlogan: string;
  home: string;
  about: string;
  contact: string;
  login: string;
  register: string;
  logout: string;
  profile: string;
  settings: string;
  search: string;
  searchPlaceholder: string;
  filter: string;
  sort: string;
  loading: string;
  noResults: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  submit: string;
  confirm: string;
  back: string;
  next: string;
  previous: string;
  viewAll: string;
  viewDetails: string;
  readMore: string;
  showMore: string;
  showLess: string;

  // Navigation
  buyTickets: string;
  sellTickets: string;
  myTickets: string;
  myOrders: string;
  dashboard: string;
  adminPanel: string;
  howItWorks: string;
  faq: string;
  support: string;
  blog: string;

  // Transport
  bus: string;
  train: string;
  flight: string;
  launch: string;
  transport: string;
  allTransport: string;

  // Tickets
  tickets: string;
  ticketDetails: string;
  ticketId: string;
  createTicket: string;
  editTicket: string;
  sellTicket: string;
  ticketType: string;
  onlineCopy: string;
  counterCopy: string;
  transportCompany: string;
  routeFrom: string;
  routeTo: string;
  departureDate: string;
  departureTime: string;
  seatNumber: string;
  seatType: string;
  coachNumber: string;
  price: string;
  platformFee: string;
  totalAmount: string;
  description: string;
  featured: string;
  active: string;
  sold: string;
  expired: string;
  cancelled: string;
  pendingReview: string;

  // Auth
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  name: string;
  fullName: string;
  username: string;
  gender: string;
  dateOfBirth: string;
  male: string;
  female: string;
  other: string;
  forgotPassword: string;
  resetPassword: string;
  emailOtp: string;
  mobileOtp: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  createAccount: string;
  createNow: string;
  loginWithOtp: string;
  ageAgreement: string;
  termsAgreement: string;
  notificationsAgreement: string;
  phoneEmailUsername: string;
  otpVerification: string;
  sendOtp: string;
  verifyOtp: string;
  resendOtp: string;
  otpSent: string;
  otpSentToEmail: string;
  otpSentToPhone: string;
  invalidOtp: string;
  otpExpired: string;
  usernameAvailable: string;
  usernameTaken: string;
  passwordRequirements: string;
  passwordMinLength: string;
  passwordUppercase: string;
  passwordLowercase: string;
  passwordNumber: string;
  passwordSpecial: string;
  passwordMismatch: string;
  registrationSuccess: string;
  verifyEmailFirst: string;
  verifyPhoneFirst: string;
  passwordStrength: string;
  weak: string;
  fair: string;
  good: string;
  strong: string;
  personalInfo: string;
  agreement: string;
  securityVerification: string;
  step: string;
  of: string;
  continueBtn: string;

  // KYC
  kycVerification: string;
  kycPending: string;
  kycApproved: string;
  kycRejected: string;
  nid: string;
  drivingLicence: string;
  passport: string;
  selfiePhoto: string;
  documentFront: string;
  documentBack: string;
  gpsVerification: string;
  becomeVerifiedSeller: string;
  kycPersonalInfo: string;
  kycNameChangeWarning: string;
  kycDobChangeWarning: string;
  kycGenderChangeWarning: string;
  kycChangedOnce: string;
  documentType: string;
  documentNumber: string;
  nidNumber: string;
  drivingLicenceNumber: string;
  passportNumber: string;
  uploadFront: string;
  uploadBack: string;
  uploadFrontOnly: string;
  frontSide: string;
  backSide: string;
  presentAddress: string;
  houseRoadVillage: string;
  upazilaThana: string;
  district: string;
  division: string;
  postalCode: string;
  liveSelfie: string;
  selfieInstructions: string;
  faceRight: string;
  faceLeft: string;
  faceSmile: string;
  eyeBlink: string;
  mustBeInLight: string;
  gpsLocationOn: string;
  capturingSelfie: string;
  captureSelfie: string;
  retake: string;
  kycSubmitSuccess: string;
  kycPendingMessage: string;
  kycRejectedMessage: string;
  kycApprovedMessage: string;
  kycResubmit: string;
  verifiedBadge: string;
  canSellTickets: string;
  canUseWallet: string;
  canWithdraw: string;
  nidDigitsWarning: string;
  uploadDocument: string;
  selectDivision: string;
  selectDistrict: string;

  // Wallet
  wallet: string;
  availableBalance: string;
  pendingBalance: string;
  escrowBalance: string;
  totalEarnings: string;
  totalWithdrawn: string;
  withdraw: string;
  withdrawMethod: string;
  bkash: string;
  bankTransfer: string;
  transactionHistory: string;

  // Orders
  orders: string;
  orderId: string;
  orderDetails: string;
  escrowStatus: string;
  paymentStatus: string;
  deliveryStatus: string;
  deliveryMethod: string;
  onlinePdf: string;
  inPerson: string;
  courier: string;
  held: string;
  released: string;
  refunded: string;
  paid: string;
  pending: string;
  failed: string;
  confirmed: string;
  inProgress: string;
  completed: string;
  disputed: string;

  // Chat
  chat: string;
  messages: string;
  sendMessage: string;
  typeMessage: string;

  // Reviews
  reviews: string;
  writeReview: string;
  rating: string;

  // Home
  heroTitle: string;
  heroSubtitle: string;
  searchTickets: string;
  popularRoutes: string;
  howItWorksTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  whyChooseUs: string;
  featuredTickets: string;
  recentTickets: string;

  // Footer
  terms: string;
  privacy: string;
  refund: string;
  paymentPolicy: string;
  allRightsReserved: string;

  // Admin
  users: string;
  kyc: string;
  payments: string;
  escrow: string;
  withdrawals: string;
  fraudReports: string;
  notifications: string;
  reports: string;
  marketing: string;
  seo: string;
  cms: string;
  businessSettings: string;
  roles: string;
  permissions: string;
  activityLogs: string;

  // Misc
  bdt: string;
  verified: string;
  unverified: string;
  seller: string;
  buyer: string;
  from: string;
  to: string;
  date: string;
  time: string;
  status: string;
  actions: string;
  noData: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  language: string;
  appearance: string;
  lightMode: string;
  darkMode: string;
  systemMode: string;
  security: string;
  notificationsSettings: string;
};

const en: TranslationKeys = {
  appName: 'Eid Ticket Resell',
  appSlogan: 'Buy & Sell Tickets Safely',
  home: 'Home',
  about: 'About',
  contact: 'Contact',
  login: 'Login',
  register: 'Register',
  logout: 'Logout',
  profile: 'Profile',
  settings: 'Settings',
  search: 'Search',
  searchPlaceholder: 'Search tickets, routes, companies...',
  filter: 'Filter',
  sort: 'Sort',
  loading: 'Loading...',
  noResults: 'No results found',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  submit: 'Submit',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  viewAll: 'View All',
  viewDetails: 'View Details',
  readMore: 'Read More',
  showMore: 'Show More',
  showLess: 'Show Less',

  buyTickets: 'Buy Tickets',
  sellTickets: 'Sell Tickets',
  myTickets: 'My Tickets',
  myOrders: 'My Orders',
  dashboard: 'Dashboard',
  adminPanel: 'Admin Panel',
  howItWorks: 'How It Works',
  faq: 'FAQ',
  support: 'Support',
  blog: 'Blog',

  bus: 'Bus',
  train: 'Train',
  flight: 'Flight',
  launch: 'Launch',
  transport: 'Transport',
  allTransport: 'All Transport',

  tickets: 'Tickets',
  ticketDetails: 'Ticket Details',
  ticketId: 'Ticket ID',
  createTicket: 'Create Ticket',
  editTicket: 'Edit Ticket',
  sellTicket: 'Sell Ticket',
  ticketType: 'Ticket Type',
  onlineCopy: 'Online Copy',
  counterCopy: 'Counter Copy',
  transportCompany: 'Transport Company',
  routeFrom: 'From',
  routeTo: 'To',
  departureDate: 'Departure Date',
  departureTime: 'Departure Time',
  seatNumber: 'Seat Number',
  seatType: 'Seat Type',
  coachNumber: 'Coach Number',
  price: 'Price',
  platformFee: 'Platform Fee',
  totalAmount: 'Total Amount',
  description: 'Description',
  featured: 'Featured',
  active: 'Active',
  sold: 'Sold',
  expired: 'Expired',
  cancelled: 'Cancelled',
  pendingReview: 'Pending Review',

  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  phone: 'Phone',
  name: 'Name',
  fullName: 'Full Name (as per NID/Driving Licence/Passport)',
  username: 'Username',
  gender: 'Gender',
  dateOfBirth: 'Date of Birth',
  male: 'Male',
  female: 'Female',
  other: 'Other',
  forgotPassword: 'Forgot Password?',
  resetPassword: 'Reset Password',
  emailOtp: 'Email OTP',
  mobileOtp: 'Mobile OTP',
  alreadyHaveAccount: 'Already have an account?',
  dontHaveAccount: "Don't have an account?",
  createAccount: 'Create Account',
  createNow: 'Create Now',
  loginWithOtp: 'Login with OTP',
  ageAgreement: 'I am at least 18 years old.',
  termsAgreement: 'I agree to the Terms & Conditions and Privacy Policy.',
  notificationsAgreement: 'I agree to receive account-related notifications.',
  phoneEmailUsername: 'Phone / Email / Username',
  otpVerification: 'OTP Verification',
  sendOtp: 'Send OTP',
  verifyOtp: 'Verify OTP',
  resendOtp: 'Resend OTP',
  otpSent: 'OTP Sent!',
  otpSentToEmail: 'OTP has been sent to your email',
  otpSentToPhone: 'OTP has been sent to your phone',
  invalidOtp: 'Invalid OTP code',
  otpExpired: 'OTP has expired. Please request a new one.',
  usernameAvailable: 'Username is available',
  usernameTaken: 'Username is already taken',
  passwordRequirements: 'Password Requirements',
  passwordMinLength: 'At least 8 characters',
  passwordUppercase: 'At least one uppercase letter (A-Z)',
  passwordLowercase: 'At least one lowercase letter (a-z)',
  passwordNumber: 'At least one number (0-9)',
  passwordSpecial: 'At least one special character (!@#$...)',
  passwordMismatch: 'Passwords do not match',
  registrationSuccess: 'Account created successfully!',
  verifyEmailFirst: 'Please verify your email first',
  verifyPhoneFirst: 'Please verify your phone first',
  passwordStrength: 'Password Strength',
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
  personalInfo: 'Personal Information',
  agreement: 'Agreement',
  securityVerification: 'Security Verification',
  step: 'Step',
  of: 'of',
  continueBtn: 'Continue',

  kycVerification: 'KYC Verification',
  kycPending: 'KYC Pending',
  kycApproved: 'KYC Approved',
  kycRejected: 'KYC Rejected',
  nid: 'National ID',
  drivingLicence: 'Driving Licence',
  passport: 'Passport',
  selfiePhoto: 'Live Selfie',
  documentFront: 'Document Front',
  documentBack: 'Document Back',
  gpsVerification: 'GPS Verification',
  becomeVerifiedSeller: 'Become a Verified Seller',
  kycPersonalInfo: 'Personal Information',
  kycNameChangeWarning: 'Name can only be changed once. After that, it cannot be changed again.',
  kycDobChangeWarning: 'Date of birth can only be changed once. After that, it cannot be changed again.',
  kycGenderChangeWarning: 'Gender can only be changed once. After that, it cannot be changed again.',
  kycChangedOnce: 'Already changed once — cannot be changed again',
  documentType: 'Document Type',
  documentNumber: 'Document Number',
  nidNumber: 'NID Number',
  drivingLicenceNumber: 'Driving Licence Number',
  passportNumber: 'Passport Number',
  uploadFront: 'Upload Front Side',
  uploadBack: 'Upload Back Side',
  uploadFrontOnly: 'Upload Photo Page',
  frontSide: 'Front Side',
  backSide: 'Back Side',
  presentAddress: 'Present Address',
  houseRoadVillage: 'House/Road/Village',
  upazilaThana: 'Upazila/Thana',
  district: 'District',
  division: 'Division',
  postalCode: 'Postal Code',
  liveSelfie: 'Take a Live Selfie',
  selfieInstructions: 'Follow the instructions below to capture your selfie',
  faceRight: 'Face Right',
  faceLeft: 'Face Left',
  faceSmile: 'Face Smile',
  eyeBlink: 'Eye Blink',
  mustBeInLight: 'Must be in good lighting',
  gpsLocationOn: 'GPS Location must be enabled',
  capturingSelfie: 'Capturing...',
  captureSelfie: 'Capture',
  retake: 'Retake',
  kycSubmitSuccess: 'KYC submitted successfully! We will review your documents.',
  kycPendingMessage: 'Your KYC is under review. We will notify you once it\'s approved.',
  kycRejectedMessage: 'Your KYC was rejected. Please review the reason and resubmit.',
  kycApprovedMessage: 'Your KYC has been approved! You can now sell tickets and use wallet features.',
  kycResubmit: 'Resubmit KYC',
  verifiedBadge: 'Verified Badge',
  canSellTickets: 'Sell Tickets',
  canUseWallet: 'Use Wallet',
  canWithdraw: 'Withdraw Funds',
  nidDigitsWarning: 'NID must be 10, 13, or 17 digits',
  uploadDocument: 'Upload Document',
  selectDivision: 'Select Division',
  selectDistrict: 'Select District',

  wallet: 'Wallet',
  availableBalance: 'Available Balance',
  pendingBalance: 'Pending Balance',
  escrowBalance: 'Escrow Balance',
  totalEarnings: 'Total Earnings',
  totalWithdrawn: 'Total Withdrawn',
  withdraw: 'Withdraw',
  withdrawMethod: 'Withdrawal Method',
  bkash: 'bKash',
  bankTransfer: 'Bank Transfer',
  transactionHistory: 'Transaction History',

  orders: 'Orders',
  orderId: 'Order ID',
  orderDetails: 'Order Details',
  escrowStatus: 'Escrow Status',
  paymentStatus: 'Payment Status',
  deliveryStatus: 'Delivery Status',
  deliveryMethod: 'Delivery Method',
  onlinePdf: 'Online PDF',
  inPerson: 'In Person',
  courier: 'Courier',
  held: 'Held',
  released: 'Released',
  refunded: 'Refunded',
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  confirmed: 'Confirmed',
  inProgress: 'In Progress',
  completed: 'Completed',
  disputed: 'Disputed',

  chat: 'Chat',
  messages: 'Messages',
  sendMessage: 'Send Message',
  typeMessage: 'Type a message...',

  reviews: 'Reviews',
  writeReview: 'Write a Review',
  rating: 'Rating',

  heroTitle: 'Buy & Sell Tickets Safely',
  heroSubtitle: 'The most trusted marketplace for Bus, Train, Flight & Launch tickets in Bangladesh',
  searchTickets: 'Search Tickets',
  popularRoutes: 'Popular Routes',
  howItWorksTitle: 'How It Works',
  step1Title: 'Search Tickets',
  step1Desc: 'Find tickets for your desired route and transport type',
  step2Title: 'Pay Securely',
  step2Desc: 'Your payment is held in escrow until journey completion',
  step3Title: 'Receive Ticket',
  step3Desc: 'Get your ticket delivered instantly or in person',
  step4Title: 'Complete Journey',
  step4Desc: 'After successful journey, seller receives payment',
  whyChooseUs: 'Why Choose Us',
  featuredTickets: 'Featured Tickets',
  recentTickets: 'Recent Tickets',

  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  refund: 'Refund Policy',
  paymentPolicy: 'Payment Policy',
  allRightsReserved: 'All rights reserved',

  users: 'Users',
  kyc: 'KYC',
  payments: 'Payments',
  escrow: 'Escrow',
  withdrawals: 'Withdrawals',
  fraudReports: 'Fraud Reports',
  notifications: 'Notifications',
  reports: 'Reports',
  marketing: 'Marketing',
  seo: 'SEO',
  cms: 'CMS',
  businessSettings: 'Business Settings',
  roles: 'Roles',
  permissions: 'Permissions',
  activityLogs: 'Activity Logs',

  bdt: '৳',
  verified: 'Verified',
  unverified: 'Unverified',
  seller: 'Seller',
  buyer: 'Buyer',
  from: 'From',
  to: 'To',
  date: 'Date',
  time: 'Time',
  status: 'Status',
  actions: 'Actions',
  noData: 'No data available',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  language: 'Language',
  appearance: 'Appearance',
  lightMode: 'Light',
  darkMode: 'Dark',
  systemMode: 'System',
  security: 'Security',
  notificationsSettings: 'Notifications',
};

const bn: TranslationKeys = {
  appName: 'ঈদ টিকেট রিসেল',
  appSlogan: 'নিরাপদে টিকেট কিনুন ও বিক্রি করুন',
  home: 'হোম',
  about: 'সম্পর্কে',
  contact: 'যোগাযোগ',
  login: 'লগইন',
  register: 'নিবন্ধন',
  logout: 'লগআউট',
  profile: 'প্রোফাইল',
  settings: 'সেটিংস',
  search: 'অনুসন্ধান',
  searchPlaceholder: 'টিকেট, রুট, কোম্পানি খুঁজুন...',
  filter: 'ফিল্টার',
  sort: 'সাজান',
  loading: 'লোড হচ্ছে...',
  noResults: 'কোনো ফলাফল পাওয়া যায়নি',
  save: 'সংরক্ষণ',
  cancel: 'বাতিল',
  delete: 'মুছুন',
  edit: 'সম্পাদনা',
  submit: 'জমা দিন',
  confirm: 'নিশ্চিত করুন',
  back: 'পিছনে',
  next: 'পরবর্তী',
  previous: 'পূর্ববর্তী',
  viewAll: 'সব দেখুন',
  viewDetails: 'বিস্তারিত দেখুন',
  readMore: 'আরও পড়ুন',
  showMore: 'আরও দেখুন',
  showLess: 'কম দেখুন',

  buyTickets: 'টিকেট কিনুন',
  sellTickets: 'টিকেট বিক্রি করুন',
  myTickets: 'আমার টিকেট',
  myOrders: 'আমার অর্ডার',
  dashboard: 'ড্যাশবোর্ড',
  adminPanel: 'অ্যাডমিন প্যানেল',
  howItWorks: 'কিভাবে কাজ করে',
  faq: 'সাধারণ জিজ্ঞাসা',
  support: 'সাহায্য',
  blog: 'ব্লগ',

  bus: 'বাস',
  train: 'ট্রেন',
  flight: 'ফ্লাইট',
  launch: 'লঞ্চ',
  transport: 'যানবাহন',
  allTransport: 'সকল যানবাহন',

  tickets: 'টিকেট',
  ticketDetails: 'টিকেট বিস্তারিত',
  ticketId: 'টিকেট আইডি',
  createTicket: 'টিকেট তৈরি করুন',
  editTicket: 'টিকেট সম্পাদনা',
  sellTicket: 'টিকেট বিক্রি',
  ticketType: 'টিকেট ধরন',
  onlineCopy: 'অনলাইন কপি',
  counterCopy: 'কাউন্টার কপি',
  transportCompany: 'পরিবহন কোম্পানি',
  routeFrom: 'থেকে',
  routeTo: 'যাত্রা',
  departureDate: 'যাত্যা তারিখ',
  departureTime: 'যাত্যা সময়',
  seatNumber: 'আসন নম্বর',
  seatType: 'আসন ধরন',
  coachNumber: 'কোচ নম্বর',
  price: 'মূল্য',
  platformFee: 'প্ল্যাটফর্ম ফি',
  totalAmount: 'সর্বমোট',
  description: 'বিবরণ',
  featured: 'বিশেষ',
  active: 'সক্রিয়',
  sold: 'বিক্রি হয়েছে',
  expired: 'মেয়াদোত্তীর্ণ',
  cancelled: 'বাতিল',
  pendingReview: 'পর্যালোচনাধীন',

  email: 'ইমেইল',
  password: 'পাসওয়ার্ড',
  confirmPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
  phone: 'ফোন',
  name: 'নাম',
  fullName: 'পূর্ণ নাম (এনআইডি/ড্রাইভিং লাইসেন্স/পাসপোর্ট অনুযায়ী)',
  username: 'ইউজারনেম',
  gender: 'লিঙ্গ',
  dateOfBirth: 'জন্ম তারিখ',
  male: 'পুরুষ',
  female: 'মহিলা',
  other: 'অন্যান্য',
  forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
  resetPassword: 'পাসওয়ার্ড রিসেট',
  emailOtp: 'ইমেইল ওটিপি',
  mobileOtp: 'মোবাইল ওটিপি',
  alreadyHaveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
  dontHaveAccount: 'অ্যাকাউন্ট নেই?',
  createAccount: 'অ্যাকাউন্ট তৈরি করুন',
  createNow: 'এখনই তৈরি করুন',
  loginWithOtp: 'ওটিপি দিয়ে লগইন',
  ageAgreement: 'আমি কমপক্ষে ১৮ বছরের।',
  termsAgreement: 'আমি শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত।',
  notificationsAgreement: 'আমি অ্যাকাউন্ট সম্পর্কিত বিজ্ঞপ্তি পেতে সম্মত।',
  phoneEmailUsername: 'ফোন / ইমেইল / ইউজারনেম',
  otpVerification: 'ওটিপি যাচাই',
  sendOtp: 'ওটিপি পাঠান',
  verifyOtp: 'ওটিপি যাচাই করুন',
  resendOtp: 'ওটিপি পুনঃপ্রেরণ',
  otpSent: 'ওটিপি পাঠানো হয়েছে!',
  otpSentToEmail: 'আপনার ইমেইলে ওটিপি পাঠানো হয়েছে',
  otpSentToPhone: 'আপনার ফোনে ওটিপি পাঠানো হয়েছে',
  invalidOtp: 'ওটিপি কোড সঠিক নয়',
  otpExpired: 'ওটিপি মেয়াদোত্তীর্ণ। অনুগ্রহ করে নতুন করে অনুরোধ করুন।',
  usernameAvailable: 'ইউজারনেম পাওয়া যাচ্ছে',
  usernameTaken: 'ইউজারনেম ইতিমধ্যে নেওয়া হয়েছে',
  passwordRequirements: 'পাসওয়ার্ড শর্তাবলী',
  passwordMinLength: 'কমপক্ষে ৮ অক্ষর',
  passwordUppercase: 'কমপক্ষে একটি বড় হাতের অক্ষর (A-Z)',
  passwordLowercase: 'কমপক্ষে একটি ছোট হাতের অক্ষর (a-z)',
  passwordNumber: 'কমপক্ষে একটি সংখ্যা (0-9)',
  passwordSpecial: 'কমপক্ষে একটি বিশেষ অক্ষর (!@#$...)',
  passwordMismatch: 'পাসওয়ার্ড মিলছে না',
  registrationSuccess: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
  verifyEmailFirst: 'অনুগ্রহ করে প্রথমে আপনার ইমেইল যাচাই করুন',
  verifyPhoneFirst: 'অনুগ্রহ করে প্রথমে আপনার ফোন যাচাই করুন',
  passwordStrength: 'পাসওয়ার্ড শক্তি',
  weak: 'দুর্বল',
  fair: 'মাঝারি',
  good: 'ভালো',
  strong: 'শক্তিশালী',
  personalInfo: 'ব্যক্তিগত তথ্য',
  agreement: 'চুক্তি',
  securityVerification: 'নিরাপত্তা যাচাই',
  step: 'ধাপ',
  of: 'এর মধ্যে',
  continueBtn: 'চালিয়ে যান',

  kycVerification: 'কেওয়াইসি যাচাই',
  kycPending: 'কেওয়াইসি অপেক্ষমাণ',
  kycApproved: 'কেওয়াইসি অনুমোদিত',
  kycRejected: 'কেওয়াইসি প্রত্যাখ্যাত',
  nid: 'জাতীয় পরিচয়পত্র',
  drivingLicence: 'ড্রাইভিং লাইসেন্স',
  passport: 'পাসপোর্ট',
  selfiePhoto: 'লাইভ সেলফি',
  documentFront: 'নথি সামনে',
  documentBack: 'নথি পেছনে',
  gpsVerification: 'জিপিএস যাচাই',
  becomeVerifiedSeller: 'যাচাইকৃত বিক্রেতা হন',
  kycPersonalInfo: 'ব্যক্তিগত তথ্য',
  kycNameChangeWarning: 'নাম শুধুমাত্র একবার পরিবর্তন করা যাবে। এরপর আর পরিবর্তন করা যাবে না।',
  kycDobChangeWarning: 'জন্ম তারিখ শুধুমাত্র একবার পরিবর্তন করা যাবে। এরপর আর পরিবর্তন করা যাবে না।',
  kycGenderChangeWarning: 'লিঙ্গ শুধুমাত্র একবার পরিবর্তন করা যাবে। এরপর আর পরিবর্তন করা যাবে না।',
  kycChangedOnce: 'একবার পরিবর্তিত — আর পরিবর্তন করা যাবে না',
  documentType: 'নথি ধরন',
  documentNumber: 'নথি নম্বর',
  nidNumber: 'এনআইডি নম্বর',
  drivingLicenceNumber: 'ড্রাইভিং লাইসেন্স নম্বর',
  passportNumber: 'পাসপোর্ট নম্বর',
  uploadFront: 'সামনের দিক আপলোড',
  uploadBack: 'পেছনের দিক আপলোড',
  uploadFrontOnly: 'ফটো পৃষ্ঠা আপলোড',
  frontSide: 'সামনের দিক',
  backSide: 'পেছনের দিক',
  presentAddress: 'বর্তমান ঠিকানা',
  houseRoadVillage: 'বাড়ি/রাস্তা/গ্রাম',
  upazilaThana: 'উপজেলা/থানা',
  district: 'জেলা',
  division: 'বিভাগ',
  postalCode: 'পোস্টাল কোড',
  liveSelfie: 'লাইভ সেলফি তুলুন',
  selfieInstructions: 'সেলফি ক্যাপচার করতে নিচের নির্দেশনা অনুসরণ করুন',
  faceRight: 'ডানদিকে মুখ',
  faceLeft: 'বামদিকে মুখ',
  faceSmile: 'হাসিমুখ',
  eyeBlink: 'চোখ পিটপিট',
  mustBeInLight: 'আলোর মধ্যে থাকতে হবে',
  gpsLocationOn: 'জিপিএস লোকেশন চালু থাকতে হবে',
  capturingSelfie: 'ক্যাপচার হচ্ছে...',
  captureSelfie: 'ক্যাপচার',
  retake: 'পুনরায় তুলুন',
  kycSubmitSuccess: 'কেওয়াইসি সফলভাবে জমা হয়েছে! আমরা আপনার নথি পর্যালোচনা করব।',
  kycPendingMessage: 'আপনার কেওয়াইসি পর্যালোচনাধীন। অনুমোদিত হলে আমরা জানাব।',
  kycRejectedMessage: 'আপনার কেওয়াইসি প্রত্যাখ্যাত। কারণ পর্যালোচনা করে পুনঃজমা দিন।',
  kycApprovedMessage: 'আপনার কেওয়াইসি অনুমোদিত! এখন আপনি টিকেট বিক্রি ও ওয়ালেট ব্যবহার করতে পারবেন।',
  kycResubmit: 'কেওয়াইসি পুনঃজমা',
  verifiedBadge: 'যাচাইকৃত ব্যাজ',
  canSellTickets: 'টিকেট বিক্রি',
  canUseWallet: 'ওয়ালেট ব্যবহার',
  canWithdraw: 'টাকা উত্তোলন',
  nidDigitsWarning: 'এনআইডি ১০, ১৩ বা ১৭ সংখ্যার হতে হবে',
  uploadDocument: 'নথি আপলোড',
  selectDivision: 'বিভাগ নির্বাচন',
  selectDistrict: 'জেলা নির্বাচন',

  wallet: 'ওয়ালেট',
  availableBalance: 'উপলব্ধ ব্যালেন্স',
  pendingBalance: 'অপেক্ষমাণ ব্যালেন্স',
  escrowBalance: 'এসক্রো ব্যালেন্স',
  totalEarnings: 'মোট আয়',
  totalWithdrawn: 'মোট উত্তোলন',
  withdraw: 'উত্তোলন',
  withdrawMethod: 'উত্তোলন পদ্ধতি',
  bkash: 'বিকাশ',
  bankTransfer: 'ব্যাংক ট্রান্সফার',
  transactionHistory: 'লেনদেনের ইতিহাস',

  orders: 'অর্ডার',
  orderId: 'অর্ডার আইডি',
  orderDetails: 'অর্ডার বিস্তারিত',
  escrowStatus: 'এসক্রো স্ট্যাটাস',
  paymentStatus: 'পেমেন্ট স্ট্যাটাস',
  deliveryStatus: 'ডেলিভারি স্ট্যাটাস',
  deliveryMethod: 'ডেলিভারি পদ্ধতি',
  onlinePdf: 'অনলাইন পিডিএফ',
  inPerson: 'সরাসরি',
  courier: 'কুরিয়ার',
  held: 'অধীরক্ষিত',
  released: 'মুক্ত',
  refunded: 'ফেরত',
  paid: 'পরিশোধিত',
  pending: 'অপেক্ষমাণ',
  failed: 'ব্যর্থ',
  confirmed: 'নিশ্চিত',
  inProgress: 'চলমান',
  completed: 'সম্পন্ন',
  disputed: 'বিরোধিত',

  chat: 'চ্যাট',
  messages: 'বার্তা',
  sendMessage: 'বার্তা পাঠান',
  typeMessage: 'একটি বার্তা লিখুন...',

  reviews: 'রিভিউ',
  writeReview: 'রিভিউ লিখুন',
  rating: 'রেটিং',

  heroTitle: 'নিরাপদে টিকেট কিনুন ও বিক্রি করুন',
  heroSubtitle: 'বাংলাদেশে বাস, ট্রেন, ফ্লাইট ও লঞ্চ টিকেটের সবচেয়ে বিশ্বস্ত মার্কেটপ্লেস',
  searchTickets: 'টিকেট অনুসন্ধান',
  popularRoutes: 'জনপ্রিয় রুট',
  howItWorksTitle: 'কিভাবে কাজ করে',
  step1Title: 'টিকেট খুঁজুন',
  step1Desc: 'আপনার পছন্দের রুট ও যানবাহনের টিকেট খুঁজুন',
  step2Title: 'নিরাপদে পেমেন্ট',
  step2Desc: 'যাত্রা সম্পন্ন না হওয়া পর্যন্ত আপনার পেমেন্ট এসক্রোতে থাকে',
  step3Title: 'টিকেট পান',
  step3Desc: 'তাৎক্ষণিক বা সরাসরি টিকেট পান',
  step4Title: 'যাত্রা সম্পন্ন',
  step4Desc: 'সফল যাত্রার পর বিক্রেতা পেমেন্ট পান',
  whyChooseUs: 'কেন আমাদের বেছে নেবেন',
  featuredTickets: 'বিশেষ টিকেট',
  recentTickets: 'সাম্প্রতিক টিকেট',

  terms: 'সেবার শর্তাবলী',
  privacy: 'গোপনীয়তা নীতি',
  refund: 'ফেরত নীতি',
  paymentPolicy: 'পেমেন্ট নীতি',
  allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত',

  users: 'ব্যবহারকারী',
  kyc: 'কেওয়াইসি',
  payments: 'পেমেন্ট',
  escrow: 'এসক্রো',
  withdrawals: 'উত্তোলন',
  fraudReports: 'প্রতারণা রিপোর্ট',
  notifications: 'বিজ্ঞপ্তি',
  reports: 'রিপোর্ট',
  marketing: 'মার্কেটিং',
  seo: 'এসইও',
  cms: 'সিএমএস',
  businessSettings: 'ব্যবসায়িক সেটিংস',
  roles: 'ভূমিকা',
  permissions: 'অনুমতি',
  activityLogs: 'কার্যকলাপ লগ',

  bdt: '৳',
  verified: 'যাচাইকৃত',
  unverified: 'অযাচাইকৃত',
  seller: 'বিক্রেতা',
  buyer: 'ক্রেতা',
  from: 'থেকে',
  to: 'যাত্রা',
  date: 'তারিখ',
  time: 'সময়',
  status: 'স্ট্যাটাস',
  actions: 'কার্যক্রম',
  noData: 'কোনো তথ্য নেই',
  success: 'সফল',
  error: 'ত্রুটি',
  warning: 'সতর্কতা',
  info: 'তথ্য',
  language: 'ভাষা',
  appearance: 'অবয়ব',
  lightMode: 'লাইট',
  darkMode: 'ডার্ক',
  systemMode: 'সিস্টেম',
  security: 'নিরাপত্তা',
  notificationsSettings: 'বিজ্ঞপ্তি',
};

export const translations = { en, bn } as const;

export function t(key: keyof TranslationKeys, lang: Language = 'en'): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
