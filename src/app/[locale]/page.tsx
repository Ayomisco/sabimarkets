import { getTranslations } from 'next-intl/server';
import { fetchAfricanMarkets } from '@/lib/polymarket/api';
import { MarketList } from '@/components/MarketList';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Search, Bell } from 'lucide-react';
import { MarketCard } from '@/components/MarketCard';
import Marquee from '@/components/Marquee';
import MarketChart from '@/components/MarketChart';

export default async function HomePage() {
  const t = await getTranslations('Home');
  const markets = await fetchAfricanMarkets();
  
  const heroMarket = markets.length > 0 ? markets[0] : null;
  const feedMarkets = markets.length > 0 ? markets.slice(1) : [];
  
  // Hero Analytics Math
  const heroYesPriceStr = heroMarket?.outcomePrices && Array.isArray(heroMarket.outcomePrices) 
    ? heroMarket.outcomePrices[0] 
    : "0.5";
  const heroYesPrice = parseFloat(heroYesPriceStr);

  return (
    <main className="flex flex-col min-h-screen bg-[#0B0A08] text-[#E0D5C1] font-sans antialiased selection:bg-[#00C566]/30">
      
      {/* African Cyberpunk Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.15]" style={{
        backgroundImage: `linear-gradient(to right, #3D2E1E 1px, transparent 1px), linear-gradient(to bottom, #3D2E1E 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'linear-gradient(to bottom, black 20%, transparent 80%)'
      }} />

      {/* Header - Forecast Markets Clone Style */}
      <header className="relative z-50 flex items-center justify-between px-6 py-3 w-full border-b border-[#3D2E1E] bg-[#0B0A08]/90 backdrop-blur-md">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tighter text-white font-mono shrink-0">
                <span className="text-[#00C566] text-2xl">⚡Sabi</span>Markets
            </h1>
        </div>

        {/* Search Bar (Centered) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#A69C8A]">
                <Search size={18} />
            </div>
            <input 
                type="text" 
                placeholder="Search markets..." 
                className="w-full bg-[#1A1511] border border-[#3D2E1E] text-white text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#00C566] focus:border-[#00C566] transition-all placeholder:text-[#8B7D6B]"
            />
        </div>

        {/* Right Actions */}
        <div className="flex gap-4 items-center shrink-0">
            <LanguageSwitcher />
            <div className="relative cursor-pointer text-[#A69C8A] hover:text-white transition-colors p-2 bg-[#1A1511] rounded-full hidden sm:block">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E8333A] rounded-full animate-pulse"></span>
            </div>
            <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />
        </div>
      </header>

      {/* Ticker Tape */}
      <div className="w-full border-b border-[#3D2E1E] bg-[#110F0D] py-2 overflow-hidden relative z-40">
        <Marquee markets={markets.slice(0, 10)} />
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-24 relative z-10">
        
        {/* Toggle Markets / Portfolio */}
        <div className="flex bg-[#110F0D] border border-[#3D2E1E] p-1 rounded-full w-max mb-8">
            <button className="px-6 py-1.5 rounded-full bg-[#3D2E1E]/50 text-white font-medium text-sm transition-all shadow-sm">
                Markets
            </button>
            <button className="px-6 py-1.5 rounded-full text-[#A69C8A] hover:text-white font-medium text-sm transition-all">
                Portfolio
            </button>
        </div>

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
                            {heroMarket.description || "This market revolves around the outcome specified. The resolution source will be an official consensus or major news network. Any replacement before the end date will not change the resolution."}
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

                    <div className="flex gap-4">
                        <button className="bg-[#00C566] text-black font-extrabold px-8 py-3 rounded-xl hover:bg-[#00a855] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,197,102,0.3)]">
                            Buy YES 
                        </button>
                        <button className="bg-[#E8333A] text-white font-extrabold px-8 py-3 rounded-xl hover:bg-[#c9252c] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(232,51,58,0.3)]">
                            Buy NO 
                        </button>
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
                            <MarketChart currentYesPrice={heroYesPrice} />
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* Live Markets List directly clones the filter pill + grid structure */}
        {feedMarkets && feedMarkets.length > 0 ? (
            <MarketList initialMarkets={feedMarkets} />
        ) : (
            <div className="text-center py-20 text-slate-500 font-mono">
                Scanning Polygon chain for African markets...
            </div>
        )}
      </div>

    </main>
  );
}
