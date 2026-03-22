import axios from "axios";

// ─────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────
const baseUrl = import.meta.env.VITE_API_URL;
const apiUrl = `${baseUrl}/api`;

const http = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ─────────────────────────────────────────────
// Interfaces — Route & Geography
// ─────────────────────────────────────────────
export interface Route {
  id: string;
  name: string;
  nameEn: string;
}

export interface Province {
  id: string;
  name: string;
  nameEn: string;
  routeIds: string[];
}

export interface BoardingPoint {
  id: string;
  name: string;
  nameEn: string;
  provinceId: string;
}

// ─────────────────────────────────────────────
// Interfaces — Trip & Search
// ─────────────────────────────────────────────
export interface TripSearchParams {
  routeId?: string;
  originProvinceId: string;
  destinationProvinceId: string;
  date: string;
  passengerCount?: number;
}

export interface Trip {
  id: string;
  routeId: string;
  originProvinceId: string;
  destinationProvinceId: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  tripType: string;
  busType: string;
  date: string;
}

// ─────────────────────────────────────────────
// Interfaces — Seat
// ─────────────────────────────────────────────
export type SeatStatus = "available" | "booked" | "unavailable" | "selected";

export interface Seat {
  id: string;
  number: string;
  row: number;
  col: number;
  status: SeatStatus;
  floor: number;
}

export interface BusLayout {
  id: string;
  name: string;
  rows: (string | null)[][];
}

export interface TripSeatsResponse {
  tripId: string;
  layout: BusLayout;
  seats: Seat[];
}

// ─────────────────────────────────────────────
// Interfaces — Booking
// ─────────────────────────────────────────────
export interface PassengerPayload {
  seatId: string;
  seatNumber: string;
  fullName: string;
  thaiId: string;
  phone: string;
  passengerType: "child" | "male" | "female" | "monk";
}

export interface CreateBookingPayload {
  tripId: string;
  travelDate: string;
  originProvinceId: string;
  destinationProvinceId: string;
  boardingPointId: string;
  dropOffPointId: string;
  passengers: PassengerPayload[];
  promoCode?: string;
}

export interface BookingListItem {
  id: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  status: "upcoming" | "completed" | "cancelled";
  total: number;
}

export interface BookingDetail extends BookingListItem {
  boardingPoint: string;
  dropOffPoint: string;
  busType: string;
  tripType: string;
  busPlate: string;
  routeName: string;
  paymentMethod: string;
  promoCode: string;
  discount: number;
  pricePerSeat: number;
  bookingDate: string;
  passengers: {
    fullName: string;
    thaiId: string;
    phone: string;
    seatNumber: string;
    passengerType: string;
  }[];
}

export interface CreateBookingResponse {
  bookingId: string;
  status: string;
  total: number;
}

// ─────────────────────────────────────────────
// Interfaces — Promotion
// ─────────────────────────────────────────────
export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  promoCode: string;
  discountPercent: number;
  discountAmount: number;
  remainingQuota: number;
  expiryDate: string;
  validityDays: number;
  memberOnly: boolean;
}

export interface ValidatePromoResponse {
  valid: boolean;
  discountPercent: number;
  discountAmount: number;
  message?: string;
}

// ─────────────────────────────────────────────
// Interfaces — Payment
// ─────────────────────────────────────────────
export type PaymentSourceType = "promptpay" | "alipay" | "wechat_pay_mpm";

export interface CreateChargePayload {
  amount: number;
  sourceType: PaymentSourceType;
  bookingId?: string;
}

export interface CreateChargeResponse {
  chargeId: string;
  qrCodeUrl: string;
  status: string;
  expiresAt: string;
}

export interface ChargeStatusResponse {
  chargeId: string;
  status: "pending" | "success" | "failed" | "expired";
  paidAt?: string;
}

export interface TransactionDetail {
  id: string;
  status: string;
  amount: number;
  currency: string;
  source?: {
    scannable_code?: {
      image?: {
        download_uri: string;
      };
    };
  };
}

// ─────────────────────────────────────────────
// Interfaces — User & Auth
// ─────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  lineUserId?: string;
  avatarUrl?: string;
  points: number;
  walletBalance: number;
  memberSince: string;
}

// ─────────────────────────────────────────────
// Interfaces — Points & Wallet
// ─────────────────────────────────────────────
export interface PointHistoryItem {
  id: string;
  description: string;
  date: string;
  amount: number;
  points: number;
  type: "earn" | "redeem";
}

export interface PointsSummary {
  totalPoints: number;
  nextRewardAt: number;
  rewardValue: number; // baht per 10 points
}

export interface RedeemPointsPayload {
  points: number;
}

export interface RedeemPointsResponse {
  redeemedPoints: number;
  bahtAdded: number;
  newWalletBalance: number;
  remainingPoints: number;
}

export type TransactionType = "topup" | "payment" | "redeem";

export interface WalletTransaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  type: TransactionType;
}

export interface WalletSummary {
  balance: number;
  availablePoints: number;
  transactions: WalletTransaction[];
}

// ─────────────────────────────────────────────
// API — Route & Geography
// ─────────────────────────────────────────────

/** GET /routes — ดึงรายการเส้นทางทั้งหมด */
export const getRoutes = () =>
  http.get<Route[]>("/routes");

/** GET /provinces?routeId=xxx — ดึงจังหวัดตามเส้นทาง */
// export const getProvinces = (routeId?: string) =>
//   http.get<Province[]>("/provinces", { params: { routeId } });

export const getProvinces = async (routeId?: string) => {
  // return await http.get<Province[]>("/provinces", { params: { routeId } });
  const response = await http.get("/provinces", {
    params: routeId && {
      routeId: routeId
    }
  })
  console.log("getProvinces response ", response.data)
  return response.data
}

/** GET /boarding-points?provinceId=xxx — ดึงจุดขึ้น/ลงรถตามจังหวัด */
// export const getBoardingPoints = (provinceId?: string) =>
//   http.get<BoardingPoint[]>("/boarding-points", { params: { provinceId } });

export const getBoardingPoints = async (provinceId?: string) => {
  // return await http.get<Province[]>("/provinces", { params: { routeId } });
  const response = await http.get("/boarding-points", {
    params: provinceId && {
      provinceId: provinceId
    }
  })
  console.log("getBoardingPoints response ", response.data)
  return response.data
}

// ─────────────────────────────────────────────
// API — Trip (Search)
// ─────────────────────────────────────────────

/** GET /trips — ค้นหาเที่ยวรถ */
// export const searchTrips = (params: TripSearchParams) =>
//   http.get<Trip[]>("/trips", { params });
export const searchTrips = async (body) => {
  return await http.post<Trip[]>("/trips", body, {})
}
/** GET /trips/:id — ดึงข้อมูลเที่ยวรถเดียว */
export const getTripById = (tripId: string) =>
  http.get<Trip>(`/trips/${tripId}`);

/** GET /trips/:id/seats — ดึง layout + สถานะที่นั่งของเที่ยวรถ */
export const getTripSeats = (tripId: string) =>
  http.get<TripSeatsResponse>(`/trips/${tripId}/seats`);

// ─────────────────────────────────────────────
// API — Booking
// ─────────────────────────────────────────────

/** POST /bookings — สร้างการจอง */
export const createBooking = (payload: CreateBookingPayload) =>
  http.post<CreateBookingResponse>("/bookings", payload);

/** GET /bookings — ดึงรายการการจองของผู้ใช้ */
export const getMyBookings = (status?: "upcoming" | "completed" | "cancelled") =>
  http.get<BookingListItem[]>("/bookings", { params: { status } });

/** GET /bookings/:id — ดึงรายละเอียดการจอง */
export const getBookingById = (bookingId: string) =>
  http.get<BookingDetail>(`/bookings/${bookingId}`);

/** PATCH /bookings/:id/cancel — ยกเลิกการจอง */
export const cancelBooking = (bookingId: string) =>
  http.patch<{ success: boolean; message: string }>(`/bookings/${bookingId}/cancel`);

// ─────────────────────────────────────────────
// API — Promotion
// ─────────────────────────────────────────────

/** GET /promotions — ดึงรายการโปรโมชั่น */
export const getPromotions = (memberOnly?: boolean) =>
  http.get<Promotion[]>("/promotions", { params: { memberOnly } });

/** GET /promotions/:id — ดึงรายละเอียดโปรโมชั่น */
export const getPromotionById = (promoId: string) =>
  http.get<Promotion>(`/promotions/${promoId}`);

/** POST /promotions/validate — ตรวจสอบรหัสโปรโมชั่น */
export const validatePromoCode = (promoCode: string, tripId?: string) =>
  http.post<ValidatePromoResponse>("/promotions/validate", { promoCode, tripId });

// ─────────────────────────────────────────────
// API — Payment
// ─────────────────────────────────────────────

const sourceTypeToPath = (sourceType: PaymentSourceType) => {
  if (sourceType === "alipay") return "alipay-qr";
  if (sourceType === "wechat_pay_mpm") return "wechat-pay";
  return "qr"; // promptpay
};

/** POST /payment/:type — สร้าง QR charge สำหรับชำระเงิน */
export const createCharge = (total: number, sourceType: PaymentSourceType, bookingDetail: any) =>
  http.post<CreateChargeResponse>(
    `/payment/${sourceTypeToPath(sourceType)}`,
    bookingDetail,
    { params: { amount: total } }
  );

/** GET /payment/transaction/:id — ดึงรายละเอียด transaction */
export const getTransactionById = (id: string) =>
  http.get<{ charge: TransactionDetail }>(`/payment/transaction/${id}`);

/** GET /payment/transaction/:chargeId — ดึงสถานะการชำระเงิน (polling) */
export const getCharge = (chargeId: string) =>
  http.get<ChargeStatusResponse>(`/payment/transaction/${chargeId}`);

/** POST /payment/cancel/:chargeId — ยกเลิกรายการชำระเงิน */
export const cancelCharge = (chargeId: string) =>
  http.post(`/payment/cancel/${chargeId}`);

// ─────────────────────────────────────────────
// API — Auth
// ─────────────────────────────────────────────

/** POST /auth/login — เข้าสู่ระบบ */
export const login = (payload: LoginPayload) =>
  http.post<AuthResponse>("/auth/login", payload);

/** POST /auth/register — ลงทะเบียน */
export const register = (payload: RegisterPayload) =>
  http.post<AuthResponse>("/auth/register", payload);

/** POST /auth/line — เข้าสู่ระบบด้วย LINE LIFF token */
export const loginWithLine = (lineAccessToken: string) =>
  http.post<AuthResponse>("/auth/line", { lineAccessToken });

/** POST /auth/logout — ออกจากระบบ */
export const logout = () =>
  http.post<{ success: boolean }>("/auth/logout");

// ─────────────────────────────────────────────
// API — User Profile
// ─────────────────────────────────────────────

/** GET /users/me — ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบ */
export const getMyProfile = () =>
  http.get<UserProfile>("/users/me");

/** PATCH /users/me — อัปเดตข้อมูลผู้ใช้ */
export const updateMyProfile = (payload: Partial<Pick<UserProfile, "fullName" | "phone" | "email" | "avatarUrl">>) =>
  http.patch<UserProfile>("/users/me", payload);

// ─────────────────────────────────────────────
// API — Points
// ─────────────────────────────────────────────

/** GET /points — ดึงยอดแต้มสะสม */
export const getPointsSummary = () =>
  http.get<PointsSummary>("/points");

/** GET /points/history — ดึงประวัติแต้มสะสม */
export const getPointsHistory = () =>
  http.get<PointHistoryItem[]>("/points/history");

/** POST /points/redeem — แลกแต้มเป็นเงิน Wallet */
export const redeemPoints = (payload: RedeemPointsPayload) =>
  http.post<RedeemPointsResponse>("/points/redeem", payload);

// ─────────────────────────────────────────────
// API — Wallet
// ─────────────────────────────────────────────

/** GET /wallet — ดึงยอดเงิน + ประวัติธุรกรรม */
export const getWallet = () =>
  http.get<WalletSummary>("/wallet");

/** GET /wallet/transactions — ดึงประวัติธุรกรรมกระเป๋าเงิน */
export const getWalletTransactions = () =>
  http.get<WalletTransaction[]>("/wallet/transactions");

/** POST /wallet/topup — เติมเงินเข้ากระเป๋า */
export const topupWallet = (amount: number, sourceType: PaymentSourceType) =>
  http.post<{ chargeId: string; qrCodeUrl: string }>("/wallet/topup", { amount, sourceType });

export default http;