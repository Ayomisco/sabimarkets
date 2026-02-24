"use client";

import { motion } from "framer-motion";
import { Market } from "@/lib/polymarket/types";
import { useMarketStore } from "@/store/marketStore";
import { TrendingUp } from "lucide-react";

interface MarketCardProps {
  market: Market & { uiCategory?: string };
  index: number;
  onMarketClick: (market: Market) => void;
  onBetClick: (e: React.MouseEvent, market: Market, outcome: "YES" | "NO", price: number) => void;
}

export function MarketCard({ market, index, onMarketClick, onBetClick }: MarketCardProps) {
  const { livePrices } = useMarketStore();
  
  const volUSDC = parseInt(market.volume || "0");
  const stringVol = volUSDC >= 1000000 
    ? (volUSDC / 1000000).toFixed(1) + 'M' 
    : volUSDC >= 1000 
    ? (volUSDC / 1000).toFixed(1) + 'K' 
    : volUSDC.toString();
  
  const yesAssetId = market.tokens?.[0]?.token_id;
  const noAssetId = market.tokens?.[1]?.token_id;
  
  const rawYesPrice = yesAssetId && livePrices[yesAssetId] !== undefined 
    ? livePrices[yesAssetId] 
    : parseFloat(market.outcomePrices?.[0] || "0.5");
  const rawNoPrice = noAssetId && livePrices[noAssetId] !== undefined 
    ? livePrices[noAssetId] 
    : parseFloat(market.outcomePrices?.[1] || "0.5");

  const yesPercent = Math.round(rawYesPrice * 100);
  const noPercent = Math.round(rawNoPrice * 100);
  const isHot = volUSDC > 500000;

  return (
    <motion.div
      onClick={() => onMarketClick(market)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
      className="relative flex flex-col overflow-hidden rounded-2xl bg-[#0F0D0B] border border-white/[0.07] hover:border-white/[0.14] transition-all duration-300 cursor-pointer group"
      style={{ minHeight: '180px' }}
      whileHover={{ y: -2 }}
    >
      {/* Hover glow overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at 70% 0%, rgba(0,210,106,0.04) 0%, transparent 60%)' }} />

      <div className="p-4 flex-1 flex flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Market icon */}
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
              {market.icon ? (
                <img src={market.icon} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs">🌍</span>
              )}
            </div>
            <span className="text-[10px] text-[#7A7068] font-medium uppercase tracking-wider font-mono">
              {market.uiCategory || 'Global'}
            </span>
          </div>
          {isHot && (
            <span className="text-[10px] font-bold text-[#FF4560] bg-[#FF4560]/10 border border-[#FF4560]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              🔥 Hot
            </span>
          )}
        </div>

        {/* Question */}
        <h3 className="text-[13px] font-semibold text-white leading-[1.45] line-clamp-3 mb-4 flex-1">
          {market.question}
        </h3>

        {/* Probability bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] text-[#7A7068] mb-1">
            <span>YES {yesPercent}%</span>
            <span>NO {noPercent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${yesPercent}%`,
                background: `linear-gradient(90deg, #00D26A, #00A854)`
              }} 
            />
          </div>
        </div>

        {/* Bet Buttons */}
        <div className="flex gap-2 mt-auto">
          <button 
            onClick={(e) => onBetClick(e, market, "YES", rawYesPrice)}
            className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/25 hover:bg-[#00D26A] hover:text-black transition-all duration-200 cursor-pointer"
          >
            Yes · {yesPercent}¢
          </button>
          <button 
            onClick={(e) => onBetClick(e, market, "NO", rawNoPrice)}
            className="flex-1 py-2 rounded-xl text-[12px] font-bold bg-[#FF4560]/10 text-[#FF4560] border border-[#FF4560]/25 hover:bg-[#FF4560] hover:text-white transition-all duration-200 cursor-pointer"
          >
            No · {noPercent}¢
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#7A7068]">
          <TrendingUp size={11} />
          <span className="text-[11px] font-medium">${stringVol} Vol.</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded-full bg-[#1A1511] border border-white/10 flex items-center justify-center">
            <span className="text-[7px] text-[#7A7068] font-bold">P</span>
          </div>
          <span className="text-[10px] text-[#7A7068]">Polymarket</span>
        </div>
      </div>
    </motion.div>
  );
}
