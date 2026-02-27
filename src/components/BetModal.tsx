"use client";

import { useState } from 'react';
import { Market } from '@/lib/polymarket/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Loader2, Zap, ArrowUpRight, ArrowDownRight, ChevronUp } from 'lucide-react';
import { useAccount, useSignTypedData } from 'wagmi';
import { usePortfolioStore } from '@/store/portfolioStore';

export function BetModal({
  isOpen,
  onClose,
  market,
  selectedOutcome,
  currentPrice,
}: {
  isOpen: boolean;
  onClose: () => void;
  market: Market | null;
  selectedOutcome: "YES" | "NO" | null;
  currentPrice: number;
}) {
  const [amount, setAmount] = useState<number | string>(10);
  const [isSigning, setIsSigning] = useState(false);

  const isYes = selectedOutcome === 'YES';
  const accentColor = isYes ? '#00D26A' : '#FF4560';

  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const { addPosition } = usePortfolioStore();

  if (!market || !selectedOutcome) return null;

  const validAmount = typeof amount === 'string' && amount === "" ? 0 : Number(amount);
  const priceInCents = Math.round(currentPrice * 100);
  const oppPriceInCents = 100 - priceInCents;
  const shares = currentPrice > 0 ? (validAmount / currentPrice).toFixed(1) : "0.0";
  const potentialPayoutDollars = parseFloat(shares);
  const profitDollars = potentialPayoutDollars - validAmount;
  const roi = validAmount > 0 ? ((profitDollars / validAmount) * 100).toFixed(0) : "0";

  const handlePlaceOrder = async () => {
    if (!address) { alert('Connect your wallet first!'); return; }
    setIsSigning(true);
    try {
      await signTypedDataAsync({
        domain: { name: "Polymarket CTF Exchange", version: "1", chainId: 137 },
        types: {
          Order: [
            { name: "salt", type: "uint256" }, { name: "maker", type: "address" },
            { name: "signer", type: "address" }, { name: "taker", type: "address" },
            { name: "tokenId", type: "uint256" }, { name: "makerAmount", type: "uint256" },
            { name: "takerAmount", type: "uint256" },
          ]
        },
        primaryType: "Order",
        message: {
          salt: BigInt(Date.now()), maker: address, signer: address,
          taker: "0x0000000000000000000000000000000000000000",
          tokenId: BigInt(123456789),
          makerAmount: BigInt(validAmount * 1000000),
          takerAmount: BigInt(parseFloat(shares) * 1000000),
        }
      });
      addPosition({
        marketTitle: market.question, outcome: selectedOutcome,
        shares: parseFloat(shares), avgPrice: currentPrice,
        totalCost: validAmount, tokenId: market.tokens?.[0]?.token_id
      });
      alert("Order placed! Check your Portfolio tab.");
      onClose();
    } catch (err) { console.error(err); }
    finally { setIsSigning(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/*
        Mobile: fixed to bottom of screen like a drawer (no transform, anchored bottom)
        Desktop (sm+): centered modal card capped at 420px
      */}
      <DialogContent
        showCloseButton={false}
        className={[
          // ── Mobile: bottom sheet ───────────────────────────────────────────
          "!top-auto !bottom-0 !left-0 !right-0 !translate-x-0 !translate-y-0",
          "w-full max-w-full",
          "rounded-t-3xl rounded-b-none",
          "data-[state=open]:animate-none data-[state=closed]:animate-none",
          // ── Slide-up animation for mobile ──────────────────────────────────
          "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          "transition-transform duration-300",
          // ── Desktop: revert to centred card ───────────────────────────────
          "sm:!top-[50%] sm:!bottom-auto sm:!left-[50%] sm:!right-auto",
          "sm:!translate-x-[-50%] sm:!translate-y-[-50%]",
          "sm:max-w-[420px] sm:rounded-2xl",
          // ── Common ────────────────────────────────────────────────────────
          "bg-[#0F0D0B] border border-white/[0.08] text-white p-0 overflow-hidden shadow-2xl [&>button]:hidden",
        ].join(" ")}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Top accent bar */}
        <div className="h-[3px] w-full mx-0" style={{ background: `linear-gradient(90deg, ${accentColor}70, ${accentColor})` }} />

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.06] flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border"
                   style={{ color: accentColor, backgroundColor: `${accentColor}18`, borderColor: `${accentColor}30` }}>
                {isYes ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                Betting {selectedOutcome}
              </div>
              <span className="text-[11px] text-[#7A7068] flex items-center gap-1">
                <Zap size={10} className="text-[#00D26A]" /> Polymarket
              </span>
            </div>
            <p className="text-[13px] text-[#7A7068] leading-snug line-clamp-2">{market.question}</p>
          </div>
          <button onClick={onClose}
            className="cursor-pointer p-1.5 hover:bg-white/[0.08] rounded-lg transition-colors shrink-0 text-[#7A7068] hover:text-white mt-0.5">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-6 flex flex-col gap-4 overflow-y-auto max-h-[72vh] sm:max-h-none">

          {/* YES / NO toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              className="cursor-pointer py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
              style={isYes
                ? { backgroundColor: '#00D26A', borderColor: '#00D26A', color: '#000', boxShadow: '0 4px 18px rgba(0,210,106,0.35)' }
                : { borderColor: 'rgba(255,255,255,0.08)', color: '#7A7068' }
              }
            >
              <ArrowUpRight size={14} /> YES · {isYes ? priceInCents : oppPriceInCents}¢
            </button>
            <button
              className="cursor-pointer py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-1.5 transition-all"
              style={!isYes
                ? { backgroundColor: '#FF4560', borderColor: '#FF4560', color: '#fff', boxShadow: '0 4px 18px rgba(255,69,96,0.35)' }
                : { borderColor: 'rgba(255,255,255,0.08)', color: '#7A7068' }
              }
            >
              <ArrowDownRight size={14} /> NO · {!isYes ? priceInCents : oppPriceInCents}¢
            </button>
          </div>

          {/* Amount */}
          <div>
            <p className="text-[10px] font-semibold text-[#7A7068] uppercase tracking-widest mb-2">Amount (USDC)</p>
            <div className="relative mb-2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7068] text-sm pointer-events-none">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold text-[15px] focus:outline-none focus:ring-1 transition-all"
                style={{ '--tw-ring-color': accentColor } as any}
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[10, 25, 50, 100].map(p => (
                <button key={p} onClick={() => setAmount(p)}
                  className="cursor-pointer py-2 rounded-lg text-[11px] font-bold border border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.09] text-[#7A7068] hover:text-white transition-all">
                  ${p}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.022] divide-y divide-white/[0.05]">
            <div className="flex justify-between items-center px-4 py-2.5 text-[12px]">
              <span className="text-[#7A7068]">Shares</span>
              <span className="font-mono font-bold text-white">{shares}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5 text-[12px]">
              <span className="text-[#7A7068]">Avg Price</span>
              <span className="font-mono font-bold text-white">{priceInCents}¢</span>
            </div>
            <div className="flex justify-between items-center px-4 py-2.5 text-[12px]">
              <span className="text-[#7A7068]">Potential Return</span>
              <span className="font-mono font-bold" style={{ color: accentColor }}>
                ${potentialPayoutDollars.toFixed(2)} (+{roi}%)
              </span>
            </div>
          </div>

          {/* CTA */}
          <button
            disabled={isSigning || validAmount <= 0}
            onClick={handlePlaceOrder}
            className="cursor-pointer w-full py-4 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: accentColor,
              color: isYes ? '#000' : '#fff',
              boxShadow: `0 6px 24px ${accentColor}45`,
            }}
          >
            {isSigning ? <><Loader2 className="animate-spin" size={16} /> Signing...</> : `Buy ${selectedOutcome} · ${shares} Shares`}
          </button>
          <p className="text-center text-[10px] text-[#7A7068] font-mono -mt-2">
            Max win ${potentialPayoutDollars.toFixed(2)} · Max loss ${validAmount.toFixed(2)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
