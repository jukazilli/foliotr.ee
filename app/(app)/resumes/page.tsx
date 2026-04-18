import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Plus, FileText, Download, Eye, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock de currículos — em produção, buscar do banco
const mockResumes: {
  id: string;
  versionName: string;
  versionEmoji: string;
  template: string;
  language: string;
  lastGenerated: string | null;
}[] = [];

export default async function ResumesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const hasResumes = mockResumes.length > 0;

  return (
    <div className="max-w-3xl space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">
            Currículos
          </h1>
          <p className="mt-2 text-neutral-500 max-w-md">
            Modo leitura. Mesmo conteúdo, apresentação recruiter-friendly.
          </p>
        </div>
        <Button variant="primary">
          <Plus className="h-4 w-4" />
          Configurar currículo
        </Button>
      </div>

      {/* Explicação do modo currículo */}
      <Card className="border-cyan-100 bg-cyan-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-cyan-900">
                Como funciona o modo currículo?
              </p>
              <p className="mt-1 text-sm text-cyan-800 leading-relaxed">
                O currículo é gerado automaticamente a partir de uma versão do
                seu perfil. Você configura o template, idioma e quais seções
                incluir — e nós geramos um PDF pronto para enviar a recrutadores.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasResumes ? (
        <div className="space-y-4">
          {mockResumes.map((resume) => (
            <Card key={resume.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-xl">
                      {resume.versionEmoji}
                    </div>
                    <div>
                      <CardTitle>{resume.versionName}</CardTitle>
                      <CardDescription>
                        Template: {resume.template} · {resume.language}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="info">
                    {resume.lastGenerated
                      ? `Gerado ${resume.lastGenerated}`
                      : "Não gerado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                  <Button variant="default" size="sm">
                    <Download className="h-3.5 w-3.5" />
                    Baixar PDF
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3.5 w-3.5" />
                    Visualizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 mb-4">
                <FileText className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="font-semibold text-neutral-900">
                Nenhum currículo configurado
              </h3>
              <p className="mt-2 text-sm text-neutral-500 max-w-xs">
                Configure seu primeiro currículo baseado em uma versão do seu
                perfil e gere um PDF em segundos.
              </p>
              <Button variant="primary" className="mt-6">
                <Plus className="h-4 w-4" />
                Configurar currículo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Geração automática",
            desc: "PDF gerado em segundos a partir do seu perfil, sem copy-paste.",
            icon: FileText,
          },
          {
            title: "Múltiplos templates",
            desc: "Layouts limpos e aprovados por recrutadores de grandes empresas.",
            icon: Eye,
          },
          {
            title: "Multilíngue",
            desc: "Gere versões em português, inglês ou espanhol.",
            icon: Info,
          },
          {
            title: "Sempre atualizado",
            desc: "Atualize seu perfil uma vez e regenere todos os currículos.",
            icon: Download,
          },
        ].map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="flex items-start gap-3 rounded-xl p-4 bg-white border border-[rgba(15,17,21,0.08)]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                <Icon className="h-4 w-4 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">
                  {feature.title}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">{feature.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
