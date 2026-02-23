"use client";

import { motion } from "framer-motion";
import { Market } from "@/lib/polymarket/types";
import { useMarketStore } from "@/store/marketStore";

interface MarketCardProps {
  market: Market;
  index: number;
  onMarketClick: (market: Market) => void;
  onBetClick: (e: React.MouseEvent, market: Market, outcome: "YES" | "NO", price: number) => void;
}

export function MarketCard({ market, index, onMarketClick, onBetClick }: MarketCardProps) {
  const { livePrices } = useMarketStore();
  
  // Forecast Markets Style formatting
  const volUSDC = parseInt(market.volume || "0");
  const stringVol = volUSDC >= 1000000 ? (volUSDC / 1000000).toFixed(1) + 'm' : volUSDC >= 1000 ? (volUSDC / 1000).toFixed(1) + 'k' : volUSDC.toString();
  
  // They only show YES/NO on the forecast markets simple cards, or they show Top 2 options 
  // Let's assume standard yes/no markets for MVP
  const yesAssetId = market.tokens?.[0]?.token_id;
  const noAssetId = market.tokens?.[1]?.token_id;
  
  const rawYesPrice = yesAssetId && livePrices[yesAssetId] !== undefined ? livePrices[yesAssetId] : parseFloat(market.outcomePrices?.[0] || "0.5");
  const rawNoPrice = noAssetId && livePrices[noAssetId] !== undefined ? livePrices[noAssetId] : parseFloat(market.outcomePrices?.[1] || "0.5");

  const yesPercent = Math.round(rawYesPrice * 100);
  const noPercent = Math.round(rawNoPrice * 100);

  return (
    <motion.div
      onClick={() => onMarketClick(market)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex flex-col justify-between overflow-hidden rounded-[16px] bg-[#110F0D] border border-[#3D2E1E] shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] group transition-all duration-300 min-h-[220px] cursor-pointer"
    >
      <div className="p-5 flex-1 flex flex-col relative">
        <div className="flex items-start justify-between mb-4">
            {/* Avatar Logo */}
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                {market.icon ? (
                   <img src={market.icon} alt="Market Icon" className="w-full h-full object-cover" />
                ) : (
                   <span className="text-blue-600 text-xs font-bold">🌍</span>
                )}
            </div>

            {/* Hot Badge */}
            {volUSDC > 500000 && (
                <span className="text-[11px] font-bold text-[#E8333A] bg-[#E8333A]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                    🔥 Hot
                </span>
            )}
        </div>

        <h3 className="text-lg font-bold text-white mb-6 leading-[1.3] line-clamp-3">
            {market.question}
        </h3>

        <div className="mt-auto space-y-3">
            {/* Outcome row 1: YES */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-[#A69C8A] font-medium truncate pr-2">Yes</span>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-white text-sm">{yesPercent}%</span>
                    <button 
                         onClick={(e) => onBetClick(e, market, "YES", rawYesPrice)}
                        className="w-[45px] h-[28px] flex items-center justify-center border border-[#00C566] text-[#00C566] rounded hover:bg-[#00C566] hover:text-black font-bold text-xs transition-colors"
                    >
                        Yes
                    </button>
                    <button 
                         onClick={(e) => onBetClick(e, market, "NO", rawNoPrice)}
                        className="w-[45px] h-[28px] flex items-center justify-center border border-[#E8333A] text-[#E8333A] rounded hover:bg-[#E8333A] hover:text-white font-bold text-xs transition-colors"
                    >
                        No
                    </button>
                </div>
            </div>

            {/* Outcome row 2: NO (This mirrors the forecast market style where they list 2 outcomes) */}
             <div className="flex items-center justify-between">
                <span className="text-sm text-[#A69C8A] font-medium truncate pr-2">No</span>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-white text-sm">{noPercent}%</span>
                    <button 
                         onClick={(e) => e.stopPropagation()}
                        className="w-[45px] h-[28px] flex items-center justify-center border border-[#00C566]/30 text-[#00C566]/50 rounded cursor-not-allowed font-bold text-xs"
                    >
                        Yes
                    </button>
                    <button 
                         onClick={(e) => e.stopPropagation()}
                        className="w-[45px] h-[28px] flex items-center justify-center border border-[#E8333A]/30 text-[#E8333A]/50 rounded cursor-not-allowed font-bold text-xs"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1A1511] border-t border-[#3D2E1E] px-5 py-3 flex items-center justify-between">
          <span className="text-[13px] text-[#A69C8A] font-medium">${stringVol} Vol.</span>
          <span className="w-[20px] h-[20px] rounded-full bg-[#110F0D] flex items-center justify-center text-[10px] text-[#A69C8A] border border-[#3D2E1E] shrink-0 font-bold">
              P
          </span>
      </div>

    </motion.div>
  );
}
