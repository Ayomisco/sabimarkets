"use client";

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Market } from '@/lib/polymarket/types';
import { Share2, BookmarkPlus, ExternalLink, TrendingUp, Clock, X, Zap } from 'lucide-react';
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

  const outcomes = market.outcomes || ["Yes", "No"];
  const outcomePrices = market.outcomePrices || ["0.5", "0.5"];

  const volUSDC = parseInt(market.volume || "0");
  const stringVol = volUSDC >= 1000000 
    ? (volUSDC / 1000000).toFixed(2) + 'M' 
    : volUSDC >= 1000 
    ? (volUSDC / 1000).toFixed(1) + 'K' 
    : volUSDC.toString();
  
  const closeDate = market.endDate 
    ? new Date(market.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : "Open";

  const yesTokenId = market.tokens?.[0]?.token_id;
  const currentYesPrice = yesTokenId && livePrices[yesTokenId] !== undefined 
    ? livePrices[yesTokenId] 
    : parseFloat(outcomePrices[0] || "0.5");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1100px] w-full sm:w-[95vw] h-full sm:h-[90vh] sm:rounded-2xl rounded-none bg-[#0A0908] border border-white/[0.07] text-white p-0 overflow-y-auto flex flex-col font-sans [&>button]:hidden">
        
        {/* Sticky Header */}
        <div className="flex items-start justify-between px-5 sm:px-7 py-4 border-b border-white/[0.06] bg-[#0A0908]/95 backdrop-blur sticky top-0 z-20">
          <div className="flex gap-4 items-start flex-1 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center overflow-hidden">
              {market.icon ? <img src={market.icon} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">🌍</span>}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight mb-1.5 pr-4">{market.question}</h2>
              <div className="flex items-center gap-4 text-[#7A7068] text-[12px]">
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={12} /> ${stringVol} Vol.
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> Closes {closeDate}
                </span>
                <span className="flex items-center gap-1.5 text-[#00D26A]">
                  <Zap size={11} fill="#00D26A" /> Polymarket
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <a href={`https://polymarket.com/event/${market.condition_id}`} target="_blank" rel="noopener noreferrer"
               className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[12px] text-[#7A7068] hover:text-white transition-colors">
              <ExternalLink size={13} /> View on Poly
            </a>
            <button className="cursor-pointer p-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[#7A7068] hover:text-white transition-colors">
              <Share2 size={14} />
            </button>
            <button className="cursor-pointer p-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[#7A7068] hover:text-white transition-colors">
              <BookmarkPlus size={14} />
            </button>
            <button onClick={onClose} className="cursor-pointer p-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[#7A7068] hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 gap-0">
          
          {/* Left: Chart + Outcomes */}
          <div className="flex-1 min-w-0 px-5 sm:px-7 py-6 flex flex-col">
            
            {/* Timeframe tabs */}
            <div className="flex items-center gap-1 mb-4 overflow-x-auto hide-scrollbar">
              {['1H', '6H', '1D', '1W', '1M', 'ALL'].map((tf) => (
                <button key={tf} className={`cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
                  tf === 'ALL' 
                    ? 'bg-white/[0.08] text-white border border-white/[0.12]' 
                    : 'text-[#7A7068] hover:text-white hover:bg-white/[0.04]'
                }`}>
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="h-[260px] w-full relative mb-6">
              <div className="flex justify-between items-center text-[11px] text-[#7A7068] mb-3">
                <span>Implied Probability</span>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00D26A]" /> YES</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF4560]" /> NO</span>
                </div>
              </div>
              <MarketChart currentYesPrice={currentYesPrice} yesTokenId={yesTokenId} />
            </div>

            {/* Outcomes list */}
            <div>
              <div className="flex justify-between text-[10px] font-semibold text-[#7A7068] uppercase tracking-widest mb-3">
                <span>Outcome</span>
                <span>Probability</span>
              </div>
              <div className="space-y-2">
                {outcomes.map((outcomeName: string, i: number) => {
                  const tId = market.tokens?.[i]?.token_id;
                  const price = tId && livePrices[tId] !== undefined 
                    ? livePrices[tId] 
                    : parseFloat(outcomePrices[i] || "0.5");
                  const pct = Math.round(price * 100);
                  const isYes = i === 0;

                  return (
                    <div key={i} className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 hover:border-white/[0.12] transition-colors group">
                      <span className={`w-2 h-2 rounded-full mr-3 shrink-0 ${isYes ? 'bg-[#00D26A]' : 'bg-[#FF4560]'}`} />
                      <span className="font-semibold text-white text-[14px] flex-1">{outcomeName}</span>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block w-24">
                          <div className="h-1 rounded-full bg-white/[0.06]">
                            <div className="h-full rounded-full transition-all duration-500"
                                 style={{ width: `${pct}%`, backgroundColor: isYes ? '#00D26A' : '#FF4560' }} />
                          </div>
                        </div>
                        <span className="font-bold font-mono text-[15px] w-12 text-right text-white">{pct}%</span>
                        <button className={`cursor-pointer px-3.5 py-1.5 rounded-lg font-bold text-[12px] transition-all ${
                          isYes ? 'bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/25 hover:bg-[#00D26A] hover:text-black' : 'bg-[#FF4560]/10 text-[#FF4560] border border-[#FF4560]/25 hover:bg-[#FF4560] hover:text-white'
                        }`}>
                          {price.toFixed(2)}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            {market.description && (
              <div className="mt-6 pt-5 border-t border-white/[0.05]">
                <h4 className="text-[11px] font-semibold text-[#7A7068] uppercase tracking-wider mb-2">About this Market</h4>
                <p className="text-sm text-[#7A7068] leading-relaxed">{market.description}</p>
              </div>
            )}
          </div>

          {/* Right: Order Widget */}
          <div className="w-full lg:w-[340px] shrink-0 lg:border-l border-white/[0.06] bg-[#0F0D0B]">
            <div className="sticky top-[72px] p-5 flex flex-col gap-4">
              
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-[15px]">Place Order</h3>
                <span className="text-[11px] text-[#00D26A] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#00D26A] rounded-full animate-pulse" /> Auto Route
                </span>
              </div>

              {/* Outcome selectors */}
              <div className="grid grid-cols-2 gap-2">
                {outcomes.slice(0, 2).map((outcomeName: string, i: number) => {
                  const tId = market.tokens?.[i]?.token_id;
                  const price = tId && livePrices[tId] !== undefined 
                    ? livePrices[tId] 
                    : parseFloat(outcomePrices[i] || "0.5");
                  const pct = Math.round(price * 100);
                  const isYes = i === 0;

                  return (
                    <button key={i} className={`cursor-pointer p-3.5 rounded-xl border font-bold text-[13px] flex flex-col items-center justify-center gap-1 transition-all hover:opacity-90 ${
                      isYes 
                        ? 'bg-[#00D26A]/10 border-[#00D26A]/30 text-[#00D26A]' 
                        : 'bg-[#FF4560]/10 border-[#FF4560]/30 text-[#FF4560]'
                    }`}>
                      <span className="text-[10px] text-[#7A7068] font-medium uppercase tracking-wider">{outcomeName}</span>
                      <span className="text-[18px] font-bold text-white">{pct}¢</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7068] text-sm">$</span>
                <input 
                  type="number" 
                  defaultValue={10}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-7 pr-4 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#00D26A]/40 focus:border-[#00D26A]/30 transition-all"
                  placeholder="Amount in USDC"
                />
              </div>
              
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((p) => (
                  <button key={p} className="cursor-pointer flex-1 bg-white/[0.04] border border-white/[0.06] text-[#7A7068] hover:text-white py-1.5 rounded-lg text-[11px] font-bold transition-all hover:bg-white/[0.08]">
                    ${p}
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-[#7A7068] text-center flex items-center justify-center gap-1.5">
                <Zap size={10} className="text-[#00D26A]" />
                Routed via Polymarket · Demo Mode
              </div>

              <button className="cursor-pointer w-full py-3.5 rounded-xl font-bold text-[14px] text-black transition-all active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #00D26A, #009A4E)', boxShadow: '0 4px 20px rgba(0,210,106,0.3)' }}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
