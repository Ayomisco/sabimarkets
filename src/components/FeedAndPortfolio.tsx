"use client";

import { useState } from 'react';
import { Market } from '@/lib/polymarket/types';
import MarketChart from './MarketChart';
import { MarketList } from './MarketList';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useAccount } from 'wagmi';

interface Props {
  heroMarket: Market | null;
  feedMarkets: (Market & { uiCategory: string })[];
  heroYesPrice: number;
}

export function FeedAndPortfolio({ heroMarket, feedMarkets, heroYesPrice }: Props) {
  const [activeTab, setActiveTab] = useState<'markets' | 'portfolio'>('markets');
  const { positions } = usePortfolioStore();
  const { address } = useAccount();

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-24 relative z-10 w-full">
      
      {/* Toggle Markets / Portfolio */}
      <div className="flex bg-[#110F0D] border border-[#3D2E1E] p-1 rounded-full w-max mb-8">
          <button 
              onClick={() => setActiveTab('markets')}
              className={`px-6 py-1.5 rounded-full font-medium text-sm transition-all shadow-sm ${activeTab === 'markets' ? 'bg-[#3D2E1E]/50 text-white' : 'text-[#A69C8A] hover:text-white'}`}
          >
              Markets
          </button>
          <button 
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-1.5 rounded-full font-medium text-sm transition-all shadow-sm ${activeTab === 'portfolio' ? 'bg-[#3D2E1E]/50 text-white' : 'text-[#A69C8A] hover:text-white'}`}
          >
              Portfolio
          </button>
      </div>

      {activeTab === 'portfolio' && (
          <div className="w-full flex flex-col pt-0 fade-in">
              <h2 className="text-2xl font-bold font-mono text-white mb-6">Your Positions</h2>
              
              {!address ? (
                  <div className="w-full bg-[#110F0D] border border-[#3D2E1E] rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
                      <span className="text-4xl mb-4">👛</span>
                      <h3 className="text-xl font-bold text-white font-mono mb-2">Connect Your Wallet</h3>
                      <p className="text-[#A69C8A] max-w-sm mb-6">Please connect your wallet at the top right to view your active SabiMarkets positions.</p>
                  </div>
              ) : positions.length === 0 ? (
                  <div className="w-full bg-[#110F0D] border border-[#3D2E1E] rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
                      <span className="text-4xl mb-4">📉</span>
                      <h3 className="text-xl font-bold text-white font-mono mb-2">No Active Positions</h3>
                      <p className="text-[#A69C8A] max-w-sm mb-6">You haven't placed any trades. Switch back to the Markets tab to start trading.</p>
                      <button onClick={() => setActiveTab('markets')} className="bg-[#00C566] text-black px-6 py-2 rounded-xl font-bold">
                          Explore Markets
                      </button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {positions.map((pos) => (
                          <div key={pos.id} className="bg-[#110F0D] border border-[#3D2E1E] rounded-xl p-5 shadow-lg group hover:border-[#A69C8A]/30 transition-all">
                              <div className="flex justify-between items-start mb-4">
                                  <h4 className="font-bold text-white text-[15px] font-mono leading-snug line-clamp-2 pr-4">{pos.marketTitle}</h4>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-4 border-y border-[#3D2E1E] pb-4 pt-4">
                                  <div>
                                      <p className="text-[#A69C8A] text-xs uppercase mb-1">Position</p>
                                      <p className={`font-bold ${pos.outcome === 'YES' ? 'text-[#00C566]' : 'text-[#E8333A]'}`}>
                                          {pos.outcome} • {pos.shares.toFixed(1)} Shares
                                      </p>
                                  </div>
                                  <div>
                                      <p className="text-[#A69C8A] text-xs uppercase mb-1">Entry Price</p>
                                      <p className="font-bold text-white font-mono">{Math.round(pos.avgPrice * 100)}¢</p>
                                  </div>
                                  <div>
                                      <p className="text-[#A69C8A] text-xs uppercase mb-1">Total Cost</p>
                                      <p className="font-bold text-white font-mono">${pos.totalCost.toFixed(2)}</p>
                                  </div>
                                  <div>
                                       <p className="text-[#A69C8A] text-xs uppercase mb-1">Status</p>
                                       <p className="font-bold text-yellow-500 font-mono">Live</p>
                                  </div>
                              </div>
                              <button className="w-full bg-[#1A1511] border border-[#3D2E1E] text-white hover:text-[#E8333A] hover:border-[#E8333A] py-2 rounded-lg text-sm font-bold transition-all">
                                  Close Position
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}

      {activeTab === 'markets' && (
          <div className="fade-in">
              {/* Hero Market (matches the big Forecast Markets feature card) */}
              {heroMarket && (
                  <div className="w-full bg-[#110F0D] border border-[#3D2E1E] rounded-2xl p-6 sm:p-8 mb-10 flex flex-col lg:flex-row gap-8 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00C566] rounded-full blur-[180px] opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"></div>
                      
                      <div className="flex-1 flex flex-col justify-between relative z-10">
                          <div>
                              <div className="flex items-center gap-3 mb-4">
                                  <span className="bg-[#E8333A]/10 text-[#E8333A] text-xs font-bold px-2 py-1 rounded-md border border-[#E8333A]/20 flex items-center gap-1">
                                      🔥 Trending
                                  </span>
                                  <span className="text-[#A69C8A] text-xs flex items-center gap-1 font-mono">
                                      🕒 PolyOracle
                                  </span>
                              </div>
                              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                                  {heroMarket.question}
                              </h2>
                              <p className="text-[#A69C8A] text-sm mb-6 line-clamp-3 max-w-2xl">
                                  {heroMarket.description || "This market revolves around the outcome specified. The resolution source will be an official consensus or major news network."}
                              </p>
                          </div>

                          <div className="flex gap-8 mb-6 mt-4 border-t border-[#3D2E1E] pt-6">
                              <div>
                                  <p className="text-[#A69C8A] text-xs uppercase tracking-wider mb-1">Volume</p>
                                  <p className="text-xl font-bold text-white font-mono">${parseInt(heroMarket.volume || "0").toLocaleString()}</p>
                              </div>
                              <div>
                                  <p className="text-[#A69C8A] text-xs uppercase tracking-wider mb-1">Liquidity</p>
                                  <p className="text-xl font-bold text-white font-mono">$104.2k</p>
                              </div>
                          </div>
                      </div>

                      {/* Hero Right Side - Real Interactive Chart */}
                      <div className="flex-1 min-h-[300px] border border-[#3D2E1E] rounded-xl bg-[#0B0A08] p-4 flex flex-col justify-between relative z-10 shadow-inner">
                          <div className="flex justify-between items-center text-[#A69C8A] text-sm font-mono border-b border-[#3D2E1E] pb-3 mb-2">
                              <span>Implied Probability</span>
                              <div className="flex gap-4">
                                  <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-[#00C566]"></span> YES</span>
                                  <span className="flex items-center gap-1.5 font-bold"><span className="w-2 h-2 rounded-full bg-[#E8333A]"></span> NO</span>
                              </div>
                          </div>
                          {/* Live Recharts Component */}
                          <div className="flex-1 w-full relative">
                               <div className="absolute inset-x-0 bottom-[-15px] top-[-20px] pointer-events-auto">
                                  <MarketChart currentYesPrice={heroYesPrice} yesTokenId={heroMarket?.tokens?.[0]?.token_id} />
                               </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Live Markets List */}
              {feedMarkets && feedMarkets.length > 0 ? (
                  <MarketList initialMarkets={feedMarkets} />
              ) : (
                  <div className="text-center py-20 text-slate-500 font-mono">
                      Scanning Polygon chain for African markets...
                  </div>
              )}
          </div>
      )}

    </div>
  );
}
