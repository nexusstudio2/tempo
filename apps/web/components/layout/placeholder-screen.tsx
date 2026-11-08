import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

type Props = { title: string; prototype: string; embedded?: boolean };

export function PlaceholderScreen({ title, prototype, embedded = false }: Props) {
  const body = (
    <>
      <h1 className="font-display text-[26px] font-semibold tracking-tight">{title}</h1>
      <Card className="mt-4">
        <p className="text-muted">
          Pantalla pendiente. El diseño de referencia es <code>docs/design/prototypes/{prototype}</code>.
        </p>
      </Card>
    </>
  );
  if (embedded) return <div>{body}</div>;
  return (
    <main className="mx-auto max-w-xl p-4">
      <Logo className="mb-6 origin-left scale-75" />
      {body}
    </main>
  );
}
