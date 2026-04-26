import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthenticatedVocationPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="brand-eyebrow">Rota autenticada</p>
        <h1 className="brand-title mt-4 text-6xl">Teste vocacional</h1>
        <p className="brand-copy mt-5 max-w-2xl text-lg">
          Este espaço já está protegido pelo shell real. A próxima etapa será modelar
          perguntas, cálculo de resultado e persistência.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* TODO React/TypeScript + backend:
            - Criar modelo de perguntas e alternativas.
            - Persistir sessões de teste por usuário autenticado.
            - Calcular resultado, forças, fraquezas, comportamento e recomendações.
            - Salvar histórico para comparação com versões futuras do Linkfolio.
          */}
          <p className="text-sm font-bold text-muted">
            Placeholder funcional para validar o redirecionamento autenticado.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard">Voltar ao painel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
