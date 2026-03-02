import { create } from 'zustand';
import type { Trip, Seat } from '@/data/mockData';

export interface PassengerInfo {
  seatId: string;
  seatNumber: string;
  fullName: string;
  thaiId: string;
  phone: string;
  passengerType: 'child' | 'male' | 'female' | 'monk';
}

interface BookingState {
  // Step 1
  routeId: string;
  travelDate: string;
  originProvinceId: string;
  destinationProvinceId: string;
  boardingPointId: string;
  dropOffPointId: string;
  passengerCount: number;

  // Step 2
  selectedTrip: Trip | null;

  // Step 3
  selectedSeats: Seat[];

  // Step 4
  passengers: PassengerInfo[];
  promoCode: string;
  discount: number;

  // Step 5
  paymentMethod: string;
  bookingId: string;
  paymentStatus: 'pending' | 'success' | 'failed' | null;

  // Actions
  setRoute: (routeId: string) => void;
  setTravelDate: (date: string) => void;
  setOriginProvince: (id: string) => void;
  setDestinationProvince: (id: string) => void;
  setBoardingPoint: (id: string) => void;
  setDropOffPoint: (id: string) => void;
  setPassengerCount: (count: number) => void;
  setSelectedTrip: (trip: Trip) => void;
  setSelectedSeats: (seats: Seat[]) => void;
  setPassengers: (passengers: PassengerInfo[]) => void;
  setPromoCode: (code: string) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: string) => void;
  setBookingId: (id: string) => void;
  setPaymentStatus: (status: 'pending' | 'success' | 'failed' | null) => void;
  reset: () => void;
}

const initialState = {
  routeId: '',
  travelDate: '',
  originProvinceId: '',
  destinationProvinceId: '',
  boardingPointId: '',
  dropOffPointId: '',
  passengerCount: 1,
  selectedTrip: null,
  selectedSeats: [],
  passengers: [],
  promoCode: '',
  discount: 0,
  paymentMethod: '',
  bookingId: '',
  paymentStatus: null as 'pending' | 'success' | 'failed' | null,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setRoute: (routeId) => set({ routeId }),
  setTravelDate: (travelDate) => set({ travelDate }),
  setOriginProvince: (originProvinceId) => set({ originProvinceId, boardingPointId: '' }),
  setDestinationProvince: (destinationProvinceId) => set({ destinationProvinceId, dropOffPointId: '' }),
  setBoardingPoint: (boardingPointId) => set({ boardingPointId }),
  setDropOffPoint: (dropOffPointId) => set({ dropOffPointId }),
  setPassengerCount: (passengerCount) => set({ passengerCount }),
  setSelectedTrip: (selectedTrip) => set({ selectedTrip }),
  setSelectedSeats: (selectedSeats) => set({ selectedSeats }),
  setPassengers: (passengers) => set({ passengers }),
  setPromoCode: (promoCode) => set({ promoCode }),
  setDiscount: (discount) => set({ discount }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setBookingId: (bookingId) => set({ bookingId }),
  setPaymentStatus: (paymentStatus) => set({ paymentStatus }),
  reset: () => set(initialState),
}));
