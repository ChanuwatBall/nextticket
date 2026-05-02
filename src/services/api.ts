// import axios from "axios";

import axios from "axios";
const baseUrl = import.meta.env.VITE_API_URL;
const socketUrl = import.meta.env.VITE_SOCKET_URL;


const api = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", cors: "*" },
});


export const login = async (body: any) => {
  return await api.post("/api/auth/login", body)
    .then((res) => {
      console.log("login res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("login err ", err)
      return err.response.data
    })
}

export const register = async (body: any) => {
  return await api.post("/api/auth/register", body)
    .then((res) => {
      console.log("register res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("register err ", err)
      return err.response.data
    })
}

export const loginWithLine = async (body: { lineAccessToken: string }) => {
  return await api.post("/api/auth/line", {
    "lineAccessToken": body.lineAccessToken
  })
    .then((res) => {
      console.log("loginWithLine res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("loginWithLine err ", err)
      // err.response อาจเป็น undefined เมื่อเกิด network error / CORS
      return err?.response?.data ?? null
    })
}

export const logout = async () => {
  const userstr = localStorage.getItem("user")
  const user = JSON.parse(userstr || "{}")
  return await api.post("/api/auth/logout", {}, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("logout res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("logout err ", err)
      return err.response.data
    })
}

export type NewBooking = {
  "tripId": string,
  "travelDate": string,
  "originProvinceId": string,
  "destinationProvinceId": string,
  "boardingPointId": string,
  "dropOffPointId": string,
  "passengers": {
    "seatId": string,
    "seatNumber": string,
    "fullName": string,
    "thaiId": string,
    "phone": string,
    "passengerType": string
  }[],
  "promoCode": string
  "omiseChargeId": string
}
export const createBooking = async (body: NewBooking) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  console.log("user ", user)
  return await api.post("/api/bookings", body, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("bookings res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("bookings err ", err)
      return err.response.data
    })
}


export const bookingList = (page = 1, limit = 10) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  return api.get(`/api/bookings`, {
    params: { page, limit },
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("bookingList res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("bookingList err ", err)
      return err.response.data
    })
}

export const bookingDetail = async ({ id, token }: any) => {
  return await api.get(`/api/bookings/${id}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then((res) => {
      console.log("bookingDetail res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("bookingDetail err ", err)
      return err.response.data
    })
}
export const tripSeatsLayout = async (tripid: string) => {
  // curl '/api/trips/{id}/seats'
  return await api.get(`/api/trips/${tripid}/seats`)
    .then((res) => {
      console.log("tripSeatsLayout res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("tripSeatsLayout err ", err)
      return err.response.data
    })
}

export const getTripDetail = async (tripid: string) => {
  //https://nex-api.rubyclaw.tech/api/trips/{id}
  return await api.get(`/api/trips/${tripid}`)
    .then((res) => {
      console.log("tripDetail res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("tripDetail err ", err)
      return err.response.data
    })
}


export const chargeWechatPayment = async (amount: any) => {
  return await api.post("/api/payment/wechat-pay?amount=" + amount, {
    amount: amount
  })
    .then((res) => {
      console.log("chargeWechatPayment res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("chargeWechatPayment err ", err)
      return err.response.data
    })
}

export const chargeAlipayPayment = async (amount: any) => {
  return await api.post("/api/payment/alipay-qr?amount=" + amount, {
    amount: amount
  })
    .then((res) => {
      console.log("chargeAlipayPayment res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("chargeAliPayment err ", err)
      return err.response.data
    })
}

export const chargeQrPayment = async (amount: any) => {
  return await api.post("/api/payment/qr", {
    amount: amount
  })
    .then((res) => {
      console.log("chargeQrPayment res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("chargeQrPayment err ", err)
      return err.response.data
    })
}

export const paymentStatus = async (chargeId: string) => {
  // https://nex-api.rubyclaw.tech/api/payment/transaction/{id}
  return await api.get(`/api/payment/transaction/${chargeId}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  })
    .then((res) => {
      console.log("paymentStatus res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("paymentStatus err ", err)
      return err.response.data
    })
}

export const userPoints = async () => {
  const userstr = localStorage.getItem("user")
  const user = JSON.parse(userstr || "{}")
  return await api.get(`/api/points/`, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("userPoints res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("userPoints err ", err)
      return err.response.data
    })
}

export const getpointHistory = async () => {
  const userstr = localStorage.getItem("user")
  const user = JSON.parse(userstr || "{}")
  return await api.get(`/api/points/history`, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("getpointHistory res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("getpointHistory err ", err)
      return err.response.data
    })
}

export const getWalletPoint = async () => {
  const userstr = localStorage.getItem("user")
  const user = JSON.parse(userstr || "{}")
  return await api.get(`/api/wallet/`, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("getWalletPoint res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("getWalletPoint err ", err)
      return err.response.data
    })
}

export const getUserMe = async () => {
  const userstr = localStorage.getItem("user")
  const user = JSON.parse(userstr || "{}")
  return await api.get(`/api/users/me`, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("getUserMe res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("getUserMe err ", err)
      return err.response.data
    })
}

export const updateMyProfile = async (body: { fullName?: string, phone?: string, email?: string, avatarUrl?: string }) => {
  const userstr = localStorage.getItem("user")
  const user = JSON.parse(userstr || "{}")
  return await api.patch(`/api/users/me`, body, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("updateMyProfile res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("updateMyProfile err ", err)
      return err.response.data
    })
}

// curl '/api/bookings/{id}/cancel' \
//   --request PATCH \
//   --header 'Authorization: Bearer YOUR_SECRET_TOKEN'

export const cancelBooking = (bookingId: string) => {
  const userstr = localStorage.getItem("user")
  const user = JSON.parse(userstr || "{}")
  return api.patch(`/api/bookings/${bookingId}/cancel`, {}, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("cancelBooking res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("cancelCharge err ", err)
      return err.response.data
    })
}

export const cancelCharge = (chargeId: string) => {
  const userstr = localStorage.getItem("user")
  const user = JSON.parse(userstr || "{}")
  return api.post(`/api/payment/cancel/${chargeId}`, {}, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("cancelCharge res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("cancelCharge err ", err)
      return err.response.data
    })
}

export const checkinSelf = async (body: { ticketNumber: string, qrCode: string }) => {
  const userstr = localStorage.getItem("user")
  const user = JSON.parse(userstr || "{}")
  return await api.post("/api/checkin/self", body, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("checkinSelf res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("checkinSelf err ", err)
      return err.response.data
    })
}

export const createComplaint = async (body: {
  reporter_phone: string;
  complaint_text: string;
  vehicle_plate: string;
  trip_id: string;
  seat_code: string;
}) => {
  const userstr = localStorage.getItem("user");
  const user = JSON.parse(userstr || "{}");
  return await api.post("/api/complaints", body, {
    headers: {
      "Authorization": `Bearer ${user.token}`
    }
  })
    .then((res) => {
      console.log("createComplaint res ", res);
      return res.data;
    })
    .catch((err) => {
      console.log("createComplaint err ", err);
      return err.response.data;
    });
};

export const getPromotions = async () => {
  return await api.get(`/api/promotions`)
    .then((res) => {
      console.log("getPromotions res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("getPromotions err ", err)
      return err.response.data
    })
}

export const getPromotionDetail = async (id: string) => {
  return await api.get(`/api/promotions/${id}`)
    .then((res) => {
      console.log("getPromotionDetail res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("getPromotionDetail err ", err)
      return err.response.data
    })
}

// curl https://nex-api.rubyclaw.tech/api/promotions/validate \
//   --request POST \
//   --header 'Content-Type: application/json' \
//   --data '{
//   "promoCode": "",
//   "tripId": ""
// }'

export const validatePromo = async (promoCode: string, tripId: string) => {
  return await api.post(`/api/promotions/validate`, {
    promoCode,
    tripId
  })
    .then((res) => {
      console.log("validatePromo res ", res)
      return res.data
    })
    .catch((err) => {
      console.log("validatePromo err ", err)
      return err.response.data
    })
}

// // ─────────────────────────────────────────────
// // Axios Instance
// // ─────────────────────────────────────────────
// const apiUrl = `${baseUrl}/api`;

const http = axios.create({
  baseURL: socketUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json", 'ngrok-skip-browser-warning': 'true' },
});

// // ─────────────────────────────────────────────
// // Interfaces — Route & Geography
// // ─────────────────────────────────────────────
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

// // ─────────────────────────────────────────────
// // Interfaces — Trip & Search
// // ─────────────────────────────────────────────
// export interface TripSearchParams {
//   routeId?: string;
//   originProvinceId: string;
//   destinationProvinceId: string;
//   date: string;
//   passengerCount?: number;
// }

export interface Trip {
  id: string;
  route_id: string;
  origin_province_id: string;
  destination_province_id: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  total_seats: number;
  trip_type: string;
  bus_type_id: {
    id: string;
    name: string;
  };
  date: string;
  origin: string;
  destination: string;
}

// // ─────────────────────────────────────────────
// // Interfaces — Seat
// // ─────────────────────────────────────────────
export type SeatStatus = "available" | "booked" | "unavailable" | "selected";

export interface Seat {
  id: string;
  number: string;
  row: number;
  col: number;
  status: SeatStatus;
  floor: number;
  type?: string;
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

// // ─────────────────────────────────────────────
// // Interfaces — Booking
// // ─────────────────────────────────────────────
// export interface PassengerPayload {
//   seatId: string;
//   seatNumber: string;
//   fullName: string;
//   thaiId: string;
//   phone: string;
//   passengerType: "child" | "male" | "female" | "monk";
// }

// export interface CreateBookingPayload {
//   tripId: string;
//   travelDate: string;
//   originProvinceId: string;
//   destinationProvinceId: string;
//   boardingPointId: string;
//   dropOffPointId: string;
//   passengers: PassengerPayload[];
//   promoCode?: string;
// }

// export interface BookingListItem {
//   id: string;
//   origin: string;
//   destination: string;
//   date: string;
//   departureTime: string;
//   arrivalTime: string;
//   seats: string[];
//   status: "upcoming" | "completed" | "cancelled";
//   total: number;
// }

// export interface BookingDetail extends BookingListItem {
//   boardingPoint: string;
//   dropOffPoint: string;
//   busType: string;
//   tripType: string;
//   busPlate: string;
//   routeName: string;
//   paymentMethod: string;
//   promoCode: string;
//   discount: number;
//   pricePerSeat: number;
//   bookingDate: string;
//   passengers: {
//     fullName: string;
//     thaiId: string;
//     phone: string;
//     seatNumber: string;
//     passengerType: string;
//   }[];
// }

// export interface CreateBookingResponse {
//   bookingId: string;
//   status: string;
//   total: number;
// }

// // ─────────────────────────────────────────────
// // Interfaces — Promotion
// // ─────────────────────────────────────────────
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

// export interface ValidatePromoResponse {
//   valid: boolean;
//   discountPercent: number;
//   discountAmount: number;
//   message?: string;
// }

// // ─────────────────────────────────────────────
// // Interfaces — Payment
// // ─────────────────────────────────────────────
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

// export interface ChargeStatusResponse {
//   chargeId: string;
//   status: "pending" | "success" | "failed" | "expired";
//   paidAt?: string;
// }

// export interface TransactionDetail {
//   id: string;
//   status: string;
//   amount: number;
//   currency: string;
//   source?: {
//     scannable_code?: {
//       image?: {
//         download_uri: string;
//       };
//     };
//   };
// }

// // ─────────────────────────────────────────────
// // Interfaces — User & Auth
// // ─────────────────────────────────────────────
// export interface LoginPayload {
//   email: string;
//   password: string;
// }

// export interface RegisterPayload {
//   fullName: string;
//   phone: string;
//   email: string;
//   password: string;
// }

// export interface AuthResponse {
//   token: string;
//   user: UserProfile;
// }

// export interface UserProfile {
//   id: string;
//   fullName: string;
//   phone: string;
//   email: string;
//   lineUserId?: string;
//   avatarUrl?: string;
//   points: number;
//   walletBalance: number;
//   memberSince: string;
// }

// // ─────────────────────────────────────────────
// // Interfaces — Points & Wallet
// // ─────────────────────────────────────────────
// export interface PointHistoryItem {
//   id: string;
//   description: string;
//   date: string;
//   amount: number;
//   points: number;
//   type: "earn" | "redeem";
// }

// export interface PointsSummary {
//   totalPoints: number;
//   nextRewardAt: number;
//   rewardValue: number; // baht per 10 points
// }

// export interface RedeemPointsPayload {
//   points: number;
// }

// export interface RedeemPointsResponse {
//   redeemedPoints: number;
//   bahtAdded: number;
//   newWalletBalance: number;
//   remainingPoints: number;
// }

// export type TransactionType = "topup" | "payment" | "redeem";

// export interface WalletTransaction {
//   id: string;
//   description: string;
//   date: string;
//   amount: number;
//   type: TransactionType;
// }

// export interface WalletSummary {
//   balance: number;
//   availablePoints: number;
//   transactions: WalletTransaction[];
// }

// // ─────────────────────────────────────────────
// // API — Route & Geography
// // ─────────────────────────────────────────────

// /** GET /routes — ดึงรายการเส้นทางทั้งหมด */
// export const getRoutes = () =>
//   http.get<Route[]>("/routes");

// /** GET /provinces?routeId=xxx — ดึงจังหวัดตามเส้นทาง */
// // export const getProvinces = (routeId?: string) =>
// //   http.get<Province[]>("/provinces", { params: { routeId } });

// export const getProvinces = async (routeId?: string) => {
//   // return await http.get<Province[]>("/provinces", { params: { routeId } });
//   const response = await http.get("/provinces", {
//     params: routeId && {
//       routeId: routeId
//     }
//   })
//   console.log("getProvinces response ", response.data)
//   return response.data
// }

// /** GET /boarding-points?provinceId=xxx — ดึงจุดขึ้น/ลงรถตามจังหวัด */
// // export const getBoardingPoints = (provinceId?: string) =>
// //   http.get<BoardingPoint[]>("/boarding-points", { params: { provinceId } });

// export const getBoardingPoints = async (provinceId?: string) => {
//   // return await http.get<Province[]>("/provinces", { params: { routeId } });
//   const response = await http.get("/boarding-points", {
//     params: provinceId && {
//       provinceId: provinceId
//     }
//   })
//   console.log("getBoardingPoints response ", response.data)
//   return response.data
// }

// // ─────────────────────────────────────────────
// // API — Trip (Search)
// // ─────────────────────────────────────────────

// /** GET /trips — ค้นหาเที่ยวรถ */
// // export const searchTrips = (params: TripSearchParams) =>
// //   http.get<Trip[]>("/trips", { params });
// export const searchTrips = async (body) => {
//   return await http.post<Trip[]>("/trips", body, {})
// }
// /** GET /trips/:id — ดึงข้อมูลเที่ยวรถเดียว */
// export const getTripById = (tripId: string) =>
//   http.get<Trip>(`/trips/${tripId}`);

// /** GET /trips/:id/seats — ดึง layout + สถานะที่นั่งของเที่ยวรถ */
// export const getTripSeats = (tripId: string) =>
//   http.get<TripSeatsResponse>(`/trips/${tripId}/seats`);

// // ─────────────────────────────────────────────
// // API — Booking
// // ─────────────────────────────────────────────

// /** POST /bookings — สร้างการจอง */
// export const createBooking = (payload: CreateBookingPayload) =>
//   http.post<CreateBookingResponse>("/bookings", payload);

// /** GET /bookings — ดึงรายการการจองของผู้ใช้ */
// export const getMyBookings = (status?: "upcoming" | "completed" | "cancelled") =>
//   http.get<BookingListItem[]>("/bookings", { params: { status } });

// /** GET /bookings/:id — ดึงรายละเอียดการจอง */
// export const getBookingById = (bookingId: string) =>
//   http.get<BookingDetail>(`/bookings/${bookingId}`);

// /** PATCH /bookings/:id/cancel — ยกเลิกการจอง */
// export const cancelBooking = (bookingId: string) =>
//   http.patch<{ success: boolean; message: string }>(`/bookings/${bookingId}/cancel`);

// // ─────────────────────────────────────────────
// // API — Promotion
// // ─────────────────────────────────────────────

// /** GET /promotions — ดึงรายการโปรโมชั่น */
// export const getPromotions = (memberOnly?: boolean) =>
//   http.get<Promotion[]>("/promotions", { params: { memberOnly } });

// /** GET /promotions/:id — ดึงรายละเอียดโปรโมชั่น */
// export const getPromotionById = (promoId: string) =>
//   http.get<Promotion>(`/promotions/${promoId}`);

// /** POST /promotions/validate — ตรวจสอบรหัสโปรโมชั่น */
// export const validatePromoCode = (promoCode: string, tripId?: string) =>
//   http.post<ValidatePromoResponse>("/promotions/validate", { promoCode, tripId });

// // ─────────────────────────────────────────────
// // API — Payment
// // ─────────────────────────────────────────────

const sourceTypeToPath = (sourceType: PaymentSourceType) => {
  if (sourceType === "alipay") return "alipay-qr";
  if (sourceType === "wechat_pay_mpm") return "wechat-pay";
  return "qr"; // promptpay
};

// /** POST /payment/:type — สร้าง QR charge สำหรับชำระเงิน */
export const createCharge = (total: number, sourceType: PaymentSourceType, bookingDetail: any) =>
  http.post<CreateChargeResponse>(
    `/api/payment/${sourceTypeToPath(sourceType)}`,
    bookingDetail,
    { params: { amount: total } }
  );

// /** GET /payment/transaction/:id — ดึงรายละเอียด transaction */
// export const getTransactionById = (id: string) =>
//   http.get<{ charge: TransactionDetail }>(`/payment/transaction/${id}`);

// /** GET /payment/transaction/:chargeId — ดึงสถานะการชำระเงิน (polling) */
// export const getCharge = (chargeId: string) =>
//   http.get<ChargeStatusResponse>(`/payment/transaction/${chargeId}`);

// /** POST /payment/cancel/:chargeId — ยกเลิกรายการชำระเงิน */
// export const cancelCharge = (chargeId: string) =>
//   http.post(`/api/payment/cancel/${chargeId}`);

// // ─────────────────────────────────────────────
// // API — Auth
// // ─────────────────────────────────────────────

// /** POST /auth/login — เข้าสู่ระบบ */
// export const login = (payload: LoginPayload) =>
//   http.post<AuthResponse>("/auth/login", payload);

// /** POST /auth/register — ลงทะเบียน */
// export const register = (payload: RegisterPayload) =>
//   http.post<AuthResponse>("/auth/register", payload);

// /** POST /auth/line — เข้าสู่ระบบด้วย LINE LIFF token */
// export const loginWithLine = (lineAccessToken: string) =>
//   http.post<AuthResponse>("/auth/line", { lineAccessToken });

// /** POST /auth/logout — ออกจากระบบ */
// export const logout = () =>
//   http.post<{ success: boolean }>("/auth/logout");

// // ─────────────────────────────────────────────
// // API — User Profile
// // ─────────────────────────────────────────────

// /** GET /users/me — ดึงข้อมูลผู้ใช้ที่เข้าสู่ระบบ */
// export const getMyProfile = () =>
//   http.get<UserProfile>("/users/me");

// /** PATCH /users/me — อัปเดตข้อมูลผู้ใช้ */
// export const updateMyProfile = (payload: Partial<Pick<UserProfile, "fullName" | "phone" | "email" | "avatarUrl">>) =>
//   http.patch<UserProfile>("/users/me", payload);

// // ─────────────────────────────────────────────
// // API — Points
// // ─────────────────────────────────────────────

// /** GET /points — ดึงยอดแต้มสะสม */
// export const getPointsSummary = () =>
//   http.get<PointsSummary>("/points");

// /** GET /points/history — ดึงประวัติแต้มสะสม */
// export const getPointsHistory = () =>
//   http.get<PointHistoryItem[]>("/points/history");

// /** POST /points/redeem — แลกแต้มเป็นเงิน Wallet */
// export const redeemPoints = (payload: RedeemPointsPayload) =>
//   http.post<RedeemPointsResponse>("/points/redeem", payload);

// // ─────────────────────────────────────────────
// // API — Wallet
// // ─────────────────────────────────────────────

// /** GET /wallet — ดึงยอดเงิน + ประวัติธุรกรรม */
// export const getWallet = () =>
//   http.get<WalletSummary>("/wallet");

// /** GET /wallet/transactions — ดึงประวัติธุรกรรมกระเป๋าเงิน */
// export const getWalletTransactions = () =>
//   http.get<WalletTransaction[]>("/wallet/transactions");

// /** POST /wallet/topup — เติมเงินเข้ากระเป๋า */
// export const topupWallet = (amount: number, sourceType: PaymentSourceType) =>
//   http.post<{ chargeId: string; qrCodeUrl: string }>("/wallet/topup", { amount, sourceType });

// export default http;

