import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldAlert, User, Lock, Globe, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as typeof session.user & {
    username?: string;
    email?: string;
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-display text-3xl font-bold text-neutral-900">
          Configurações
        </h1>
        <p className="mt-1 text-neutral-500">
          Gerencie sua conta e preferências.
        </p>
      </div>

      {/* Conta */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
              <User className="h-4 w-4 text-neutral-600" />
            </div>
            <div>
              <CardTitle>Conta</CardTitle>
              <CardDescription>
                Informações de login e credenciais
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Email
            </label>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <span className="text-sm text-neutral-700">
                {user.email ?? "—"}
              </span>
              <Button variant="ghost" size="sm">
                Alterar
              </Button>
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-neutral-400" />
              Senha
            </label>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <span className="text-sm text-neutral-400">••••••••••••</span>
              <Button variant="ghost" size="sm">
                Alterar senha
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Perfil público */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
              <Globe className="h-4 w-4 text-neutral-600" />
            </div>
            <div>
              <CardTitle>Perfil público</CardTitle>
              <CardDescription>
                Controle como você aparece publicamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Username
            </label>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div>
                <span className="text-sm text-neutral-700 font-mono">
                  {user.username ?? "—"}
                </span>
                {user.username && (
                  <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                    foliotr.ee/{user.username}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm">
                Alterar
              </Button>
            </div>
          </div>

          {/* Visibilidade */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Visibilidade do perfil
            </label>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div>
                <span className="text-sm text-neutral-700">Público</span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Qualquer pessoa pode ver seu perfil
                </p>
              </div>
              <Button variant="outline" size="sm">
                Alterar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-coral-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-50">
              <ShieldAlert className="h-4 w-4 text-coral-500" />
            </div>
            <div>
              <CardTitle className="text-coral-700">Zona de perigo</CardTitle>
              <CardDescription>
                Ações irreversíveis. Proceda com cautela.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-coral-100 bg-coral-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-coral-800">
                  Deletar conta
                </p>
                <p className="mt-1 text-xs text-coral-600">
                  Remove permanentemente sua conta, perfil, versões e páginas.
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Deletar conta
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-neutral-400">
            Se tiver dúvidas, entre em contato com o suporte antes de prosseguir.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
