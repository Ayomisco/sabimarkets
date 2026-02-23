import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Position {
  id: string;
  marketTitle: string;
  outcome: "YES" | "NO";
  shares: number;
  avgPrice: number;
  totalCost: number;
  timestamp: string;
  tokenId?: string;
  isResolved: boolean;
  valueAtResolution?: number;
}

interface PortfolioState {
  positions: Position[];
  addPosition: (pos: Omit<Position, 'id' | 'timestamp' | 'isResolved'>) => void;
  clearPositions: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      positions: [],
      addPosition: (pos) => set((state) => ({
        positions: [
          ...state.positions, 
          { 
              ...pos, 
              id: Math.random().toString(36).substring(7), 
              timestamp: new Date().toISOString(),
              isResolved: false
          }
        ]
      })),
      clearPositions: () => set({ positions: [] }),
    }),
    {
      name: 'sabi-portfolio-storage',
    }
  )
);
