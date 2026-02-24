"use client";

import { useState } from 'react';
import { Market } from '@/lib/polymarket/types';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { X, Loader2, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    if (!address) {
      alert('Please connect your wallet first!');
      return;
    }
    setIsSigning(true);
    try {
      await signTypedDataAsync({
        domain: {
          name: "Polymarket CTF Exchange",
          version: "1",
          chainId: 137,
        },
        types: {
          Order: [
            { name: "salt", type: "uint256" },
            { name: "maker", type: "address" },
            { name: "signer", type: "address" },
            { name: "taker", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "makerAmount", type: "uint256" },
            { name: "takerAmount", type: "uint256" },
          ]
        },
        primaryType: "Order",
        message: {
          salt: BigInt(Date.now()),
          maker: address,
          signer: address,
          taker: "0x0000000000000000000000000000000000000000",
          tokenId: BigInt(123456789),
          makerAmount: BigInt(validAmount * 1000000),
          takerAmount: BigInt(parseFloat(shares) * 1000000),
        }
      });

      addPosition({
        marketTitle: market.question,
        outcome: selectedOutcome,
        shares: parseFloat(shares),
        avgPrice: currentPrice,
        totalCost: validAmount,
        tokenId: market.tokens?.[0]?.token_id
      });

      alert("Order placed! Check your Portfolio tab.");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] w-[95vw] bg-[#0F0D0B] border border-white/[0.08] text-white p-0 overflow-hidden shadow-2xl [&>button]:hidden sm:rounded-2xl rounded-2xl">
        
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}aa, ${accentColor})` }} />

        {/* Header */}
        <div className="px-5 pt-4 pb-4 border-b border-white/[0.06] flex justify-between items-start">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full border"
                   style={{ color: accentColor, backgroundColor: `${accentColor}18`, borderColor: `${accentColor}30` }}>
                {isYes ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                Betting {selectedOutcome}
              </div>
              <span className="text-[11px] text-[#7A7068] flex items-center gap-1">
                <Zap size={10} className="text-[#00D26A]" /> via Polymarket
              </span>
            </div>
            <p className="text-[13px] text-[#7A7068] leading-snug line-clamp-2">{market.question}</p>
          </div>
          <button onClick={onClose} className="cursor-pointer p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors shrink-0 text-[#7A7068] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-5 flex flex-col gap-4">
            
            {/* Outcome Selectors */}
            <div className="flex gap-2">
              <button className={`cursor-pointer flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${isYes ? 'text-black border-[#00D26A]' : 'border-white/[0.08] text-[#7A7068] hover:border-white/[0.15] hover:text-white'}`}
                style={isYes ? { backgroundColor: '#00D26A', boxShadow: '0 4px 16px rgba(0,210,106,0.3)' } : {}}>
                <ArrowUpRight size={14} /> Yes · {isYes ? priceInCents : oppPriceInCents}¢
              </button>
              <button className={`cursor-pointer flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${!isYes ? 'text-white border-[#FF4560]' : 'border-white/[0.08] text-[#7A7068] hover:border-white/[0.15] hover:text-white'}`}
                style={!isYes ? { backgroundColor: '#FF4560', boxShadow: '0 4px 16px rgba(255,69,96,0.3)' } : {}}>
                <ArrowDownRight size={14} /> No · {!isYes ? priceInCents : oppPriceInCents}¢
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <p className="text-[11px] font-semibold text-[#7A7068] uppercase tracking-wider mb-2">Amount (USDC)</p>
              <div className="relative mb-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7068] font-medium text-sm">$</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-7 pr-4 text-white font-mono font-bold text-base focus:outline-none focus:ring-1 focus:border-transparent transition-all"
                  style={{ '--tw-ring-color': accentColor } as any}
                />
              </div>
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className="cursor-pointer flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-[#7A7068] hover:text-white py-1.5 rounded-lg text-[11px] font-bold border border-white/[0.06] transition-all"
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5 text-[12px] font-medium">
              <div className="flex justify-between items-center">
                <span className="text-[#7A7068]">Shares</span>
                <span className="text-white font-mono font-bold">{shares}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#7A7068]">Avg Price</span>
                <span className="text-white font-mono font-bold">{priceInCents}¢</span>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <div className="flex justify-between items-center">
                <span className="text-[#7A7068]">Potential Return</span>
                <span className="font-bold font-mono" style={{ color: accentColor }}>
                  ${potentialPayoutDollars.toFixed(2)} (+{roi}%)
                </span>
              </div>
            </div>

            {/* Submit */}
            <button 
              disabled={isSigning || validAmount <= 0}
              onClick={handlePlaceOrder}
              className="cursor-pointer w-full py-3.5 rounded-xl font-bold text-[14px] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: accentColor, 
                color: isYes ? 'black' : 'white',
                boxShadow: `0 4px 20px ${accentColor}40`
              }}
            >
              {isSigning ? (
                <><Loader2 className="animate-spin" size={16} /> Signing Order...</>
              ) : (
                `Buy ${selectedOutcome} · ${shares} Shares`
              )}
            </button>
            <p className="text-center text-[10px] text-[#7A7068] font-mono -mt-1">
              Max win ${potentialPayoutDollars.toFixed(2)} · Max loss ${validAmount.toFixed(2)}
            </p>

        </div>
      </DialogContent>
    </Dialog>
  );
}
