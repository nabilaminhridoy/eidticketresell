export const APP_NAME = 'Eid Ticket Resell';
export const APP_URL = 'https://eidticketresell.com';
export const APP_DESCRIPTION = 'A secure marketplace for buying and selling Bus, Train, Flight & Launch tickets in Bangladesh';

export const TRANSPORT_TYPES = [
  { id: 'bus', label: 'Bus', labelBn: 'বাস', icon: 'Bus' },
  { id: 'train', label: 'Train', labelBn: 'ট্রেন', icon: 'Train' },
  { id: 'flight', label: 'Flight', labelBn: 'ফ্লাইট', icon: 'Plane' },
  { id: 'launch', label: 'Launch', labelBn: 'লঞ্চ', icon: 'Ship' },
] as const;

export const POPULAR_ROUTES = [
  { from: 'Dhaka', to: 'Chittagong', fromBn: 'ঢাকা', toBn: 'চট্টগ্রাম' },
  { from: 'Dhaka', to: 'Sylhet', fromBn: 'ঢাকা', toBn: 'সিলেট' },
  { from: 'Dhaka', to: 'Rajshahi', fromBn: 'ঢাকা', toBn: 'রাজশাহী' },
  { from: 'Dhaka', to: 'Khulna', fromBn: 'ঢাকা', toBn: 'খুলনা' },
  { from: 'Dhaka', to: "Cox's Bazar", fromBn: 'ঢাকা', toBn: 'কক্সবাজার' },
  { from: 'Dhaka', to: 'Barishal', fromBn: 'ঢাকা', toBn: 'বরিশাল' },
  { from: 'Chittagong', to: "Cox's Bazar", fromBn: 'চট্টগ্রাম', toBn: 'কক্সবাজার' },
  { from: 'Dhaka', to: 'Rangpur', fromBn: 'ঢাকা', toBn: 'রংপুর' },
];

export const BD_CITIES = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal',
  'Rangpur', 'Mymensingh', "Cox's Bazar", 'Comilla', 'Gazipur', 'Narayanganj',
  'Jessore', 'Bogra', 'Dinajpur', 'Tangail', 'Brahmanbaria', 'Narsingdi',
  'Savar', 'Manikganj', 'Munshiganj', 'Faridpur', 'Chandpur', 'Noakhali',
  'Feni', 'Pabna', 'Kushtia', 'Habiganj', 'Sunamganj', 'Moulvibazar',
  'Sherpur', 'Netrokona', 'Jamalpur', 'Kishoreganj', 'Lakshmipur',
];

export const TICKET_STATUS = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  sold: { label: 'Sold', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  pending_review: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
};

export const PLATFORM_FEE_PERCENTAGE = 2;
export const PLATFORM_FEE_MINIMUM = 20;

export const ROLES = {
  guest: 'Guest',
  user: 'User',
  verified_seller: 'Verified Seller',
  admin: 'Admin',
  super_admin: 'Super Admin',
};
