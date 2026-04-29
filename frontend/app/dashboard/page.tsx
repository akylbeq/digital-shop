'use client';
import React, { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <div className="py-10">
      <div className="premium-card p-8">
        <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-[0.2em]">
          Admin Control Center
        </h1>
        <p className="text-white/60 mt-3">
          Выберите раздел в верхнем меню: заказы, товары, категории или ключи.
        </p>
      </div>
    </div>
  );
}