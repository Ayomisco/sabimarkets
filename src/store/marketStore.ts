import { create } from 'zustand';

interface MarketPrices {
    [asset_id: string]: number; // Maps the asset ID (token) to its real-time percentage price (0.01 - 0.99)
}

interface MarketStore {
    livePrices: MarketPrices;
    updatePrice: (asset_id: string, price: number) => void;
    subscribeToTokens: string[];
    setSubscribeTokens: (tokens: string[]) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
    livePrices: {},
    updatePrice: (asset_id, price) => set((state) => ({
        livePrices: {
            ...state.livePrices,
            [asset_id]: price
        }
    })),
    subscribeToTokens: [],
    setSubscribeTokens: (tokens) => set(() => ({ subscribeToTokens: tokens })),
}));
