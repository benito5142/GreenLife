import React from 'react';
import { PhoneCall, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

interface EmergencyBannerProps {
  onOpenBooking: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onOpenBooking }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white text-xs sm:text-sm py-2 px-4 shadow-inner border-b border-emerald-800/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>24/7 Emergency Care Active</span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-300">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Emergency Hotline:</span>
            <a href="tel:18004733654" className="font-bold text-white hover:text-emerald-300 transition-colors">
              +1 (800) 473-3654
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>OPD Hours: Mon - Sat 08:00 AM - 08:00 PM</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBooking}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded-md text-xs transition-all shadow-sm hover:shadow-emerald-500/20 active:scale-95 flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Express Booking
          </button>
        </div>
      </div>
    </div>
  );
};
