import React, { useState } from 'react';
import { 
  Plus, 
  HeartPulse, 
  User, 
  Calendar, 
  FileText, 
  Shield, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Building2,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenBooking: (deptId?: string, docId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenBooking
}) => {
  const { user, isAdmin, isDemoAccount, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            onClick={() => handleNav('home')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Plus className="w-7 h-7 stroke-[2.5]" />
              <HeartPulse className="w-3.5 h-3.5 absolute bottom-1 right-1 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  Green<span className="text-emerald-600">Life</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Hospital
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Center of Medical Excellence
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => handleNav('home')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('departments')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'departments'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              Departments
            </button>
            <button
              onClick={() => handleNav('doctors')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'doctors'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              Doctors
            </button>

            {user && (
              <button
                onClick={() => handleNav('dashboard')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                My Portal
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => handleNav('admin')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Action Buttons & Auth */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onOpenBooking()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold capitalize flex items-center gap-1">
                      {user.role} {isDemoAccount && '(Demo)'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                {/* Dropdown menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="p-3 border-b border-slate-100 mb-1">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                        {user.role} Account
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        handleNav('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 font-medium"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      My Health Dashboard
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          handleNav('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-amber-800 hover:bg-amber-50 rounded-xl flex items-center gap-2 font-medium"
                      >
                        <Shield className="w-4 h-4 text-amber-600" />
                        Admin Control Panel
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4 text-emerald-400" />
                Sign In / Register
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            {!user && (
              <button
                onClick={onOpenAuth}
                className="bg-slate-900 text-white p-2 rounded-xl text-xs font-semibold"
              >
                Login
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <button
            onClick={() => handleNav('home')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold ${
              activeTab === 'home' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNav('departments')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${
              activeTab === 'departments' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            Departments
          </button>
          <button
            onClick={() => handleNav('doctors')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${
              activeTab === 'doctors' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            Doctors Directory
          </button>

          {user && (
            <button
              onClick={() => handleNav('dashboard')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${
                activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              Patient Dashboard & Reports
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 bg-amber-50 text-amber-800`}
            >
              <Shield className="w-4 h-4 text-amber-600" />
              Admin Portal
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-sm text-center flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment Now
            </button>

            {user ? (
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="w-full bg-slate-100 text-rose-600 font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user.name})
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-center"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
