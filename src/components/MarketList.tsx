"use client";

import { useEffect, useState } from "react";
import { useMarketStore } from "@/store/marketStore";
import { usePolymarketWSS } from "@/hooks/usePolymarketWSS";
import { MarketCard } from "./MarketCard";
import { Market } from "@/lib/polymarket/types";
import { BetModal } from "./BetModal";
import { MarketDetailModal } from "./MarketDetailModal";

export function MarketList({ initialMarkets }: { initialMarkets: (Market & { uiCategory: string })[] }) {
    const { setSubscribeTokens } = useMarketStore();
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    
    // Detail Modal State
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);

    // Bet Modal State
    const [isBetModalOpen, setBetModalOpen] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [selectedOutcome, setSelectedOutcome] = useState<"YES"|"NO"|null>(null);
    const [selectedPrice, setSelectedPrice] = useState<number>(0);

    // Init WebSocket connection
    usePolymarketWSS();

    useEffect(() => {
        const tokensToWatch: string[] = [];
        initialMarkets.forEach(market => {
            if (market.tokens && Array.isArray(market.tokens)) {
                market.tokens.forEach(token => {
                   if(token.token_id) tokensToWatch.push(token.token_id);
                });
            }
        });

        if (tokensToWatch.length > 0) {
            setSubscribeTokens(tokensToWatch);
        }
    }, [initialMarkets, setSubscribeTokens]);

    const categories = [
        { name: "All", icon: "🔥" },
        { name: "Global", icon: "�" },
        { name: "Crypto", icon: "🪙" },
        { name: "Politics", icon: "🏛️" },
        { name: "Sports", icon: "⚽" },
        { name: "Economy", icon: "📈" },
        { name: "Entertainment", icon: "�" }
    ];

    const filteredMarkets = selectedCategory === "All" 
        ? initialMarkets 
        : initialMarkets.filter(m => m.uiCategory === selectedCategory);

    const handleMarketClick = (market: Market) => {
        setSelectedMarket(market);
        setDetailModalOpen(true);
    };

    const handleBetClick = (e: React.MouseEvent, market: Market, outcome: "YES"|"NO", price: number) => {
        e.stopPropagation(); // Prevents the card click from opening the detail modal
        setSelectedMarket(market);
        setSelectedOutcome(outcome);
        setSelectedPrice(price);
        setBetModalOpen(true);
    };

    return (
        <div className="w-full flex flex-col pt-0">
            
            {/* Forecast Markets Style Category Pill Filter */}
            <div className="flex overflow-x-auto gap-3 hide-scrollbar mb-8 pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-[15px] font-medium transition-all shadow-sm ${
                            selectedCategory === cat.name 
                            ? 'bg-[#110F0D] text-white border border-[#3D2E1E] shadow-[0_4px_12px_rgba(0,0,0,0.5)]' 
                            : 'bg-[#1A1511] text-[#A69C8A] border border-[#3D2E1E]/50 hover:bg-[#110F0D] hover:text-white'
                        }`}
                    >
                        <span>{cat.icon}</span> {cat.name}
                    </button>
                ))}
            </div>

            {/* Forecast Markets Grid (Responsive: 1 -> 2 -> 3 -> 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMarkets.length > 0 ? filteredMarkets.map((market, i) => (
                    <MarketCard 
                        key={market.condition_id || i} 
                        market={market} 
                        index={i} 
                        onMarketClick={handleMarketClick}
                        onBetClick={handleBetClick}
                    />
                )) : (
                    <div className="col-span-full pt-10 text-center text-slate-500 font-mono">
                        No markets found in this category.
                    </div>
                )}
            </div>

            <MarketDetailModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setDetailModalOpen(false)} 
                market={selectedMarket}
            />

            <BetModal 
                isOpen={isBetModalOpen} 
                onClose={() => setBetModalOpen(false)} 
                market={selectedMarket}
                selectedOutcome={selectedOutcome}
                currentPrice={selectedPrice}
            />
        </div>
    );
}
