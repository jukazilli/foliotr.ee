import { ZodError } from "zod";
import { logServerError } from "@/lib/server/logger";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export class ApiRouteError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(code);
    this.name = "ApiRouteError";
  }
}

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  BAD_REQUEST: "Requisicao invalida.",
  UNAUTHORIZED: "Nao autorizado.",
  FORBIDDEN: "Acesso negado.",
  NOT_FOUND: "Recurso nao encontrado.",
  CONFLICT: "Nao foi possivel concluir a operacao.",
  RATE_LIMITED: "Muitas tentativas. Tente novamente em instantes.",
  VALIDATION_ERROR: "Dados invalidos.",
  INTERNAL_ERROR: "Erro interno do servidor.",
};

export function jsonOk<T>(data: T, init?: ResponseInit): Response {
  return Response.json(data, init);
}

export function jsonError(
  code: ApiErrorCode,
  status: number,
  details?: unknown
): Response {
  return Response.json(
    {
      error: {
        code,
        message: DEFAULT_MESSAGES[code],
        details,
      },
    },
    { status }
  );
}

export function jsonValidationError(error: ZodError): Response {
  return jsonError("VALIDATION_ERROR", 422, {
    fieldErrors: error.flatten().fieldErrors,
    issues: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    })),
  });
}

export function handleRouteError(scope: string, error: unknown): Response {
  if (error instanceof ApiRouteError) {
    return jsonError(error.code, error.status, error.details);
  }

  if (error instanceof ZodError) {
    return jsonValidationError(error);
  }

  logServerError(scope, error);
  return jsonError("INTERNAL_ERROR", 500);
}
