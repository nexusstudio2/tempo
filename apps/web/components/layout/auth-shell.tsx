import { Logo, LogoMark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/** Marco de las pantallas de acceso: panel de marca en escritorio y contenido centrado. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      <aside aria-hidden="true" className="hidden flex-col justify-between bg-brand p-12 text-white lg:flex">
        <LogoMark className="h-20 w-20" accent="#ffffff" />
        <div>
          <h2 className="max-w-[11em] font-display text-[44px] font-semibold leading-[1.1] tracking-tight">
            Tu negocio, a tiempo y en orden.
          </h2>
          <p className="mt-4 max-w-[28em] opacity-90">
            Membresías, asistencia, clases y pagos en un solo lugar.
          </p>
        </div>
        <small className="opacity-80">Un producto de Koaliado</small>
      </aside>
      <main className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col justify-center px-[22px] py-8">
        <div className="mb-9 flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
