"use client";

import { useState } from 'react';
import { Market } from '@/lib/polymarket/types';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

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
  const color = selectedOutcome === 'YES' ? '#00C566' : '#E8333A';

  if (!market || !selectedOutcome) return null;

  const validAmount = typeof amount === 'string' && amount === "" ? 0 : Number(amount);
  
  // Real price in cents vs dollars
  const priceInCents = Math.round(currentPrice * 100);
  const oppPriceInCents = 100 - priceInCents;
  
  // Calculate shares based on $1 payout
  const shares = currentPrice > 0 ? (validAmount / currentPrice).toFixed(1) : "0.0";
  
  // Payout math
  const potentialPayoutDollars = parseFloat(shares);
  const profitDollars = (potentialPayoutDollars - validAmount);
  const roi = validAmount > 0 ? ((profitDollars / validAmount) * 100).toFixed(0) : "0";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[420px] w-[95vw] sm:w-full bg-[#0F0D0B] border border-[#3D2E1E] text-white p-0 overflow-hidden shadow-2xl font-sans [&>button]:hidden sm:rounded-2xl rounded-none h-[95vh] sm:h-auto">
        
        {/* Header */}
        <div className="p-4 border-b border-[#3D2E1E] flex justify-between items-start bg-[#0B0A08]">
            <div className="pr-8">
                <h2 className="font-bold text-[18px] leading-snug mb-2 font-mono">
                    {market.question}
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">{priceInCents}¢ {selectedOutcome}</span>
                    <span className="bg-[#1A1511] border border-[#3D2E1E] text-[#00C566] text-xs font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
                        P Polymarket
                    </span>
                </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-[#1A1511] rounded-full transition-colors shrink-0">
                <X size={20} className="text-[#A69C8A]" />
            </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto h-[calc(100vh-80px)] sm:h-auto sm:max-h-[80vh] flex flex-col">
            
            {/* Outcome Selectors */}
            <div className="flex gap-2 sm:gap-3 mb-6 shrink-0">
                <button className={`flex-1 py-3 sm:py-4 rounded-xl border flex items-center justify-center gap-1 sm:gap-2 font-bold transition-all ${selectedOutcome === 'YES' ? 'bg-[#00C566] border-[#00C566] text-black shadow-[0_0_15px_rgba(0,197,102,0.3)]' : 'bg-[#110F0D] border-[#3D2E1E] text-[#A69C8A]'}`}>
                    <span className="text-lg leading-none">↗</span> Yes {selectedOutcome === 'YES' ? priceInCents : oppPriceInCents}¢
                </button>
                <button className={`flex-1 py-3 sm:py-4 rounded-xl border flex items-center justify-center gap-1 sm:gap-2 font-bold transition-all ${selectedOutcome === 'NO' ? 'bg-[#E8333A] border-[#E8333A] text-white shadow-[0_0_15px_rgba(232,51,58,0.3)]' : 'bg-[#110F0D] border-[#3D2E1E] text-[#A69C8A]'}`}>
                    <span className="text-lg leading-none pt-1">↘</span> No {selectedOutcome === 'NO' ? priceInCents : oppPriceInCents}¢
                </button>
            </div>

            {/* Route Order To */}
            <div className="mb-6">
                <p className="font-bold mb-3 text-[15px]">Route Order To</p>
                <div className="flex gap-3 text-sm font-bold">
                     <button className="bg-white text-black py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                         <span className="text-lg leading-none">⚡</span> Auto (Best)
                     </button>
                     <button className="bg-[#110F0D] text-[#A69C8A] border border-[#3D2E1E] py-2.5 px-4 rounded-xl flex flex-1 items-center justify-between">
                         <div className="flex items-center gap-1.5">
                             <span className="w-4 h-4 bg-[#1A1511] text-[#A69C8A] flex items-center justify-center text-[8px] rounded-full border border-[#3D2E1E]">P</span>
                             Polymarket
                         </div>
                         <div className="flex items-center gap-2">
                             <span>{priceInCents}¢</span>
                             <span className="text-[#00C566] text-[10px] uppercase">Best</span>
                         </div>
                     </button>
                </div>
            </div>

             {/* Order Type Toggle */}
             <div className="flex bg-[#110F0D] border border-[#3D2E1E] rounded-xl p-1 mb-6">
                <button className="flex-1 bg-[#1A1511] rounded-lg py-2 font-bold text-sm text-white shadow-sm border border-[#3D2E1E]/50">
                    Market
                </button>
                <button className="flex-1 rounded-lg py-2 font-bold text-sm text-[#A69C8A] hover:text-white transition-colors">
                    Limit
                </button>
            </div>

            {/* Amount */}
            <div className="mb-6">
                <p className="font-bold mb-3 text-[15px]">Amount</p>
                <div className="relative mb-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A69C8A] font-medium text-lg">$</span>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-[#110F0D] border border-[#3D2E1E] rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold text-lg focus:outline-none focus:border-[#00C566] focus:ring-1 focus:ring-[#00C566] transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {[10, 25, 50, 100].map((preset) => (
                        <button
                            key={preset}
                            onClick={() => setAmount(preset)}
                            className="flex-1 bg-[#1A1511] hover:bg-[#3D2E1E] text-white py-2 rounded-lg text-sm font-bold border border-[#3D2E1E]/50 transition-colors"
                        >
                            ${preset}
                        </button>
                    ))}
                </div>
            </div>

            {/* Receipt Summary */}
            <div className="space-y-3 mb-6 text-[13px] font-medium font-mono text-[#A69C8A] shrink-0">
                <div className="flex justify-between items-center">
                    <span>Exchange</span>
                    <span className="text-white flex items-center gap-1.5">
                        <span className="text-[#00C566] font-bold">P</span> Polymarket
                    </span>
                </div>
                <div className="flex justify-between items-center bg-[#110F0D] p-3 rounded-md border border-[#3D2E1E]/50">
                    <span>Shares</span>
                    <span className="text-white font-bold">{shares}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                    <span>Avg Price</span>
                    <span className="text-white font-bold">{priceInCents}¢</span>
                </div>
                <div className="flex justify-between items-center bg-[#110F0D] p-3 rounded border border-[#00C566]/30">
                    <span>Potential Return</span>
                    <span className="text-[#00C566] font-bold">
                        ${profitDollars > 0 ? profitDollars.toFixed(2) : "0.00"} ({roi}%)
                    </span>
                </div>
            </div>

            {/* Submit Button */}
            <div className="shrink-0 mt-auto pb-4">
                <button 
                    className="w-full py-4 rounded-xl font-bold text-lg font-mono shadow-xl transition-transform active:scale-[0.98]"
                    style={{ backgroundColor: color, color: selectedOutcome === 'YES' ? 'black' : 'white' }}
                    onClick={() => {
                        alert(`Simulating executing signature with POLY_BUILDER key... Executed Market Buy of ${shares} Shares for ${validAmount} USDC on ${selectedOutcome}`);
                        onClose();
                    }}
                >
                    Buy {selectedOutcome} • {shares} Shares
                </button>
                <p className="text-center text-[11px] text-[#A69C8A] mt-3 font-mono">
                    You win ${potentialPayoutDollars.toFixed(2)} if {selectedOutcome}. Max loss: ${validAmount.toFixed(2)}
                </p>
            </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
