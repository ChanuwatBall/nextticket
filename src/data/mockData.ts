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

export type SeatStatus = 'available' | 'booked' | 'unavailable' | 'selected';

export interface Seat {
  id: string;
  number: string;
  row: number;
  col: number;
  status: SeatStatus;
  floor: number;
}

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

export const routes: Route[] = [
  { id: 'southern', name: 'สายใต้', nameEn: 'Southern Line' },
  { id: 'northern', name: 'สายเหนือ', nameEn: 'Northern Line' },
  { id: 'northeast', name: 'สายอีสาน', nameEn: 'Northeastern Line' },
  { id: 'eastern', name: 'สายตะวันออก', nameEn: 'Eastern Line' },
];

export const provinces: Province[] = [
  { id: 'bkk', name: 'กรุงเทพฯ', nameEn: 'Bangkok', routeIds: ['southern', 'northern', 'northeast', 'eastern'] },
  { id: 'cnx', name: 'เชียงใหม่', nameEn: 'Chiang Mai', routeIds: ['northern'] },
  { id: 'cri', name: 'เชียงราย', nameEn: 'Chiang Rai', routeIds: ['northern'] },
  { id: 'nkr', name: 'นครราชสีมา', nameEn: 'Nakhon Ratchasima', routeIds: ['northeast'] },
  { id: 'udn', name: 'อุดรธานี', nameEn: 'Udon Thani', routeIds: ['northeast'] },
  { id: 'skn', name: 'สุราษฎร์ธานี', nameEn: 'Surat Thani', routeIds: ['southern'] },
  { id: 'hdy', name: 'หาดใหญ่', nameEn: 'Hat Yai', routeIds: ['southern'] },
  { id: 'pty', name: 'พัทยา', nameEn: 'Pattaya', routeIds: ['eastern'] },
  { id: 'ryn', name: 'ระยอง', nameEn: 'Rayong', routeIds: ['eastern'] },
];

export const boardingPoints: BoardingPoint[] = [
  { id: 'bkk-mo-chit', name: 'หมอชิต 2', nameEn: 'Mo Chit 2', provinceId: 'bkk' },
  { id: 'bkk-sai-tai', name: 'สายใต้ใหม่', nameEn: 'Southern Terminal', provinceId: 'bkk' },
  { id: 'bkk-ekkamai', name: 'เอกมัย', nameEn: 'Ekkamai', provinceId: 'bkk' },
  { id: 'cnx-arcade', name: 'อาเขต', nameEn: 'Arcade Bus Terminal', provinceId: 'cnx' },
  { id: 'cri-terminal', name: 'สถานีขนส่งเชียงราย', nameEn: 'Chiang Rai Terminal', provinceId: 'cri' },
  { id: 'nkr-terminal', name: 'สถานีขนส่งโคราช', nameEn: 'Korat Terminal', provinceId: 'nkr' },
  { id: 'udn-terminal', name: 'สถานีขนส่งอุดร', nameEn: 'Udon Terminal', provinceId: 'udn' },
  { id: 'skn-terminal', name: 'สถานีขนส่งสุราษฎร์', nameEn: 'Surat Terminal', provinceId: 'skn' },
  { id: 'hdy-terminal', name: 'สถานีขนส่งหาดใหญ่', nameEn: 'Hat Yai Terminal', provinceId: 'hdy' },
  { id: 'pty-terminal', name: 'สถานีขนส่งพัทยา', nameEn: 'Pattaya Terminal', provinceId: 'pty' },
  { id: 'ryn-terminal', name: 'สถานีขนส่งระยอง', nameEn: 'Rayong Terminal', provinceId: 'ryn' },
];

export const mockTrips: Trip[] = [
  { id: 't1', routeId: 'northern', originProvinceId: 'bkk', destinationProvinceId: 'cnx', departureTime: '08:00', arrivalTime: '18:00', price: 550, availableSeats: 24, totalSeats: 40, tripType: 'ด่วนพิเศษ', busType: 'VIP 24 ที่นั่ง', date: '2026-03-05' },
  { id: 't2', routeId: 'northern', originProvinceId: 'bkk', destinationProvinceId: 'cnx', departureTime: '20:00', arrivalTime: '06:00', price: 650, availableSeats: 12, totalSeats: 32, tripType: 'ด่วนพิเศษ', busType: 'VIP 32 ที่นั่ง', date: '2026-03-05' },
  { id: 't3', routeId: 'northern', originProvinceId: 'bkk', destinationProvinceId: 'cnx', departureTime: '21:30', arrivalTime: '07:30', price: 750, availableSeats: 6, totalSeats: 24, tripType: 'ด่วนพิเศษ', busType: 'VIP First Class', date: '2026-03-05' },
  { id: 't4', routeId: 'southern', originProvinceId: 'bkk', destinationProvinceId: 'hdy', departureTime: '18:00', arrivalTime: '07:00', price: 850, availableSeats: 18, totalSeats: 40, tripType: 'ด่วนพิเศษ', busType: 'VIP 24 ที่นั่ง', date: '2026-03-05' },
  { id: 't5', routeId: 'northeast', originProvinceId: 'bkk', destinationProvinceId: 'udn', departureTime: '19:00', arrivalTime: '05:00', price: 480, availableSeats: 30, totalSeats: 40, tripType: 'ปรับอากาศ', busType: 'ป.1 (ป.อ.)', date: '2026-03-05' },
];

export const generateSeats = (totalSeats: number): Seat[] => {
  const seats: Seat[] = [];
  const cols = 4;
  const rows = Math.ceil(totalSeats / cols);
  let seatNum = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (seatNum > totalSeats) break;
      const randomStatus = Math.random();
      let status: SeatStatus = 'available';
      if (randomStatus < 0.25) status = 'booked';
      else if (randomStatus < 0.3) status = 'unavailable';

      seats.push({
        id: `s${seatNum}`,
        number: `${seatNum}`,
        row: r,
        col: c,
        status,
        floor: 1,
      });
      seatNum++;
    }
  }
  return seats;
};

export const mockPromotions: Promotion[] = [
  {
    id: 'p1', title: 'ส่วนลด 10% สายเหนือ', description: 'รับส่วนลด 10% สำหรับเส้นทางสายเหนือทุกเที่ยว',
    imageUrl: '', promoCode: 'NORTH10', discountPercent: 10, discountAmount: 0,
    remainingQuota: 50, expiryDate: '2026-04-30', validityDays: 30, memberOnly: false,
  },
  {
    id: 'p2', title: 'สมาชิกลด 100 บาท', description: 'สมาชิกรับส่วนลด 100 บาท เมื่อจองผ่านแอป',
    imageUrl: '', promoCode: 'MEMBER100', discountPercent: 0, discountAmount: 100,
    remainingQuota: 20, expiryDate: '2026-03-31', validityDays: 15, memberOnly: true,
  },
  {
    id: 'p3', title: 'เดินทางคู่ ลดพิเศษ', description: 'จอง 2 ที่นั่งขึ้นไป รับส่วนลด 15%',
    imageUrl: '', promoCode: 'DUO15', discountPercent: 15, discountAmount: 0,
    remainingQuota: 100, expiryDate: '2026-05-15', validityDays: 60, memberOnly: false,
  },
];
