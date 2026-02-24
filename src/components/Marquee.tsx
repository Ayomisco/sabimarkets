"use client";

import { Market } from "@/lib/polymarket/types";
import { useMarketStore } from "@/store/marketStore";

export default function Marquee({ markets }: { markets: Market[] }) {
  const { livePrices } = useMarketStore();
  
  if (!markets || markets.length === 0) return null;

  const items = [...markets, ...markets]; // double for seamless loop

  return (
    <div className="flex w-full whitespace-nowrap overflow-hidden group">
      <div className="animate-marquee flex gap-10 group-hover:[animation-play-state:paused] whitespace-nowrap pl-6">
        {items.map((m, i) => {
          const tokenId = m.tokens?.[0]?.token_id;
          const livePrice = tokenId && livePrices[tokenId] !== undefined 
            ? livePrices[tokenId] 
            : parseFloat(m.outcomePrices?.[0] || "0.5");
          const pct = Math.round(livePrice * 100);
          
          // Simulate price change for display
          const isUp = pct > 50;

          return (
            <span key={`mq-${i}`} className="inline-flex items-center gap-2.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity">
              {/* Market icon */}
              <span className="inline-flex w-4 h-4 rounded-full overflow-hidden bg-white/10 shrink-0">
                {m.icon 
                  ? <img src={m.icon} alt="" className="w-full h-full object-cover" /> 
                  : <span className="text-[8px] flex items-center justify-center w-full h-full">🌍</span>
                }
              </span>
              
              {/* Market title (truncated) */}
              <span className="text-[#7A7068] max-w-[180px] truncate">{m.question}</span>
              
              {/* Price */}
              <span className="font-bold font-mono text-white">{pct}¢</span>
              
              {/* Direction */}
              <span className={`text-[10px] font-bold ${isUp ? 'text-[#00D26A]' : 'text-[#FF4560]'}`}>
                {isUp ? '▲' : '▼'} {Math.abs((pct - 50) * 0.1).toFixed(1)}%
              </span>

              {/* Separator */}
              <span className="text-white/10 text-base font-light ml-2">|</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
