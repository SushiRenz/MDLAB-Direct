import { create } from 'zustand';

export interface Appointment {
  id: string;
  testName: string;
  date: Date;
  status: 'upcoming' | 'completed' | 'cancelled';
  location: string;
}

interface AppointmentStore {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  rescheduleAppointment: (id: string, newDate: Date) => void;
  cancelAppointment: (id: string) => void;
}

export const useAppointmentStore = create<AppointmentStore>((set) => ({
  appointments: [],
  addAppointment: (appointment) =>
    set((state) => ({
      appointments: [
        ...state.appointments,
        { ...appointment, id: Math.random().toString(36).substr(2, 9) },
      ],
    })),
  rescheduleAppointment: (id, newDate) =>
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, date: newDate } : apt
      ),
    })),
  cancelAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'cancelled' } : apt
      ),
    })),
}));