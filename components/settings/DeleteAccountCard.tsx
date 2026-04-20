"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ShieldAlert, Trash2 } from "lucide-react";
import { deleteAccountAction, type DeleteAccountActionState } from "@/app/(app)/settings/actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: DeleteAccountActionState = {
  error: null,
};

function DeleteAccountSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button variant="destructive" size="sm" type="submit" loading={pending}>
      <Trash2 className="h-3.5 w-3.5" />
      Deletar conta
    </Button>
  );
}

export function DeleteAccountCard() {
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction] = useActionState(deleteAccountAction, initialState);
  const formKey = useMemo(() => (isConfirming ? "open" : "closed"), [isConfirming]);

  return (
    <Card className="border-coral-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-50">
            <ShieldAlert className="h-4 w-4 text-coral-500" />
          </div>
          <div>
            <CardTitle className="text-coral-700">Zona de perigo</CardTitle>
            <CardDescription>Acoes irreversiveis. Proceda com cautela.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-coral-100 bg-coral-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-coral-800">Deletar conta</p>
              <p className="mt-1 text-xs text-coral-600">
                Remove permanentemente sua conta, perfil, versoes, curriculos e paginas. Esta acao
                nao pode ser desfeita.
              </p>
            </div>
            {!isConfirming ? (
              <Button
                variant="destructive"
                size="sm"
                className="shrink-0"
                type="button"
                onClick={() => setIsConfirming(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Deletar conta
              </Button>
            ) : null}
          </div>
        </div>

        {isConfirming ? (
          <form key={formKey} action={formAction} className="space-y-4 rounded-xl border border-coral-100 p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-neutral-900">Confirme a exclusao</p>
              <p className="text-xs text-neutral-500">
                Digite <span className="font-mono font-semibold text-neutral-800">DELETAR</span> e sua senha atual para remover a conta.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-account-confirmation">Confirmacao</Label>
              <Input
                id="delete-account-confirmation"
                name="confirmation"
                autoComplete="off"
                placeholder="Digite DELETAR"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-account-password">Senha</Label>
              <Input
                id="delete-account-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha atual"
                required
              />
            </div>

            {state.error ? (
              <p className="rounded-lg border border-coral-200 bg-coral-50 px-3 py-2 text-xs text-coral-700">
                {state.error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setIsConfirming(false)}
              >
                Cancelar
              </Button>
              <DeleteAccountSubmitButton />
            </div>
          </form>
        ) : null}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-neutral-400">
          Se tiver duvidas, entre em contato com o suporte antes de prosseguir.
        </p>
      </CardFooter>
    </Card>
  );
}
