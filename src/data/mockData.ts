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

// Each cell: seat label (e.g. "1A") or null (empty space)
// Special strings: "DRIVER", "DOOR1", "DOOR2", "TOILET", "EMERGENCY", "STAIRS" are rendered as labels
export interface BusLayout {
  id: string;
  name: string;
  rows: (string | null)[][]; // each row has 4 columns: [A, B, C, D]
}

const SPECIAL_CELLS = ['DRIVER', 'DOOR1', 'DOOR2', 'TOILET', 'EMERGENCY', 'STAIRS'];

// 7.3m bus — ~24 seats, single floor
export const layout7m: BusLayout = {
  id: '7m',
  name: 'รถตู้ 7.3 เมตร',
  rows: [
    ['DOOR1', null,   null,  'DRIVER'],
    ['1A',   '1B',    null,   null],
    ['2A',   '2B',    null,   null],
    ['3A',   '3B',    null,   '3D'],
    ['4A',   '4B',    null,   '4D'],
    ['5A',   '5B',    null,   '5D'],
    ['6A',   '6B',    null,   '6D'],
    ['7A',   '7B',    '7C',   '7D'],
  ],
};

// 12m bus — ~32-40 seats, single floor
export const layout12m: BusLayout = {
  id: '12m',
  name: 'รถบัส 12 เมตร',
  rows: [
    ['DOOR1',  null,    null,   'DRIVER'],
    ['1A',    '1B',    '1C',   '1D'],
    ['2A',    '2B',    '2C',   '2D'],
    ['3A',    '3B',    '3C',   '3D'],
    ['4A',    '4B',    '4C',   '4D'],
    ['TOILET', null,   '5C',   '5D'],
    ['DOOR2',  null,   '6C',   '6D'],
    ['5A',    '5B',    '7C',   '7D'],
    ['6A',    '6B',    'EMERGENCY', null],
    ['7A',    '7B',    '8C',   '8D'],
    ['8A',    '8B',    '9C',   '9D'],
  ],
};

export function getBusLayout(busType: string, totalSeats: number): BusLayout {
  if (totalSeats <= 24 || busType.includes('VIP 24') || busType.includes('First Class')) {
    return layout7m;
  }
  return layout12m;
}

export function isSpecialCell(label: string | null): boolean {
  return label !== null && SPECIAL_CELLS.includes(label);
}

export const generateSeats = (layout: BusLayout): Seat[] => {
  const seats: Seat[] = [];
  layout.rows.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell === null || isSpecialCell(cell)) return;
      const randomStatus = Math.random();
      let status: SeatStatus = 'available';
      if (randomStatus < 0.25) status = 'booked';
      else if (randomStatus < 0.3) status = 'unavailable';
      seats.push({
        id: `s-${cell}`,
        number: cell,
        row: rowIdx,
        col: colIdx,
        status,
        floor: 1,
      });
    });
  });
  return seats;
};

export const mockPromotions: Promotion[] = [
  {
    id: 'p1', title: 'ส่วนลด 10% สายเหนือ', description: 'รับส่วนลด 10% สำหรับเส้นทางสายเหนือทุกเที่ยว',
    imageUrl: '../assets/promotion/discount10.jpg', promoCode: 'NORTH10', discountPercent: 10, discountAmount: 0,
    remainingQuota: 50, expiryDate: '2026-04-30', validityDays: 30, memberOnly: false,
  },
  {
    id: 'p2', title: 'สมาชิกลด 100 บาท', description: 'สมาชิกรับส่วนลด 100 บาท เมื่อจองผ่านแอป',
    imageUrl: '../assets/promotion/member100.jpg', promoCode: 'MEMBER100', discountPercent: 0, discountAmount: 100,
    remainingQuota: 20, expiryDate: '2026-03-31', validityDays: 15, memberOnly: true,
  },
  {
    id: 'p3', title: 'เดินทางคู่ ลดพิเศษ', description: 'จอง 2 ที่นั่งขึ้นไป รับส่วนลด 15%',
    imageUrl: '../assets/promotion/duo15.jpg', promoCode: 'DUO15', discountPercent: 15, discountAmount: 0,
    remainingQuota: 100, expiryDate: '2026-05-15', validityDays: 60, memberOnly: false,
  },
];
