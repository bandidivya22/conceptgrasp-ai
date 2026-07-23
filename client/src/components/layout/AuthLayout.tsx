import { ReactNode } from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

function AuthWave() {
  return (
    <div className="wave-container">
      <svg
        className="wave-svg w-full h-full"
        viewBox="0 0 1440 280"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="authWave1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0" />
            <stop offset="40%" stopColor="#2563eb" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="authWave2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fill="url(#authWave1)"
          d="M0,180 C200,120 400,220 600,160 C800,100 1000,200 1200,150 C1350,115 1400,140 1440,130 L1440,280 L0,280 Z"
        />
        <path
          fill="url(#authWave2)"
          d="M0,210 C180,170 360,240 540,200 C720,160 900,230 1080,190 C1260,150 1380,200 1440,180 L1440,280 L0,280 Z"
        />
        <circle cx="900" cy="185" r="4" fill="#3b82f6" opacity="0.8">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="300" cy="160" r="3" fill="#06b6d4" opacity="0.7">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

function GlowOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px] animate-pulse-slow" />
      <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[90px] animate-pulse-slow" />
    </div>
  );
}

function Particles() {
  const dots = [
    { top: '12%', left: '18%', size: 4, delay: '0s', dur: '7s' },
    { top: '22%', left: '78%', size: 3, delay: '1.2s', dur: '9s' },
    { top: '38%', left: '12%', size: 5, delay: '0.6s', dur: '8s' },
    { top: '52%', left: '85%', size: 3, delay: '2s', dur: '10s' },
    { top: '68%', left: '25%', size: 4, delay: '1.5s', dur: '7.5s' },
    { top: '78%', left: '70%', size: 3, delay: '0.3s', dur: '9.5s' },
    { top: '30%', left: '48%', size: 2, delay: '2.4s', dur: '11s' },
    { top: '60%', left: '55%', size: 4, delay: '1.8s', dur: '8.5s' },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-blue-400/60 animate-float"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            animationDelay: d.delay,
            animationDuration: d.dur,
            boxShadow: '0 0 8px rgba(59,130,246,0.7)',
          }}
        />
      ))}
    </div>
  );
}

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function AuthLayout({ title, subtitle, children, maxWidth = 'max-w-[460px]' }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden px-4 py-10">
      <div className="bg-radial-glow" />
      <GlowOrbs />
      <Particles />
      <AuthWave />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`relative z-10 w-full ${maxWidth}`}
      >
        <div className="text-center mb-7">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-4 shadow-lg shadow-blue-500/40 icon-glow-blue">
            <Bot className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold gradient-text tracking-tight">ConceptGrasp AI</h1>
          <p className="text-sm text-slate-400 mt-1.5">{subtitle}</p>
        </div>

        <div className="card card-hover p-7 sm:p-8">{children}</div>

        <p className="mt-5 text-center text-[11px] uppercase tracking-widest text-slate-500/70">
          {title}
        </p>
      </motion.div>
    </div>
  );
}
