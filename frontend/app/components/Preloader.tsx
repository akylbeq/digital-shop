interface Props {
  message?: string;
}

export default function Preloader ({ message }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/20">{message || 'Загрузка...'}</p>
      </div>
    </div>
  )
}