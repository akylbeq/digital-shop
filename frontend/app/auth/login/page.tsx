'use client';

import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/app/store/user/user.store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const {
    login,
    user
  } = useUserStore();
  const [userLogin, setUserLogin] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userLogin.password.length < 6) {
      return toast.error('Password must be at least 6 characters long');
    }
    login(userLogin);
  };

  useEffect(() => {
    if (user) {
      return router.push('/');
    }
  }, [user, router]);

  return (
    <div className="site-shell">

      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md premium-card p-6 sm:p-8">

          <div className="text-center mb-12 sm:mb-16">
            <span
              className="text-[8px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.8em] text-gray-600 block mb-3 sm:mb-4">
              Welcome Back
            </span>
            <h1
              className="text-5xl sm:text-7xl md:text-8xl font-black leading-none tracking-tighter uppercase italic opacity-90">
              Login
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

            {/* Email Field */}
            <div className="space-y-3">
              <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-gray-500">
                Email Address
              </label>
              <input
                type="email"
                value={userLogin.email}
                onChange={(e) => setUserLogin(prevState => ({
                  ...prevState,
                  email: e.target.value
                }))}
                placeholder="your@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base focus:border-white/30 focus:outline-none transition-colors placeholder:text-gray-500"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-gray-500">
                Password
              </label>
              <input
                type="password"
                value={userLogin.password}
                onChange={(e) => setUserLogin(prevState => ({
                  ...prevState,
                  password: e.target.value
                }))}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base focus:border-white/30 focus:outline-none transition-colors placeholder:text-gray-500"
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <a href="#"
                 className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-600 hover:text-white transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-white text-black py-3 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#0a0a0a] px-4 text-[9px] uppercase tracking-widest text-gray-700">
                  Or
                </span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-600">
                Don't have an account?{' '}
              </span>
              <Link href="/register"
                 className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white hover:opacity-70 transition-opacity">
                Register
              </Link>
            </div>
          </form>

        </div>

        {/* Decorative Element */}
        <div className="mt-16 sm:mt-20 flex flex-col items-center gap-3 sm:gap-4 opacity-30">
          <div className="w-[1px] h-8 sm:h-12 bg-white/10"></div>
          <span
            className="text-[8px] sm:text-[9px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-gray-700">.01</span>
        </div>
      </section>

    </div>
  );
}