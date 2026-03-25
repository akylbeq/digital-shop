'use client';
import { useEffect } from 'react';
import { useUserStore } from '@/app/store/user/user.store';
import { Toaster } from '@/components/ui/sonner';
import Preloader from '@/app/components/Preloader';

export default function Providers({children}: { children: React.ReactNode }) {
  const {getMe, userLoading} = useUserStore();

  useEffect(() => {
    getMe();
  }, [getMe]);

  if (userLoading) {
    return <Preloader />;
  }

  return (
    <div className="bg-[#050505]">
      {children}
      <Toaster richColors/>
    </div>
  );
}