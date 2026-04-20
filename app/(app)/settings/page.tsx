import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { User, Lock, Globe } from "lucide-react";
import { DeleteAccountCard } from "@/components/settings/DeleteAccountCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
      <div>
        <h1 className="font-display text-3xl font-bold text-neutral-900">Configuracoes</h1>
        <p className="mt-1 text-neutral-500">Gerencie sua conta e preferencias.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
              <User className="h-4 w-4 text-neutral-600" />
            </div>
            <div>
              <CardTitle>Conta</CardTitle>
              <CardDescription>Informacoes de login e credenciais</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Email</label>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <span className="text-sm text-neutral-700">{user.email ?? "-"}</span>
              <Button variant="ghost" size="sm">
                Alterar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
              <Globe className="h-4 w-4 text-neutral-600" />
            </div>
            <div>
              <CardTitle>Perfil publico</CardTitle>
              <CardDescription>Controle como voce aparece publicamente</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Username</label>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div>
                <span className="font-mono text-sm text-neutral-700">{user.username ?? "-"}</span>
                {user.username ? (
                  <p className="mt-0.5 font-mono text-xs text-neutral-400">
                    foliotr.ee/{user.username}
                  </p>
                ) : null}
              </div>
              <Button variant="ghost" size="sm">
                Alterar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">
              Visibilidade do perfil
            </label>
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div>
                <span className="text-sm text-neutral-700">Publico</span>
                <p className="mt-0.5 text-xs text-neutral-400">
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

      <DeleteAccountCard />
    </div>
  );
}
