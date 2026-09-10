import { VacBrand } from "@/components/brand/vac-brand";
import { SurfaceCard } from "@/components/ui/surface-card";
import { LoginForm } from "./login-form";

type LoginScreenProps = {
  notice?: string;
};

export function LoginScreen({ notice }: LoginScreenProps) {
  return (
    <main className="min-h-svh px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-container flex-col sm:min-h-[calc(100svh-4rem)]">
        <header>
          <VacBrand />
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,28rem)] lg:gap-20">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-system text-orange-strong">
              Acceso operativo
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-display text-ink sm:text-5xl">
              VAC Caja
            </h1>
            <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-muted-strong sm:text-lg sm:leading-8">
              Ingresa con tu correo de propietario o con tu usuario de Caja.
            </p>
          </div>

          <SurfaceCard aria-labelledby="login-title">
            <p className="text-xs font-semibold uppercase tracking-system text-muted">
              Terminal web
            </p>
            <h2 id="login-title" className="mt-3 text-2xl font-semibold tracking-tight text-ink">
              Iniciar sesión
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-strong">
              Propietarios pueden entrar con su correo, contraseña o Google.
              Cajeros continúan usando su usuario de Caja.
            </p>

            {notice ? (
              <div
                className="mt-5 rounded-brand border border-vac-orange/30 bg-surface-warm px-4 py-3 text-sm leading-6 text-warning"
                role="status"
              >
                {notice}
              </div>
            ) : null}

            <div className="mt-7">
              <LoginForm />
            </div>
          </SurfaceCard>
        </section>

        <footer className="border-t border-border-subtle py-5 text-xs text-muted">
          Uso de contingencia · VAC
        </footer>
      </div>
    </main>
  );
}
