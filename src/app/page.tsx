'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  ShieldCheck, 
  Store, 
  User as UserIcon, 
  MapPin, 
  Clock, 
  Sparkles, 
  Laptop, 
  Smartphone,
  Lock,
  Mail,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function WelcomePage() {
  const router = useRouter();
  const { user, login, register, loginAsDemo } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [roleType, setRoleType] = useState<'ENTHUSIAST' | 'SHOPKEEPER'>('ENTHUSIAST');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('usman@hafeezcentre.pk');
  const [loginPassword, setLoginPassword] = useState('technologia123');

  // Register form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Lahore');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [businessHours, setBusinessHours] = useState('Mon - Sat: 11:30 AM - 9:30 PM');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const res = await login(loginEmail, loginPassword);
    setIsLoading(false);
    if (res.success) {
      router.push('/home');
    } else {
      setErrorMsg(res.error || 'Failed to sign in. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const isShop = roleType === 'SHOPKEEPER';
    const res = await register({
      name,
      email,
      password,
      city,
      phone,
      role: isShop ? 'SHOPKEEPER' : 'ENTHUSIAST',
      isVerifiedShop: isShop,
      shopName: isShop ? (shopName || `${name}'s Tech Store`) : null,
      shopAddress: isShop ? shopAddress : null,
      businessHours: isShop ? businessHours : null,
    });

    setIsLoading(false);
    if (res.success) {
      router.push('/home');
    } else {
      setErrorMsg(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between relative selection:bg-blue-100 selection:text-blue-900">
      {/* Top subtle brand accent line */}
      <div className="h-[3px] w-full bg-amber-800 fixed top-0 left-0 z-10" />

      {/* Header element for screen balance */}
      <div className="pt-8 px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            T
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
              Technologia
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Hardware Marketplace & Sourcing Hub
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push('/home')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
        >
          <span>Skip to Marketplace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg mx-auto px-6 py-8">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-1 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span>Authentication & User Profiles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome to Technologia
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Direct off-platform trust-based tech buying and selling across Pakistan with verified shopkeeper profiles and transparent reputation.
          </p>
        </div>

        {/* 1-Click Fast Demo Accounts Bar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" /> Instant Demo Access:
            </span>
            <span className="text-[10px] text-slate-400">1-click switch</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => loginAsDemo('shopkeeper')}
              className="p-2.5 rounded-xl bg-white border border-blue-200/80 hover:border-blue-600 text-left transition-all hover:shadow-xs group"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-blue-600">
                <ShieldCheck className="w-4 h-4 text-amber-800" />
                <span>Usman ThinkPads</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Verified Shop &bull; Hafeez Centre
              </p>
            </button>

            <button
              onClick={() => loginAsDemo('enthusiast')}
              className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-blue-600 text-left transition-all hover:shadow-xs group"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-blue-600">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span>Ali Raza</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Standard Enthusiast &bull; Lahore
              </p>
            </button>
          </div>
        </div>

        {/* Auth Box with Tabs */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* Tab buttons */}
          <div className="flex rounded-xl bg-gray-100/80 p-1 mb-6 border border-gray-200/60">
            <button
              onClick={() => { setMode('LOGIN'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'LOGIN'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('REGISTER'); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'REGISTER'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="usman@hafeezcentre.pk"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Local MVP password
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-xs hover:shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center gap-2 btn-tactile"
                >
                  <span>{isLoading ? 'Signing In...' : 'Enter Technologia'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM WITH TIERED ROLES */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Type Selection: Enthusiast vs Verified Shopkeeper */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoleType('ENTHUSIAST')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      roleType === 'ENTHUSIAST'
                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 text-blue-950'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                      <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Standard Enthusiast</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Private buyer & seller
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoleType('SHOPKEEPER')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      roleType === 'SHOPKEEPER'
                        ? 'border-amber-800 bg-amber-50/50 ring-1 ring-amber-800 text-amber-950'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                      <span>Verified Shopkeeper</span>
                    </div>
                    <p className="text-[10px] text-amber-800 font-medium">
                      Badge, address & hours
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Usman Ghani"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@technologia.pk"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City (Pakistan)
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Lahore">Lahore (Hafeez Centre / Hall Road)</option>
                    <option value="Karachi">Karachi (Saddar / Star City Mall)</option>
                    <option value="Islamabad">Islamabad (Blue Area)</option>
                    <option value="Rawalpindi">Rawalpindi (Dubai Plaza)</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Multan">Multan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              {/* Shopkeeper specific fields */}
              {roleType === 'SHOPKEEPER' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Store className="w-3.5 h-3.5 text-amber-800" />
                    <span>Physical Shop Verification Details</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                      Business / Shop Name
                    </label>
                    <input
                      type="text"
                      required={roleType === 'SHOPKEEPER'}
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Usman ThinkPads & Spares Hub"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                      Physical Shop Address
                    </label>
                    <input
                      type="text"
                      required={roleType === 'SHOPKEEPER'}
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      placeholder="e.g. Shop #42, 2nd Floor, Hafeez Centre, Main Boulevard Gulberg III, Lahore"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                      Business Hours
                    </label>
                    <input
                      type="text"
                      value={businessHours}
                      onChange={(e) => setBusinessHours(e.target.value)}
                      placeholder="Mon - Sat: 11:30 AM - 9:30 PM"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-amber-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-xs hover:shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center gap-2 btn-tactile"
                >
                  <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Guest Route */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={() => router.push('/home')}
              className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              Continue as Guest (Browse Only) &rarr;
            </button>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100/80">
            <Smartphone className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <span className="text-[11px] font-semibold text-slate-700 block">Phones</span>
            <span className="text-[10px] text-slate-400">Strict Variants</span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50/70 border border-gray-100/80">
            <Laptop className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <span className="text-[11px] font-semibold text-slate-700 block">Laptops</span>
            <span className="text-[10px] text-slate-400">Upgrade Specs</span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/50">
            <ShieldCheck className="w-4 h-4 text-amber-800 mx-auto mb-1" />
            <span className="text-[11px] font-semibold text-amber-900 block">Verified Shops</span>
            <span className="text-[10px] text-amber-700">Trust Scores</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-8 px-6 text-center text-xs text-slate-400 space-y-1">
        <p>Hafeez Centre &bull; Saddar Karachi &bull; Blue Area Islamabad &bull; Dubai Plaza Rawalpindi</p>
        <p className="text-[11px] text-slate-400">&copy; {new Date().getFullYear()} Technologia. Fast, local, uncluttered MVP.</p>
      </div>
    </div>
  );
}
