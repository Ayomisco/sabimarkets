"use client";

import { useState, useRef, useEffect } from 'react';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Copy, ExternalLink, Settings, LogOut, ChevronDown,
  CheckCircle, Wallet, TrendingUp
} from 'lucide-react';
import { useRouter } from '@/i18n/routing';

function shortenAddress(addr: string) {
  return addr.slice(0, 6) + '···' + addr.slice(-4);
}

function generateAvatarColors(addr: string) {
  const h1 = parseInt(addr.slice(2, 4), 16) * 1.4;
  const h2 = (h1 + 140) % 360;
  return `linear-gradient(135deg, hsl(${h1},80%,55%) 0%, hsl(${h2},80%,45%) 100%)`;
}

export function WalletMenu() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Use RainbowKit's own ConnectButton.Custom so the modal works correctly
  // on ALL devices including mobile (deep-links to MetaMask, WalletConnect, etc.)
  if (!isConnected || !address) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal, connectModalOpen }) => (
          <button
            onClick={openConnectModal}
            disabled={connectModalOpen}
            className="cursor-pointer flex items-center gap-2 bg-[#00D26A] hover:bg-[#00B85E] text-black font-bold text-[13px] px-4 py-2 rounded-xl transition-all active:scale-[0.97] disabled:opacity-70 shadow-lg shadow-[#00D26A]/20"
          >
            <Wallet size={14} />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </button>
        )}
      </ConnectButton.Custom>
    );
  }

  const gradient = generateAvatarColors(address);
  const short = shortenAddress(address);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] rounded-xl px-3 py-1.5 transition-all"
      >
        <div className="w-6 h-6 rounded-full shrink-0 ring-1 ring-white/10" style={{ background: gradient }} />
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="font-mono text-[12px] text-white font-semibold tracking-tight">{short}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-[3px] h-[10px] rounded-full"
                   style={{ background: gradient, opacity: 0.4 + i * 0.12 }} />
            ))}
          </div>
        </div>
        <ChevronDown size={12} className={`text-[#7A7068] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#0F0D0B] border border-white/[0.09] rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Profile Header */}
          <div className="p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl ring-2 ring-white/10 shrink-0" style={{ background: gradient }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-[14px] truncate">{short}</p>
                <p className="text-[11px] text-[#7A7068] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D26A] animate-pulse inline-block" />
                  Connected · Polygon
                </p>
              </div>
            </div>
            {balance && (
              <div className="flex items-center justify-between bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                <div className="flex items-center gap-2 text-[12px] text-[#7A7068]">
                  <Wallet size={12} /><span>Balance</span>
                </div>
                <span className="font-mono text-sm font-bold text-white">
                  {(Number(balance.value) / 10 ** balance.decimals).toFixed(4)} {balance.symbol}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-2">
            <MenuItem icon={copied ? CheckCircle : Copy} label={copied ? 'Copied!' : 'Copy Address'} onClick={handleCopy} color={copied ? '#00D26A' : undefined} />
            <MenuItem icon={ExternalLink} label="View on Polygon Scan" onClick={() => { if (address) window.open(`https://polygonscan.com/address/${address}`, '_blank'); }} />
            <MenuItem icon={TrendingUp} label="My Portfolio" onClick={() => setIsOpen(false)} />
            <MenuItem icon={Settings} label="Settings" onClick={() => { setIsOpen(false); router.push('/settings'); }} />
          </div>

          {/* Disconnect */}
          <div className="border-t border-white/[0.06] p-2">
            <button
              onClick={() => { disconnect(); setIsOpen(false); }}
              className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#FF4560] hover:bg-[#FF4560]/10 transition-colors text-[13px] font-semibold"
            >
              <LogOut size={14} /> Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, color }: { icon: any; label: string; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#ccc] hover:bg-white/[0.05] hover:text-white transition-colors text-[13px] font-medium"
    >
      <Icon size={14} style={color ? { color } : {}} />
      <span style={color ? { color } : {}}>{label}</span>
    </button>
  );
}
