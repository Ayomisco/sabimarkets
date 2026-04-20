"use client";

import Link from 'next/link';
import { Lightbulb, ArrowRight, Star } from 'lucide-react';

/**
 * A compact promo card inserted between market cards in the feed.
 * Invites users to create their own market.
 */
export function CreateMarketCTA({ variant = 'card' }: { variant?: 'card' | 'banner' }) {
  if (variant === 'banner') {
    return (
      <div className="w-full bg-gradient-to-r from-[#00D26A]/10 to-transparent border border-[#00D26A]/20 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/25 flex items-center justify-center shrink-0">
            <Lightbulb size={16} className="text-[#00D26A]" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white">Have a prediction?</p>
            <p className="text-[11px] text-[#7A7068]">Create a market and let the crowd decide.</p>
          </div>
        </div>
        <Link
          href="/create"
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#00D26A] hover:bg-[#00B85E] text-black text-[12px] font-bold rounded-xl transition-all"
        >
          Create Market <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0D09] border border-[#00D26A]/20 rounded-2xl p-5 flex flex-col gap-4 hover:border-[#00D26A]/35 transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00D26A]/12 border border-[#00D26A]/20 flex items-center justify-center">
          <Lightbulb size={18} className="text-[#00D26A]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-white leading-tight">Create a Market</p>
          <p className="text-[11px] text-[#7A7068]">Permissionless · On-chain</p>
        </div>
      </div>

      <p className="text-[12px] text-[#9A9088] leading-relaxed">
        Have a prediction about Africa&apos;s politics, economy, sports, or crypto? Turn it into a live market — anyone can bet.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {['Politics', 'Economy', 'Sports', 'Crypto'].map(tag => (
          <span key={tag} className="text-[10px] font-medium text-[#7A7068] bg-white/[0.04] border border-white/[0.07] px-2 py-1 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <Link
        href="/create"
        className="flex items-center justify-center gap-2 py-3 w-full bg-[#00D26A]/10 hover:bg-[#00D26A]/18 border border-[#00D26A]/25 hover:border-[#00D26A]/40 text-[#00D26A] text-[13px] font-bold rounded-xl transition-all"
      >
        <Star size={14} />
        Create Your Market
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
