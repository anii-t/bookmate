import { create } from 'zustand';
import { UserModel } from '../models/UserModel';

interface UserState {
  user: UserModel | null;
  authChecked: boolean;
  setUser: (user: UserModel | null) => void;
  setAuthChecked: (checked: boolean) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  authChecked: false,
  setUser: (user) => set({ user }),
  setAuthChecked: (authChecked) => set({ authChecked }),
  clear: () => set({ user: null }),
}));
