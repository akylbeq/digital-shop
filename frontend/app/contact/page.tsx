'use client';
import React, { ChangeEvent, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

type Messages = {
  author: string;
  telegram: string;
  message: string;
};

type Captcha = {
  num1: number;
  num2: number;
};

export default function ContactPage() {
  const generateCaptcha = (): Captcha => ({
    num1: Math.floor(Math.random() * 20),
    num2: Math.floor(Math.random() * 20),
  });

  const [messages, setMessages] = useState<Messages>({
    author: '',
    telegram: '',
    message: '',
  });

  const [captcha, setCaptcha] = useState<Captcha>(generateCaptcha());
  const [captchaValue, setCaptchaValue] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaValue('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMessages((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messages.author || !messages.telegram || !messages.message) {
      return toast.error('Заполните все поля!')
    }

    if (Number(captchaValue) !== captcha.num1 + captcha.num2) {
      setStatus('Неверный ответ на капчу');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const res = await fetch('/api/send-to-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages({ author: '', telegram: '', message: '' });
        setStatus('Сообщение отправлено');
        refreshCaptcha();
      } else {
        setStatus(data.message || 'Ошибка отправки');
        refreshCaptcha();
      }
    } catch {
      setStatus('Ошибка сети');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-main selection:bg-white selection:text-black">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        <div className="mb-20 space-y-4 text-center md:text-left">
          <h1 className="font-title text-4xl md:text-6xl tracking-[0.2em] uppercase leading-tight">
            Contact <span className="text-white/40">Us</span>
          </h1>
          <p className="text-white/40 max-w-lg text-sm md:text-base tracking-widest uppercase">
            Техническая поддержка и сотрудничество 24/7
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          <div className="lg:col-span-2">
            <div className="p-8 md:p-12 border border-white/5 bg-white/[0.01] backdrop-blur-sm rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck size={120} />
              </div>

              <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">
                      Ваше Имя
                    </label>
                    <input
                      type="text"
                      placeholder="Введите имя"
                      name="author"
                      value={messages.author}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">
                      Telegram username
                    </label>
                    <input
                      type="text"
                      name="telegram"
                      placeholder="@robin"
                      value={messages.telegram}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">
                    Сообщение
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Как я вам могу помочь?"
                    name="message"
                    value={messages.message}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-colors text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">
                    Проверка
                  </label>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <span className="text-sm text-white/70 min-w-[90px]">
                      {captcha.num1} + {captcha.num2} = ?
                    </span>

                    <input
                      type="text"
                      value={captchaValue}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCaptchaValue(e.target.value)
                      }
                      placeholder="Ответ"
                      className="w-full md:w-[220px] bg-white/5 border border-white/10 p-4 outline-none focus:border-white/40 transition-colors text-sm"
                    />

                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="px-4 py-2 border border-white/10 text-[10px] uppercase tracking-[0.2em] text-white/70 hover:bg-white hover:text-black transition-colors"
                    >
                      Новый пример
                    </button>
                  </div>
                </div>

                {status && (
                  <p className="text-sm text-white/70">
                    {status}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-12 py-4 bg-white text-black font-title text-[10px] tracking-[0.3em] uppercase hover:bg-[#e0e0e0] transition-all active:scale-95 disabled:opacity-60"
                >
                  {loading ? 'Отправка...' : 'Отправить'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-12">
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase tracking-widest text-white/20 mb-2">Availability</p>
              <p className="text-xs tracking-widest font-mono">24/7 ONLINE</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase tracking-widest text-white/20 mb-2">Location</p>
              <p className="text-xs tracking-widest font-mono">GLOBAL / DIGITAL</p>
            </div>
          </div>
          <p className="text-[10px] text-white/10 uppercase tracking-widest italic">
            Secure encrypted connection established.
          </p>
        </div>
      </div>
    </div>
  );
}