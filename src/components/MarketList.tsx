"use client";

import { useEffect, useState } from "react";
import { useMarketStore } from "@/store/marketStore";
import { usePolymarketWSS } from "@/hooks/usePolymarketWSS";
import { MarketCard } from "./MarketCard";
import { Market } from "@/lib/polymarket/types";
import { BetModal } from "./BetModal";
import { MarketDetailModal } from "./MarketDetailModal";
import { Flame, Globe, Bitcoin, Landmark, Trophy, TrendingUp, Clapperboard } from "lucide-react";

export function MarketList({ initialMarkets }: { initialMarkets: (Market & { uiCategory: string })[] }) {
    const { setSubscribeTokens } = useMarketStore();
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isBetModalOpen, setBetModalOpen] = useState(false);
    const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
    const [selectedOutcome, setSelectedOutcome] = useState<"YES"|"NO"|null>(null);
    const [selectedPrice, setSelectedPrice] = useState<number>(0);

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
        if (tokensToWatch.length > 0) setSubscribeTokens(tokensToWatch);
    }, [initialMarkets, setSubscribeTokens]);

    const categories = [
        { name: "All", icon: <Flame size={13} /> },
        { name: "Global", icon: <Globe size={13} /> },
        { name: "Crypto", icon: <Bitcoin size={13} /> },
        { name: "Politics", icon: <Landmark size={13} /> },
        { name: "Sports", icon: <Trophy size={13} /> },
        { name: "Economy", icon: <TrendingUp size={13} /> },
        { name: "Entertainment", icon: <Clapperboard size={13} /> }
    ];

    const filteredMarkets = selectedCategory === "All" 
        ? initialMarkets 
        : initialMarkets.filter(m => m.uiCategory === selectedCategory);

    const handleMarketClick = (market: Market) => {
        setSelectedMarket(market);
        setDetailModalOpen(true);
    };

    const handleBetClick = (e: React.MouseEvent, market: Market, outcome: "YES"|"NO", price: number) => {
        e.stopPropagation();
        setSelectedMarket(market);
        setSelectedOutcome(outcome);
        setSelectedPrice(price);
        setBetModalOpen(true);
    };

    return (
        <div className="w-full flex flex-col">
            
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <h2 className="text-[15px] font-bold text-white">Live Markets</h2>
                    <span className="text-[11px] text-[#7A7068] bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded-full font-mono">
                        {filteredMarkets.length} markets
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#00D26A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-pulse inline-block" />
                    Live
                </div>
            </div>
            
            {/* Category Filter Pills */}
            <div className="flex overflow-x-auto gap-2 hide-scrollbar mb-6 pb-1">
                {categories.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                            selectedCategory === cat.name 
                            ? 'bg-white/[0.1] text-white border border-white/[0.15]' 
                            : 'bg-transparent text-[#7A7068] border border-white/[0.06] hover:text-white hover:border-white/[0.12]'
                        }`}
                    >
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            {/* Markets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMarkets.length > 0 ? filteredMarkets.map((market, i) => (
                    <MarketCard 
                        key={market.condition_id || i} 
                        market={market} 
                        index={i} 
                        onMarketClick={handleMarketClick}
                        onBetClick={handleBetClick}
                    />
                )) : (
                    <div className="col-span-full py-16 text-center text-[#7A7068] text-sm font-mono">
                        No markets found in this category.
                    </div>
                )}
            </div>

            <MarketDetailModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setDetailModalOpen(false)} 
                market={selectedMarket}
                onBet={(outcome, price) => {
                    setSelectedOutcome(outcome);
                    setSelectedPrice(price);
                    setBetModalOpen(true);
                }}
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
