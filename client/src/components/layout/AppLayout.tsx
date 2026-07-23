import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function WaveBackground() {
  return (
    <div className="wave-container light-wave">
      <svg
        className="wave-svg w-full h-full"
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGradLight1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#bfdbfe" stopOpacity="0.6" />
            <stop offset="40%"  stopColor="#93c5fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="waveGradLight2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#dbeafe" stopOpacity="0.5" />
            <stop offset="60%"  stopColor="#bfdbfe" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#cffafe" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#1d4ed8" stopOpacity="0" />
            <stop offset="40%"  stopColor="#2563eb" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#1e40af" stopOpacity="0.3" />
            <stop offset="60%"  stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Light mode paths */}
        <path className="dark:hidden" fill="url(#waveGradLight1)" d="M0,180 C200,120 400,220 600,160 C800,100 1000,200 1200,150 C1350,115 1400,140 1440,130 L1440,280 L0,280 Z" />
        <path className="dark:hidden" fill="url(#waveGradLight2)" d="M0,210 C180,170 360,240 540,200 C720,160 900,230 1080,190 C1260,150 1380,200 1440,180 L1440,280 L0,280 Z" />
        <circle className="dark:hidden" cx="900" cy="185" r="4" fill="#3b82f6" opacity="0.5">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle className="dark:hidden" cx="300" cy="160" r="3" fill="#06b6d4" opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite" />
        </circle>
        {/* Dark mode paths */}
        <path className="hidden dark:block" fill="url(#waveGrad1)" d="M0,180 C200,120 400,220 600,160 C800,100 1000,200 1200,150 C1350,115 1400,140 1440,130 L1440,280 L0,280 Z" />
        <path className="hidden dark:block" fill="url(#waveGrad2)" d="M0,210 C180,170 360,240 540,200 C720,160 900,230 1080,190 C1260,150 1380,200 1440,180 L1440,280 L0,280 Z" />
        <circle className="hidden dark:block" cx="900" cy="185" r="4" fill="#3b82f6" opacity="0.8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle className="hidden dark:block" cx="300" cy="160" r="3" fill="#06b6d4" opacity="0.7">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

function GlowOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 hidden dark:block">
      <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse-slow" />
      <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-blue-500/8 blur-[90px] animate-pulse-slow" />
    </div>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#050B18] relative overflow-x-hidden">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="bg-radial-glow hidden dark:block" />
        <GlowOrbs />
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">
          <Outlet />
        </main>
        <WaveBackground />
      </div>
    </div>
  );
}
