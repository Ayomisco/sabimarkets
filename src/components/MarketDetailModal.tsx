"use client";

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Market } from '@/lib/polymarket/types';
import { Share2, BookmarkPlus, ExternalLink, TrendingUp, Clock, X, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useMarketStore } from "@/store/marketStore";
import MarketChart from './MarketChart';

import { useState } from 'react';

export function MarketDetailModal({
  isOpen,
  onClose,
  market,
  onBet
}: {
  isOpen: boolean;
  onClose: () => void;
  market: Market | null;
  onBet?: (outcome: string, price: number) => void;
}) {
  const { livePrices } = useMarketStore();
  const [selectedOutcome, setSelectedOutcome] = useState<string>("YES");

  if (!market) return null;

  const outcomes = market.outcomes || ["Yes", "No"];
  const outcomePrices = market.outcomePrices || ["0.5", "0.5"];
  const isMultiOutcome = outcomes.length > 2;
  const volUSDC = parseInt(market.volume || "0");
  const stringVol = volUSDC >= 1_000_000
    ? (volUSDC / 1_000_000).toFixed(1) + 'M'
    : volUSDC >= 1_000
    ? (volUSDC / 1_000).toFixed(1) + 'K'
    : String(volUSDC);
  const closeDate = market.endDate
    ? new Date(market.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : "Open";

  const yesTokenId = market.tokens?.[0]?.token_id;
  const currentYesPrice = yesTokenId && livePrices[yesTokenId] !== undefined
    ? livePrices[yesTokenId]
    : parseFloat(outcomePrices[0] || "0.5");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className={[
          // Mobile: true fullscreen sheet
          "!top-0 !bottom-0 !left-0 !right-0 !translate-x-0 !translate-y-0",
          "w-full max-w-full h-full min-h-full",
          "rounded-none",
          // Desktop: centred large card
          "sm:!top-[50%] sm:!bottom-auto sm:!left-[50%] sm:!right-auto",
          "sm:!translate-x-[-50%] sm:!translate-y-[-50%]",
          "sm:max-w-[95vw] sm:w-[1100px] sm:h-[90vh] sm:min-h-0 sm:rounded-2xl",
          // Common
          "bg-[#0A0908] border-0 sm:border sm:border-white/[0.07] text-white p-0 overflow-hidden flex flex-col [&>button]:hidden",
        ].join(" ")}
      >
        {/* ── Header ─── */}
        <div className="flex items-start gap-3 px-4 sm:px-6 py-3.5 border-b border-white/[0.06] bg-[#0A0908]/95 backdrop-blur sticky top-0 z-20 shrink-0">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center overflow-hidden">
            {market.icon
              ? <img src={market.icon} alt="" className="w-full h-full object-cover" />
              : <span className="text-base">🌍</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] sm:text-[16px] font-bold text-white leading-tight line-clamp-2 mb-1 pr-2">{market.question}</h2>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#7A7068]">
              <span className="flex items-center gap-1"><TrendingUp size={11} />${stringVol} Vol.</span>
              <span className="flex items-center gap-1"><Clock size={11} />Closes {closeDate}</span>
              <span className="flex items-center gap-1 text-[#00D26A]"><Zap size={10} fill="#00D26A" />Polymarket</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a href={`https://polymarket.com/event/${market.slug || market.condition_id}`}
               target="_blank" rel="noopener noreferrer"
               className="hidden sm:flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-[#7A7068] hover:text-white transition-colors">
              <ExternalLink size={12} /> Polymarket
            </a>
            <button className="cursor-pointer p-2 bg-white/[0.04] border border-white/[0.07] rounded-lg text-[#7A7068] hover:text-white transition-colors hidden sm:flex">
              <Share2 size={13} />
            </button>
            <button onClick={onClose}
              className="cursor-pointer p-2 bg-white/[0.04] border border-white/[0.07] rounded-lg text-[#7A7068] hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ─── */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-white/[0.05]">

            {/* Left — Chart + Outcomes */}
            <div className="flex-1 min-w-0 px-4 sm:px-6 pt-5 pb-6 flex flex-col gap-5">

              {/* Timeframe pills */}
              <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-0.5">
                {['1H', '6H', '1D', '1W', '1M', 'ALL'].map(tf => (
                  <button key={tf}
                    className={`cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
                      tf === 'ALL' ? 'bg-white/[0.08] text-white border border-white/[0.12]' : 'text-[#7A7068] hover:text-white hover:bg-white/[0.04]'
                    }`}>
                    {tf}
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div className="h-[200px] sm:h-[260px] w-full relative">
                <div className="flex justify-between items-center text-[10px] text-[#7A7068] mb-2">
                  <span>Implied Probability</span>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00D26A]" />YES</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF4560]" />NO</span>
                  </div>
                </div>
                <MarketChart currentYesPrice={currentYesPrice} yesTokenId={yesTokenId} />
              </div>

              {/* Outcomes */}
              <div>
                <p className="text-[10px] font-semibold text-[#7A7068] uppercase tracking-widest mb-2">Outcomes</p>
                <div className="space-y-2">
                  {outcomes.map((name: string, i: number) => {
                    const tId = market.tokens?.[i]?.token_id;
                    const price = tId && livePrices[tId] !== undefined ? livePrices[tId] : parseFloat(outcomePrices[i] || "0.5");
                    // Format percentage: show decimal for values < 1%
                    const pct = price * 100;
                    const pctDisplay = pct < 1 && pct > 0 ? pct.toFixed(1) : Math.round(pct).toString();
                    // Color coding: green for first, red for last, blue for middle outcomes
                    const getOutcomeColor = (index: number) => {
                      if (!isMultiOutcome) return index === 0 ? '#00D26A' : '#FF4560';
                      if (index === 0) return '#00D26A';
                      if (index === outcomes.length - 1) return '#FF4560';
                      return '#3B82F6'; // blue for middle outcomes
                    };
                    const color = getOutcomeColor(i);
                    return (
                      <div key={i} className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 gap-3 hover:border-white/[0.12] transition-colors">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-white text-[13px] flex-1">{name}</span>
                        <div className="hidden sm:block w-20">
                          <div className="h-1 rounded-full bg-white/[0.08]">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                        <span className="font-bold font-mono text-white w-10 text-right text-[14px]">{pctDisplay}%</span>
                        <button 
                          onClick={() => {
                            setSelectedOutcome(name);
                            if (onBet) {
                              onBet(name, price);
                              onClose();
                            }
                          }}
                          className="cursor-pointer px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all border bg-white/[0.05] border-white/[0.1] hover:bg-white/[0.1] text-white">
                          {(price * 100).toFixed(1)}¢
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              {market.description && (
                <div className="pt-3 border-t border-white/[0.05]">
                  <p className="text-[10px] font-semibold text-[#7A7068] uppercase tracking-widest mb-2">About</p>
                  <p className="text-[12px] text-[#7A7068] leading-relaxed line-clamp-4">{market.description}</p>
                </div>
              )}
            </div>

            {/* Right — Order widget */}
            <div className="lg:w-[320px] xl:w-[360px] shrink-0 px-4 sm:px-5 py-5 border-t border-white/[0.05] lg:border-t-0 bg-[#0D0B09]">
              <div className="lg:sticky lg:top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[14px]">Place Order</h3>
                  <span className="text-[10px] text-[#00D26A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#00D26A] rounded-full animate-pulse" /> Auto Route
                  </span>
                </div>

                {/* Outcome buttons - dynamic grid based on count */}
                <div className={`grid gap-2 mb-4 ${isMultiOutcome ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {outcomes.map((name: string, i: number) => {
                    const tId = market.tokens?.[i]?.token_id;
                    const price = tId && livePrices[tId] !== undefined ? livePrices[tId] : parseFloat(outcomePrices[i] || "0.5");
                    const pct = price * 100;
                    const pctDisplay = pct < 1 && pct > 0 ? pct.toFixed(1) : Math.round(pct).toString();
                    const isSelected = selectedOutcome === name;
                    // Color coding
                    const getOutcomeColor = (index: number) => {
                      if (!isMultiOutcome) return index === 0 ? '#00D26A' : '#FF4560';
                      if (index === 0) return '#00D26A';
                      if (index === outcomes.length - 1) return '#FF4560';
                      return '#3B82F6';
                    };
                    const color = getOutcomeColor(i);
                    return (
                      <button 
                        key={i} 
                        onClick={() => setSelectedOutcome(name)} 
                        className={`cursor-pointer rounded-xl border font-bold transition-all hover:opacity-90 ${
                          isMultiOutcome 
                            ? 'p-2.5 flex items-center justify-between' 
                            : 'p-3 flex flex-col items-center justify-center gap-1'
                        } ${isSelected ? 'ring-2' : ''}`}
                        style={{
                          backgroundColor: isSelected ? `${color}20` : `${color}08`,
                          borderColor: isSelected ? color : `${color}30`,
                          color: isSelected ? color : `${color}99`,
                          '--tw-ring-color': color
                        } as React.CSSProperties}>
                        <span className={isMultiOutcome ? "text-[12px] font-semibold" : "text-[10px] uppercase tracking-wider opacity-80"}>{name}</span>
                        <span className={isMultiOutcome ? "text-[14px] font-bold font-mono" : "text-[18px] font-bold"}>{pctDisplay}¢</span>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-[#7A7068] text-center flex items-center justify-center gap-1.5 mb-3">
                  <Zap size={10} className="text-[#00D26A]" /> Routed via Polymarket CLOB
                </p>

                <button 
                  onClick={() => {
                    if (onBet) {
                      const selectedIndex = outcomes.indexOf(selectedOutcome);
                      const tId = market.tokens?.[selectedIndex]?.token_id;
                      const price = tId && livePrices[tId] !== undefined ? livePrices[tId] : parseFloat(outcomePrices[selectedIndex] || "0.5");
                      onBet(selectedOutcome, price);
                      onClose();
                    }
                  }}
                  className="cursor-pointer w-full py-3.5 rounded-xl font-bold text-[14px] text-black transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #00D26A, #009A4E)', boxShadow: '0 4px 22px rgba(0,210,106,0.3)' }}>
                  Continue to Order →
                </button>

                {/* Links row */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <a href={`https://polymarket.com/event/${market.slug || market.condition_id}`}
                     target="_blank" rel="noopener noreferrer"
                     className="cursor-pointer flex items-center gap-1 text-[11px] text-[#7A7068] hover:text-white transition-colors">
                    <ExternalLink size={11} /> View on Polymarket
                  </a>
                  <span className="text-white/20">|</span>
                  <button className="cursor-pointer flex items-center gap-1 text-[11px] text-[#7A7068] hover:text-white transition-colors">
                    <Share2 size={11} /> Share
                  </button>
                  <button className="cursor-pointer flex items-center gap-1 text-[11px] text-[#7A7068] hover:text-white transition-colors">
                    <BookmarkPlus size={11} /> Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
