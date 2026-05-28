type FetchLikeError = {
  name?: string;
  message?: string;
  status?: number;
  statusText?: string;
  errorDetails?: unknown;
  stack?: string;
};

export function getGeminiApiKey(): string | null {
  const raw =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!raw) return null;

  const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
  return trimmed.length > 0 ? trimmed : null;
}

export function getGeminiModelCandidates(): string[] {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  const candidates = [
    fromEnv,
    "gemini-1.5-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
  ].filter((m): m is string => Boolean(m));

  return [...new Set(candidates)];
}

export function isModelNotFoundError(err: unknown): boolean {
  const e = err as FetchLikeError;
  if (e.status === 404) return true;
  const msg = String(e.message ?? "").toLowerCase();
  return (
    msg.includes("not found") ||
    msg.includes("is not found") ||
    msg.includes("not supported")
  );
}

export function formatGeminiError(
  err: unknown,
  context?: { model?: string; modelsTried?: string[] }
): { error: string; details: string } {
  const e = (err ?? {}) as FetchLikeError;
  const lines: string[] = [];

  if (e.message) {
    lines.push(e.message);
  } else {
    lines.push(String(err));
  }

  if (e.status !== undefined) {
    lines.push(`HTTP 状态: ${e.status}${e.statusText ? ` ${e.statusText}` : ""}`);
  }

  if (e.errorDetails !== undefined) {
    try {
      lines.push(
        `服务端详情:\n${JSON.stringify(e.errorDetails, null, 2)}`
      );
    } catch {
      lines.push(`服务端详情: ${String(e.errorDetails)}`);
    }
  }

  const key = getGeminiApiKey();
  const detailsObj: Record<string, unknown> = {
    errorName: e.name ?? "Unknown",
    model: context?.model,
    modelsTried: context?.modelsTried,
    apiKeyConfigured: Boolean(key),
    apiKeyLength: key?.length ?? 0,
    envVarsChecked: [
      "GEMINI_API_KEY",
      "GOOGLE_API_KEY",
      "GOOGLE_GENERATIVE_AI_API_KEY",
    ],
    geminiModelEnv: process.env.GEMINI_MODEL?.trim() || null,
    nodeEnv: process.env.NODE_ENV,
  };

  if (process.env.NODE_ENV === "development" && key) {
    detailsObj.apiKeyPreview = `${key.slice(0, 6)}…${key.slice(-4)}`;
  }

  if (e.stack && process.env.NODE_ENV === "development") {
    detailsObj.stack = e.stack;
  }

  const details = JSON.stringify(detailsObj, null, 2);

  return {
    error: lines.join("\n\n"),
    details,
  };
}
