import Logo from "@/components/Logo";

export default function Loading() {
  return (
    <div className="min-h-[70vh] grid place-items-center">
      <Logo size={72} pulse />
    </div>
//     <div className="relative">
//   <div className="absolute inset-0 rounded-3xl bg-slate-900/20 blur-xl" />
//   <Logo size={72} pulse />
// </div>
  );
}
