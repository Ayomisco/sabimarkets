"use client";

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Market } from '@/lib/polymarket/types';
import { Share2, BookmarkPlus, ExternalLink } from 'lucide-react';
import { useMarketStore } from "@/store/marketStore";
import MarketChart from './MarketChart';

export function MarketDetailModal({
  isOpen,
  onClose,
  market
}: {
  isOpen: boolean;
  onClose: () => void;
  market: Market | null;
}) {
  const { livePrices } = useMarketStore();

  if (!market) return null;

  // Polymarket outcome mapping safely
  const outcomes = market.outcomes || ["Yes", "No"];
  const outcomePrices = market.outcomePrices || ["0.5", "0.5"];

  const volUSDC = parseInt(market.volume || "0");
  const stringVol = volUSDC >= 1000000 ? (volUSDC / 1000000).toFixed(2) + 'M' : volUSDC >= 1000 ? (volUSDC / 1000).toFixed(1) + 'K' : volUSDC.toString();
  
  const closeDate = market.endDate ? new Date(market.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Unknown";

  // Pick off first YES price for the chart initialization
  const tokenId = market.tokens?.[0]?.token_id;
  const currentYesPrice = tokenId && livePrices[tokenId] !== undefined 
    ? livePrices[tokenId] 
    : parseFloat(outcomePrices[0] || "0.5");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] w-full sm:w-[95vw] h-full sm:h-[90vh] sm:rounded-2xl rounded-none bg-[#0B0A08] border border-[#3D2E1E] text-white p-0 overflow-y-auto flex flex-col font-sans">
        
        {/* Header - Cloned Forecast Style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 sm:p-6 border-b border-[#3D2E1E] sticky top-0 bg-[#0B0A08]/95 backdrop-blur z-20 gap-4">
            <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg border border-slate-200 text-blue-600 text-xl overflow-hidden">
                    {market.icon ? <img src={market.icon} className="w-full h-full object-cover" /> : "🌍"}
                </div>
                <div>
                   <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight leading-none mb-2">{market.question}</h2>
                   <div className="flex items-center gap-4 text-[#A69C8A] text-sm">
                       <span className="flex items-center gap-1 font-mono">🏆 ${stringVol}</span>
                       <span className="flex items-center gap-1 font-mono">🕒 {closeDate}</span>
                   </div>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1511] border border-[#3D2E1E] rounded-md text-sm text-[#A69C8A] hover:text-white transition-colors">
                    <ExternalLink size={14} /> Polymarket
                </button>
                <button className="p-1.5 bg-[#1A1511] border border-[#3D2E1E] rounded-md text-[#A69C8A] hover:text-white transition-colors">
                    <Share2 size={16} />
                </button>
                <button className="p-1.5 bg-[#1A1511] border border-[#3D2E1E] rounded-md text-[#A69C8A] hover:text-white transition-colors">
                    <BookmarkPlus size={16} />
                </button>
            </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-col lg:flex-row flex-1 p-4 sm:p-6 gap-6 sm:gap-8">
            
            {/* Left Column (Chart & Details) */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Chart Header Settings */}
                <div className="flex items-center gap-1 sm:gap-2 mb-6 pointer-events-none overflow-x-auto hide-scrollbar pb-2">
                    {['1H', '6H', '1D', '1W', '1M', 'ALL'].map((tf) => (
                        <button key={tf} className={`textxs font-bold px-3 py-1.5 rounded-md shrink-0 ${tf === 'ALL' ? 'bg-[#1A1511] text-white border border-[#3D2E1E]' : 'text-[#A69C8A] hover:text-white'}`}>
                            {tf}
                        </button>
                    ))}
                </div>

                {/* Real Interactive Graph */}
                <div className="h-[300px] w-full relative mb-8 flex flex-col justify-end">
                    <MarketChart currentYesPrice={currentYesPrice} yesTokenId={tokenId} />
                </div>

                {/* Outcomes Table List */}
                <div className="flex justify-between text-[11px] sm:text-xs font-bold text-[#A69C8A] uppercase tracking-wider mb-3 px-2">
                    <span>Outcome (Poly)</span>
                    <span>% Chance</span>
                </div>

                <div className="space-y-3">
                    {outcomes.map((outcomeName: string, i: number) => {
                         const tokenId = market.tokens?.[i]?.token_id;
                         const currentPrice = tokenId && livePrices[tokenId] !== undefined 
                              ? livePrices[tokenId] 
                              : parseFloat(outcomePrices[i] || "0.5");
                         const pct = Math.round(currentPrice * 100);
                         const isYes = outcomeName.toLowerCase() === 'yes' || i === 0;

                         return (
                            <div key={i} className="flex justify-between items-center bg-[#110F0D] border border-[#3D2E1E] rounded-xl p-3 hover:border-[#A69C8A]/30 transition-colors">
                                <span className="font-bold text-white pl-2">{outcomeName}</span>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold font-mono text-lg w-12 text-right">{pct}%</span>
                                    <button className={`px-4 py-2 rounded-md font-bold text-sm ${isYes ? 'bg-[#00C566] text-black hover:bg-[#00a855]' : 'bg-[#E8333A] text-white hover:bg-[#c9252c]'}`}>
                                        ${parseFloat(currentPrice.toString()).toFixed(2)}
                                    </button>
                                </div>
                            </div>
                         );
                    })}
                </div>
            </div>

            {/* Right Column (Widget / Sticky) */}
            <div className="w-full lg:w-[360px] shrink-0 mt-6 lg:mt-0 xl:w-[420px]">
                <div className="sticky top-6 border border-[#3D2E1E] bg-[#110F0D] rounded-xl overflow-hidden shadow-base">
                    <div className="p-3 sm:p-4 border-b border-[#3D2E1E] font-bold text-lg flex justify-between bg-[#0B0A08]">
                        <span>Order Widget</span>
                         <span className="text-[#00C566]">Auto</span>
                    </div>
                    <div className="p-4 sm:p-6">
                       {/* Clone Buy/Sell toggle */}
                       <div className="flex gap-4 border-b border-[#3D2E1E] pb-3 mb-6 font-bold text-lg">
                           <button className="text-white border-b-2 border-white pb-2 px-2">Buy</button>
                           <button className="text-[#A69C8A] hover:text-white px-2">Sell</button>
                       </div>

                       {/* Clone Outcomes Selectors inside Widget */}
                       <div className="grid grid-cols-2 gap-4 mb-6">
                            {outcomes.slice(0, 2).map((outcomeName: string, i: number) => {
                                const tokenId = market.tokens?.[i]?.token_id;
                                const currentPrice = tokenId && livePrices[tokenId] !== undefined 
                                    ? livePrices[tokenId] 
                                    : parseFloat(outcomePrices[i] || "0.5");
                                const pct = Math.round(currentPrice * 100);
                                const isYes = outcomeName.toLowerCase() === 'yes' || i === 0;

                                return (
                                    <button key={i} className={`p-4 rounded-xl border font-bold text-[15px] flex flex-col items-center justify-center transition-all ${isYes ? 'border-[#00C566] bg-[#00C566]/10 text-[#00C566] shadow-[0_4px_15px_rgba(0,197,102,0.15)]' : 'border-[#3D2E1E] text-[#E8333A] bg-[#0B0A08] hover:border-[#E8333A]/50'}`}>
                                        <span className="text-white mb-1">{outcomeName}</span> 
                                        {pct}¢
                                    </button>
                                );
                            })}
                       </div>

                       <p className="text-center text-sm text-[#A69C8A] mb-5 font-mono">
                           Route to best exchange automatically
                       </p>

                       <div className="bg-[#0B0A08] border border-[#3D2E1E] rounded-md flex px-4 py-2 mb-6 items-center w-max mx-auto shadow-inner">
                           <span className="w-4 h-4 rounded-full bg-[#1A1511] text-[10px] text-[#A69C8A] border border-[#3D2E1E] flex items-center justify-center font-bold mr-2">P</span>
                           <span className="text-xs text-[#00C566] tracking-wide font-bold">Polymarket</span>
                       </div>
                       
                       <p className="text-xs text-center text-slate-500 mb-3">Simulated Demo Order.</p>

                       <button className="w-full bg-[#00C566] hover:bg-[#00a855] text-black font-extrabold py-4 rounded-xl shadow-[0_0_20px_rgba(0,197,102,0.3)] text-lg transition-transform active:scale-[0.98]">
                           Place Order
                       </button>

                    </div>
                </div>
            </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
