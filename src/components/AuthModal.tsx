import React, { useState } from 'react';
import { X, User, Mail, Lock, Shield, Sparkles, CheckCircle2, HeartPulse, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/hospital';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login'
}) => {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    loginAsDemoPatient, 
    loginAsDemoAdmin 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [role, setRole] = useState<Role>('patient');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        await signupWithEmail(name, email, password, role, phone, bloodGroup);
      }
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in with your password or use a different email address.');
      } else if (err?.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a password with at least 6 characters.');
      } else if (err?.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please verify your credentials or use Instant Demo Access.');
      } else if (err?.code === 'auth/too-many-requests') {
        setError('Too many unsuccessful attempts. Please try again in a few minutes or use Instant Demo Access.');
      } else {
        setError(err?.message || 'Authentication failed. Please check your details and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setError('Sign-in window was closed. You can try again or use Instant Demo Access above.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by browser. Please allow popups or use Instant Demo Access.');
      } else {
        setError(err?.message || 'Google sign-in failed. Please try again or use Instant Demo Access.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl backdrop-blur-xs border border-emerald-400/30">
              <HeartPulse className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
              Green Life Patient & Staff Portal
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Patient Account'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {mode === 'login' 
              ? 'Sign in to access your appointments and lab reports.' 
              : 'Register to manage medical appointments and upload health files.'}
          </p>
        </div>

        <div className="p-6">
          
          {/* Fast Evaluation Demo Buttons */}
          <div className="mb-6 p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Instant Evaluator Demo Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  loginAsDemoPatient();
                  onClose();
                }}
                className="bg-white hover:bg-emerald-100/60 text-emerald-900 text-xs font-bold py-2 px-3 rounded-xl border border-emerald-200 transition-all flex items-center justify-center gap-1 shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Demo Patient
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsDemoAdmin();
                  onClose();
                }}
                className="bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Demo Admin
              </button>
            </div>
          </div>

          <div className="relative flex justify-center text-xs uppercase text-slate-400 my-4">
            <span className="bg-white px-2">or continue with credentials</span>
            <div className="absolute inset-0 flex items-center -z-10">
              <div className="w-full border-t border-slate-200"></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="flex-1">{error}</span>
              </div>
              {error.includes('already registered') && mode === 'signup' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="self-start text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 ml-6"
                >
                  Switch to Log In tab →
                </button>
              )}
            </div>
          )}

          {/* Form Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full mb-4 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl border border-slate-200 transition-all text-xs flex items-center justify-center gap-2 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google Account
          </button>

          <form onSubmit={handleSubmit} className="space-y-3">
            
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="+1 555-0192"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border ${
                        role === 'patient' 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border ${
                        role === 'admin' 
                          ? 'bg-amber-50 border-amber-500 text-amber-800' 
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Hospital Staff / Admin
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
