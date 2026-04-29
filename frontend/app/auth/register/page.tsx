'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useUserStore } from '@/app/store/user/user.store';
import { UserRegister } from '@/app/store/user/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function Register() {
  const {register, user} = useUserStore();
  const [formData, setFormData] = useState<UserRegister>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (formData.password === formData.confirmPassword) {
      register(formData);
    } else {
      toast.error('Passwords do not match');
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user])

  return (
    <div className="site-shell">

      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 py-20">
        <div className="w-full max-w-md premium-card p-6 sm:p-8">

          <div className="text-center mb-12 sm:mb-16">
            <span
              className="text-[8px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.8em] text-gray-600 block mb-3 sm:mb-4">
              Join Us
            </span>
            <h1
              className="text-5xl sm:text-7xl md:text-8xl font-black leading-none tracking-tighter uppercase italic opacity-90">
              Register
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

            <div className="space-y-3">
              <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-gray-500">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base focus:border-white/30 focus:outline-none transition-colors placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-gray-500">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base focus:border-white/30 focus:outline-none transition-colors placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-gray-500">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base focus:border-white/30 focus:outline-none transition-colors placeholder:text-gray-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black py-3 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-gray-200 active:bg-gray-300 transition-colors"
            >
              Create Account
            </button>

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

            <div className="text-center">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-600">
                Already have an account?{' '}
              </span>
              <a href="/login"
                 className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white hover:opacity-70 transition-opacity">
                Login
              </a>
            </div>
          </form>

        </div>

        <div className="mt-16 sm:mt-20 flex flex-col items-center gap-3 sm:gap-4 opacity-30">
          <div className="w-[1px] h-8 sm:h-12 bg-white/10"></div>
          <span
            className="text-[8px] sm:text-[9px] uppercase tracking-[0.4em] sm:tracking-[0.5em] text-gray-700">.02</span>
        </div>
      </section>

    </div>
  );
}