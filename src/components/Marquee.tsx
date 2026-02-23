"use client";

import { Market } from "@/lib/polymarket/types";

export default function Marquee({ markets }: { markets: Market[] }) {
  if (!markets || markets.length === 0) return null;

  return (
    <div className="flex w-full whitespace-nowrap overflow-hidden group py-1 border-y border-[#3D2E1E]/50 bg-[#1A1511]">
      <div className="animate-marquee flex gap-12 group-hover:[animation-play-state:paused] whitespace-nowrap px-6">
        {markets.map((m, i) => (
          <span key={`mq1-${i}`} className="text-white text-xs font-mono font-medium flex items-center gap-2">
            <span className="text-[#A69C8A] max-w-[200px] truncate block">{m.question.substring(0, 40)}...</span>
            <span className="text-[#00C566]">
              {Math.round(parseFloat(m.outcomePrices?.[0] || "0.5") * 100)}¢
            </span>
            <span className="text-[#00C566] ml-2 text-[10px] break-keep">~+1.4%</span>
          </span>
        ))}
      </div>
      
      {/* Duplicate for seamless infinite scrolling */}
      <div className="animate-marquee2 flex gap-12 group-hover:[animation-play-state:paused] whitespace-nowrap px-6 absolute top-1">
        {markets.map((m, i) => (
          <span key={`mq2-${i}`} className="text-white text-xs font-mono font-medium flex items-center gap-2">
            <span className="text-[#A69C8A] max-w-[200px] truncate block">{m.question.substring(0, 40)}...</span>
             <span className="text-[#00C566]">
              {Math.round(parseFloat(m.outcomePrices?.[0] || "0.5") * 100)}¢
            </span>
            <span className="text-[#00C566] ml-2 text-[10px]">~+1.4%</span>
          </span>
        ))}
      </div>
{/* Tailwind config requires defining these keyframes in global CSS or inline if complex, but simple CSS animation applies here */}
<style dangerouslySetInnerHTML={{__html: `
.animate-marquee { animation: marquee 35s linear infinite; }
.animate-marquee2 { animation: marquee2 35s linear infinite; }
@keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
@keyframes marquee2 { 0% { transform: translateX(100%); } 100% { transform: translateX(0%); } }
`}} />
    </div>
  );
}
