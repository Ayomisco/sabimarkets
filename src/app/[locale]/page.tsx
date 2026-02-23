import { getTranslations } from 'next-intl/server';
import { fetchAfricanMarkets } from '@/lib/polymarket/api';
import { MarketList } from '@/components/MarketList';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Search, Bell } from 'lucide-react';
import { MarketCard } from '@/components/MarketCard';
import Marquee from '@/components/Marquee';
import { FeedAndPortfolio } from '@/components/FeedAndPortfolio';

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

      <FeedAndPortfolio 
        heroMarket={heroMarket} 
        feedMarkets={feedMarkets} 
        heroYesPrice={heroYesPrice} 
      />

    </main>
  );
}
