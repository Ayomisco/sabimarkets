"use client";

import { useState } from 'react';
import { Market } from '@/lib/polymarket/types';
import MarketChart from './MarketChart';
import { MarketList } from './MarketList';
import { BetModal } from './BetModal';
import { MarketDetailModal } from './MarketDetailModal';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useAccount } from 'wagmi';
import { Activity, Clock, TrendingUp, DollarSign, BarChart2, Award, Wallet } from 'lucide-react';

interface Props {
  heroMarket: Market | null;
  feedMarkets: (Market & { uiCategory: string })[];
  heroYesPrice: number;
}

export function FeedAndPortfolio({ heroMarket, feedMarkets, heroYesPrice }: Props) {
  const [activeTab, setActiveTab] = useState<'markets' | 'portfolio'>('markets');
  const [portfolioSubTab, setPortfolioSubTab] = useState<'active' | 'history'>('active');
  const { positions } = usePortfolioStore();
  const { address } = useAccount();

  const [isHeroBetOpen, setHeroBetOpen] = useState(false);
  const [heroOutcome, setHeroOutcome] = useState<"YES"|"NO"|null>(null);
  const [isHeroDetailOpen, setHeroDetailOpen] = useState(false);

  const handleHeroBet = (outcome: "YES"|"NO") => {
    setHeroOutcome(outcome);
    setHeroBetOpen(true);
  };

  return (
    <div className="w-full">
      
      {/* ─── TOP NAV TABS ─── */}
      <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] p-1 rounded-xl w-max mb-8">
        <button 
          onClick={() => setActiveTab('markets')}
          className={`cursor-pointer px-5 py-2 rounded-lg font-semibold text-[13px] transition-all ${
            activeTab === 'markets' 
              ? 'bg-white/[0.08] text-white shadow-sm' 
              : 'text-[#7A7068] hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          Markets
        </button>
        <button 
          onClick={() => setActiveTab('portfolio')}
          className={`cursor-pointer px-5 py-2 rounded-lg font-semibold text-[13px] transition-all ${
            activeTab === 'portfolio' 
              ? 'bg-white/[0.08] text-white shadow-sm' 
              : 'text-[#7A7068] hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          Portfolio {positions.length > 0 && <span className="ml-1.5 text-[10px] bg-[#00D26A] text-black px-1.5 py-0.5 rounded-full font-bold">{positions.length}</span>}
        </button>
      </div>

      {/* ─── PORTFOLIO TAB ─── */}
      {activeTab === 'portfolio' && (
        <div className="w-full flex flex-col fade-in">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {[
              { label: 'Portfolio Value', value: '$0.00', icon: DollarSign, color: 'text-white' },
              { label: 'Cash Balance', value: '$0.00', icon: Wallet, color: 'text-white' },
              { label: 'Total P&L', value: '+$0.00', icon: TrendingUp, color: 'text-[#7A7068]' },
              { label: 'Return', value: '0.00%', icon: BarChart2, color: 'text-[#7A7068]' },
              { label: 'Total Profit', value: '78.5%', icon: TrendingUp, color: 'text-[#00D26A]' },
              { label: 'Win Rate', value: '43%', icon: Award, color: 'text-white' },
              { label: 'Total Bets', value: `${positions.length || 0}`, icon: Activity, color: 'text-white' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0F0D0B] border border-white/[0.07] rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#7A7068] uppercase tracking-wider font-medium">{stat.label}</span>
                  <stat.icon size={12} className="text-[#7A7068]/60" />
                </div>
                <span className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl w-max">
            <button 
              onClick={() => setPortfolioSubTab('active')}
              className={`cursor-pointer pb-0 px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-all ${
                portfolioSubTab === 'active' 
                  ? 'bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/20' 
                  : 'text-[#7A7068] hover:text-white'
              }`}
            >
              <Activity size={14} /> Active Bets
            </button>
            <button 
              onClick={() => setPortfolioSubTab('history')}
              className={`cursor-pointer px-4 py-2 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-all ${
                portfolioSubTab === 'history' 
                  ? 'bg-white/[0.08] text-white border border-white/10' 
                  : 'text-[#7A7068] hover:text-white'
              }`}
            >
              <Clock size={14} /> History
            </button>
          </div>
          
          {!address ? (
            <div className="w-full bg-[#0F0D0B] border border-white/[0.07] rounded-2xl p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
                <Wallet size={28} className="text-[#7A7068]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-[#7A7068] text-sm max-w-xs mb-6 leading-relaxed">Connect your wallet to view your active SabiMarket positions and portfolio overview.</p>
            </div>
          ) : portfolioSubTab === 'history' ? (
            <div className="w-full bg-[#0F0D0B] border border-white/[0.07] rounded-2xl p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
                <Clock size={28} className="text-[#7A7068]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Trade History Yet</h3>
              <p className="text-[#7A7068] text-sm">Completed trades will show up here.</p>
            </div>
          ) : positions.length === 0 ? (
            <div className="w-full bg-[#0F0D0B] border border-white/[0.07] rounded-2xl p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-5">
                <BarChart2 size={28} className="text-[#7A7068]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Active Positions</h3>
              <p className="text-[#7A7068] text-sm max-w-xs mb-6 leading-relaxed">You haven't placed any trades yet. Head to the Markets tab to start.</p>
              <button onClick={() => setActiveTab('markets')} className="cursor-pointer bg-[#00D26A] text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#00B85E] transition-colors">
                Explore Markets →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map((pos) => (
                <div key={pos.id} className="bg-[#0F0D0B] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.14] transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-white text-[14px] leading-snug line-clamp-2 pr-4">{pos.marketTitle}</h4>
                    <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      pos.outcome === 'YES' ? 'bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/20' : 'bg-[#FF4560]/10 text-[#FF4560] border border-[#FF4560]/20'
                    }`}>{pos.outcome}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4 border-y border-white/[0.05] py-4">
                    <div>
                      <p className="text-[#7A7068] text-[10px] uppercase mb-1 font-medium">Shares</p>
                      <p className="font-bold text-white font-mono text-sm">{pos.shares.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-[#7A7068] text-[10px] uppercase mb-1 font-medium">Entry</p>
                      <p className="font-bold text-white font-mono text-sm">{Math.round(pos.avgPrice * 100)}¢</p>
                    </div>
                    <div>
                      <p className="text-[#7A7068] text-[10px] uppercase mb-1 font-medium">Cost</p>
                      <p className="font-bold text-white font-mono text-sm">${pos.totalCost.toFixed(2)}</p>
                    </div>
                  </div>
                  <button className="cursor-pointer w-full bg-white/[0.04] border border-white/[0.07] text-[#7A7068] hover:text-[#FF4560] hover:border-[#FF4560]/30 py-2 rounded-xl text-[12px] font-semibold transition-all">
                    Close Position
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── MARKETS TAB ─── */}
      {activeTab === 'markets' && (
        <div className="fade-in">
          
          {/* Hero Market */}
          {heroMarket && (
            <div className="w-full rounded-2xl border border-white/[0.07] mb-10 overflow-hidden relative"
                 style={{ background: 'linear-gradient(135deg, #0F0D0B 0%, #121009 100%)' }}>
              {/* Ambient glow */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.06] pointer-events-none"
                   style={{ background: 'radial-gradient(circle, #00D26A 0%, transparent 70%)' }} />
              
              <div className="flex flex-col lg:flex-row">
                {/* Left: Info */}
                <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between relative z-10">
                  <div>
                    {/* Badges */}
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-[11px] font-bold text-[#FF4560] bg-[#FF4560]/10 border border-[#FF4560]/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                        🔥 Trending Now
                      </span>
                      <span className="text-[11px] text-[#7A7068] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-pulse inline-block" />
                        Live Oracle
                      </span>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
                      {heroMarket.question}
                    </h2>
                    <p className="text-[#7A7068] text-sm leading-relaxed mb-6 line-clamp-2 max-w-2xl">
                      {heroMarket.description || "This market resolves based on an official consensus from verified sources. The resolution will reflect the final, confirmed outcome."}
                    </p>
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-6 py-4 border-t border-white/[0.06] mb-6">
                    <div>
                      <p className="text-[#7A7068] text-[10px] uppercase tracking-wider mb-1 font-medium">Volume</p>
                      <p className="text-lg font-bold text-white font-mono">${parseInt(heroMarket.volume || "0").toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#7A7068] text-[10px] uppercase tracking-wider mb-1 font-medium">YES Probability</p>
                      <p className="text-lg font-bold text-[#00D26A] font-mono">{Math.round(heroYesPrice * 100)}%</p>
                    </div>
                    <div>
                      <p className="text-[#7A7068] text-[10px] uppercase tracking-wider mb-1 font-medium">Source</p>
                      <p className="text-lg font-bold text-white font-mono">Polymarket</p>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleHeroBet('YES')}
                      className="cursor-pointer flex-1 sm:flex-none sm:px-8 py-3 rounded-xl font-bold text-[14px] text-black transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #00D26A, #009A4E)', boxShadow: '0 4px 20px rgba(0,210,106,0.3)' }}
                    >
                      Bet YES · {Math.round(heroYesPrice * 100)}¢
                    </button>
                    <button 
                      onClick={() => handleHeroBet('NO')}
                      className="cursor-pointer flex-1 sm:flex-none sm:px-8 py-3 rounded-xl font-bold text-[14px] text-white transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{ background: 'linear-gradient(135deg, #FF4560, #CC2E45)', boxShadow: '0 4px 20px rgba(255,69,96,0.3)' }}
                    >
                      Bet NO · {100 - Math.round(heroYesPrice * 100)}¢
                    </button>
                    <button
                      onClick={() => setHeroDetailOpen(true)}
                      className="cursor-pointer flex items-center gap-1.5 text-[#7A7068] hover:text-white text-sm font-medium transition-colors px-3 py-3 rounded-xl border border-white/[0.07] hover:bg-white/[0.05]"
                    >
                      View Details ↗
                    </button>
                  </div>
                </div>

                {/* Right: Chart */}
                <div className="w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.06] bg-[#080706]/40 p-4 flex flex-col">
                  <div className="flex justify-between items-center text-[#7A7068] text-[11px] font-medium mb-3">
                    <span>Implied Probability</span>
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00D26A]" /> YES</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FF4560]" /> NO</span>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[220px] relative">
                    <MarketChart currentYesPrice={heroYesPrice} yesTokenId={heroMarket?.tokens?.[0]?.token_id} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Markets Feed */}
          {feedMarkets && feedMarkets.length > 0 ? (
            <MarketList initialMarkets={feedMarkets} />
          ) : (
            <div className="text-center py-20 text-[#7A7068] font-mono text-sm">
              Scanning for African markets...
            </div>
          )}
        </div>
      )}

      <BetModal
        isOpen={isHeroBetOpen}
        onClose={() => setHeroBetOpen(false)}
        market={heroMarket}
        selectedOutcome={heroOutcome}
        currentPrice={heroOutcome === 'YES' ? heroYesPrice : (1 - heroYesPrice)}
      />
      <MarketDetailModal
        isOpen={isHeroDetailOpen}
        onClose={() => setHeroDetailOpen(false)}
        market={heroMarket}
      />
    </div>
  );
}
