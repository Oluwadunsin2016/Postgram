import { Aperture, Sparkles } from "lucide-react";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

const BrandLogo = ({ compact = false, className = "" }: BrandLogoProps) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-500 text-white shadow-[0_16px_40px_rgba(135,126,255,0.28)]">
        <Aperture size={25} strokeWidth={2.5} />
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-dark-1 bg-white text-primary-500">
          <Sparkles size={11} fill="currentColor" />
        </span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[1.55rem] font-black tracking-tight text-white">Postgram</span>
          <span className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-primary-500">Social</span>
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
