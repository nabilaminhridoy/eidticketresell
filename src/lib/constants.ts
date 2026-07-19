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

export const BD_DIVISIONS = [
  { id: 'dhaka', label: 'Dhaka', labelBn: 'ঢাকা' },
  { id: 'chittagong', label: 'Chittagong', labelBn: 'চট্টগ্রাম' },
  { id: 'rajshahi', label: 'Rajshahi', labelBn: 'রাজশাহী' },
  { id: 'khulna', label: 'Khulna', labelBn: 'খুলনা' },
  { id: 'barishal', label: 'Barishal', labelBn: 'বরিশাল' },
  { id: 'sylhet', label: 'Sylhet', labelBn: 'সিলেট' },
  { id: 'rangpur', label: 'Rangpur', labelBn: 'রংপুর' },
  { id: 'mymensingh', label: 'Mymensingh', labelBn: 'ময়মনসিংহ' },
] as const;

export const BD_DISTRICTS: Record<string, Array<{ label: string; labelBn: string }>> = {
  dhaka: [
    { label: 'Dhaka', labelBn: 'ঢাকা' }, { label: 'Gazipur', labelBn: 'গাজীপুর' },
    { label: 'Narayanganj', labelBn: 'নারায়ণগঞ্জ' }, { label: 'Narsingdi', labelBn: 'নরসিংদী' },
    { label: 'Manikganj', labelBn: 'মানিকগঞ্জ' }, { label: 'Munshiganj', labelBn: 'মুন্সিগঞ্জ' },
    { label: 'Madaripur', labelBn: 'মাদারীপুর' }, { label: 'Faridpur', labelBn: 'ফরিদপুর' },
    { label: 'Gopalganj', labelBn: 'গোপালগঞ্জ' }, { label: 'Tangail', labelBn: 'টাঙ্গাইল' },
    { label: 'Kishoreganj', labelBn: 'কিশোরগঞ্জ' }, { label: 'Shariatpur', labelBn: 'শরীয়তপুর' },
    { label: 'Rajbari', labelBn: 'রাজবাড়ী' },
  ],
  chittagong: [
    { label: 'Chittagong', labelBn: 'চট্টগ্রাম' }, { label: "Cox's Bazar", labelBn: 'কক্সবাজার' },
    { label: 'Comilla', labelBn: 'কুমিল্লা' }, { label: 'Feni', labelBn: 'ফেনী' },
    { label: 'Brahmanbaria', labelBn: 'ব্রাহ্মণবাড়িয়া' }, { label: 'Noakhali', labelBn: 'নোয়াখালী' },
    { label: 'Chandpur', labelBn: 'চাঁদপুর' }, { label: 'Lakshmipur', labelBn: 'লক্ষ্মীপুর' },
    { label: 'Rangamati', labelBn: 'রাঙ্গামাটি' }, { label: 'Bandarban', labelBn: 'বান্দরবান' },
    { label: 'Khagrachhari', labelBn: 'খাগড়াছড়ি' },
  ],
  rajshahi: [
    { label: 'Rajshahi', labelBn: 'রাজশাহী' }, { label: 'Bogra', labelBn: 'বগুড়া' },
    { label: 'Pabna', labelBn: 'পাবনা' }, { label: 'Natore', labelBn: 'নাটোর' },
    { label: 'Nawabganj', labelBn: 'নবাবগঞ্জ' }, { label: 'Naogaon', labelBn: 'নওগাঁ' },
    { label: 'Joypurhat', labelBn: 'জয়পুরহাট' }, { label: 'Sirajganj', labelBn: 'সিরাজগঞ্জ' },
  ],
  khulna: [
    { label: 'Khulna', labelBn: 'খুলনা' }, { label: 'Jessore', labelBn: 'যশোর' },
    { label: 'Satkhira', labelBn: 'সাতক্ষীরা' }, { label: 'Bagerhat', labelBn: 'বাগেরহাট' },
    { label: 'Magura', labelBn: 'মাগুরা' }, { label: 'Meherpur', labelBn: 'মেহেরপুর' },
    { label: 'Narail', labelBn: 'নড়াইল' }, { label: 'Chuadanga', labelBn: 'চুয়াডাঙ্গা' },
    { label: 'Kushtia', labelBn: 'কুষ্টিয়া' }, { label: 'Jhenaidah', labelBn: 'ঝিনাইদহ' },
  ],
  barishal: [
    { label: 'Barishal', labelBn: 'বরিশাল' }, { label: 'Patuakhali', labelBn: 'পটুয়াখালী' },
    { label: 'Barguna', labelBn: 'বরগুনা' }, { label: 'Bhola', labelBn: 'ভোলা' },
    { label: 'Pirojpur', labelBn: 'পিরোজপুর' }, { label: 'Jhalokati', labelBn: 'ঝালকাঠি' },
  ],
  sylhet: [
    { label: 'Sylhet', labelBn: 'সিলেট' }, { label: 'Habiganj', labelBn: 'হবিগঞ্জ' },
    { label: 'Sunamganj', labelBn: 'সুনামগঞ্জ' }, { label: 'Moulvibazar', labelBn: 'মৌলভীবাজার' },
  ],
  rangpur: [
    { label: 'Rangpur', labelBn: 'রংপুর' }, { label: 'Dinajpur', labelBn: 'দিনাজপুর' },
    { label: 'Kurigram', labelBn: 'কুড়িগ্রাম' }, { label: 'Lalmonirhat', labelBn: 'লালমনিরহাট' },
    { label: 'Nilphamari', labelBn: 'নীলফামারী' }, { label: 'Gaibandha', labelBn: 'গাইবান্ধা' },
    { label: 'Thakurgaon', labelBn: 'ঠাকুরগাঁও' }, { label: 'Panchagarh', labelBn: 'পঞ্চগড়' },
  ],
  mymensingh: [
    { label: 'Mymensingh', labelBn: 'ময়মনসিংহ' }, { label: 'Jamalpur', labelBn: 'জামালপুর' },
    { label: 'Sherpur', labelBn: 'শেরপুর' }, { label: 'Netrokona', labelBn: 'নেত্রকোণা' },
    { label: 'Kishoreganj', labelBn: 'কিশোরগঞ্জ' },
  ],
};

export const ALL_BD_DISTRICTS = Object.values(BD_DISTRICTS)
  .flat()
  .filter((dist, idx, arr) => arr.findIndex((d) => d.label === dist.label) === idx)
  .sort((a, b) => a.label.localeCompare(b.label));

export const BUS_CLASSES = [
  { id: 'non_ac', label: 'Non AC', labelBn: 'নন এসি' },
  { id: 'ac_economy', label: 'AC Economy', labelBn: 'এসি ইকোনমি' },
  { id: 'ac_business', label: 'AC Business', labelBn: 'এসি বিজনেস' },
  { id: 'ac_double_decker', label: 'AC Double Decker', labelBn: 'এসি ডাবল ডেকার' },
  { id: 'ac_sleeper', label: 'AC Sleeper', labelBn: 'এসি স্লিপার' },
  { id: 'ac_suite_sleeper', label: 'AC Suite Class Sleeper', labelBn: 'এসি স্যুট ক্লাস স্লিপার' },
] as const;

export const DECK_TYPES = [
  { id: 'upper', label: 'Upper Deck', labelBn: 'আপার ডেক' },
  { id: 'lower', label: 'Lower Deck', labelBn: 'লোয়ার ডেক' },
] as const;

export const COURIER_COMPANIES = [
  { id: 'pathao', label: 'Pathao', labelBn: 'পাঠাও' },
  { id: 'steadfast', label: 'Steadfast', labelBn: 'স্টেডফাস্ট' },
  { id: 'redex', label: 'Redex', labelBn: 'রেডেক্স' },
  { id: 'paperfly', label: 'Paperfly', labelBn: 'পেপারফ্লাই' },
  { id: 'carrybee', label: 'CarryBee', labelBn: 'ক্যারিবি' },
  { id: 'ecourier', label: 'eCourier', labelBn: 'ই-কুরিয়ার' },
] as const;

export const DELIVERY_SPEEDS = [
  { id: 'normal', label: 'Normal', labelBn: 'সাধারণ' },
  { id: 'express', label: 'Express', labelBn: 'এক্সপ্রেস' },
] as const;

export const DECK_REQUIRED_CLASSES = ['ac_double_decker', 'ac_sleeper', 'ac_suite_sleeper'];
