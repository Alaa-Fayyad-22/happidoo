// src/components/Logo.tsx
import Image from "next/image";

type Props = {
  size?: number;
  pulse?: boolean;
};

export default function Logo({ size = 36, pulse = false }: Props) {
  return (
    <div
      style={{ width: size, height: size }}
      className={[
        "relative overflow-hidden rounded-2xl",
        pulse && "animate-pulse",
      ].join(" ")}
    >
      <Image
        src="/logo.png"
        alt="Happidoo logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
}
