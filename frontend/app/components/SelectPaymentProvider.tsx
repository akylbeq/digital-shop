import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import sbpImage from '../../public/sbp-logo.png';
import cardImage from '../../public/img_1.png';
import { toast } from 'sonner';
import { useCheckoutStore } from '@/app/store/checkout/checkout.store';
import { useRouter } from 'next/navigation';
import { Circle } from 'lucide-react';
import { useUserStore } from '@/app/store/user/user.store';

type PaymentMethod = 'sbp' | 'card' | 'admin' | null;
const paymentMethods: { id: Exclude<PaymentMethod, null>; title: string; desc: string }[] = [
  { id: 'sbp', title: 'СБП', desc: 'Система быстрых платежей', img: sbpImage },
  { id: 'admin', title: 'Через администратора', desc: 'Прямой платеж', img: cardImage },
];

interface Props {
  id: number;
  selectedPrice: {duration: string, price: number};
  isActive: boolean;
  product: string;
}

export default function SelectPaymentProvider({
                                                selectedPrice,
                                                isActive,
  product,
  id
                                              }: Props) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>(null);
  const {modal, changeModalStatus, order, loading, createOrder} = useCheckoutStore();
  const user = useUserStore().user
  const commission = selectedPrice.price * 0.09;
  const total = selectedPrice.price + commission;

  useEffect(() => {
    if (modal && !user) {
      router.push('/auth/register');
      changeModalStatus();
    }
  }, [modal, user, router, changeModalStatus]);

  const onPay = async () => {
    if (!method) {
      return toast.error('Выберите платежную систему!')
    }
    if (method === 'admin') {
      window.open('https://t.me/xploi')
      return
    }
    await createOrder({
      productId: id,
      duration: selectedPrice.duration,
      payment_method: method,
    });
  };

  useEffect(() => {
    if (order) {
      router.push('/invoice/' + order.orderId)
    }
  }, [order, router])

  return (
    <Dialog open={modal} onOpenChange={changeModalStatus}>
      <DialogTrigger className="w-full" asChild>
        <Button
          disabled={!selectedPrice || !isActive}
          className="w-full py-3.5 rounded-xl text-sm font-bold"
          style={{
            background: 'white',
            color: '#050505'
          }}
        >
          {selectedPrice ? `Купить за · ${formatPrice(selectedPrice.price)}` : 'Выберите период'}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm bg-[#0b0b0b] border border-white/10 text-white rounded-2xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-white text-lg font-semibold">
            Выберите способ оплаты
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-4">
          {paymentMethods.map((item) => (
            <button
              key={item.id}
              onClick={() => setMethod(item.id)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left outline-none',
                method === item.id
                  ? 'border-blue-500/50 bg-white/5'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Image width={20} height={20} src={item.img} alt={item.id} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-white/40">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white/[0.03] rounded-xl p-4 mt-4 space-y-2 border border-white/5">
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Товар:</span>
            <span className="text-white font-medium">{product}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Подписка:</span>
            <span className="text-white">{selectedPrice.duration}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Комиссия (9%)</span>
            <span className="text-white">{commission.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Цена:</span>
            <span className="text-white">{selectedPrice.price}</span>
          </div>
          <div className="h-px bg-white/5 my-2" />
          <div className="flex justify-between items-center text-lg font-bold text-white">
            <span>Итого:</span>
            <span>{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Button
            disabled={!method || loading}
            className="w-full bg-white text-black hover:bg-white/90 font-semibold h-11 rounded-xl transition-all"
            onClick={onPay}
          >
            Перейти к оплате {loading ? <Circle className="animate-spin text-black font-bold" /> : null}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-white/40 hover:text-white hover:bg-white/5 h-11 rounded-xl"
            onClick={changeModalStatus}
          >
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}