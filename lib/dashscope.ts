import OpenAI from "openai";

/** 唯一使用的 API Key 环境变量名 */
export const DASHSCOPE_API_KEY_ENV = "DASHSCOPE_API_KEY";

export const DASHSCOPE_BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1";

export const QWEN_MODEL = "qwen-turbo";

export function getDashscopeApiKey(): string | null {
  const raw = process.env[DASHSCOPE_API_KEY_ENV];
  if (!raw) return null;

  const trimmed = raw.trim().replace(/^['"]|['"]$/g, "");
  return trimmed.length > 0 ? trimmed : null;
}

export function dashscopeKeyMissingError(): string {
  return `${DASHSCOPE_API_KEY_ENV} 未配置。请在项目根目录 .env.local 中设置 ${DASHSCOPE_API_KEY_ENV}（阿里云百炼 / DashScope API Key），保存后重启 npm run dev。`;
}

export function dashscopeKeyMissingDetails(): string {
  return JSON.stringify(
    {
      envVarsChecked: [DASHSCOPE_API_KEY_ENV],
      hint: "设置后需重启 npm run dev",
    },
    null,
    2
  );
}

export function createQwenClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: DASHSCOPE_BASE_URL,
  });
}

export function formatDashscopeError(err: unknown): {
  error: string;
  details: string;
} {
  const lines: string[] = [];
  const detailsObj: Record<string, unknown> = {
    model: QWEN_MODEL,
    baseURL: DASHSCOPE_BASE_URL,
    apiKeyConfigured: Boolean(getDashscopeApiKey()),
    apiKeyLength: getDashscopeApiKey()?.length ?? 0,
    envVarsChecked: [DASHSCOPE_API_KEY_ENV],
    nodeEnv: process.env.NODE_ENV,
  };

  if (err instanceof OpenAI.APIError) {
    lines.push(err.message);
    if (err.status) {
      lines.push(`HTTP 状态: ${err.status}`);
    }
    if (err.error) {
      try {
        lines.push(`服务端详情:\n${JSON.stringify(err.error, null, 2)}`);
      } catch {
        lines.push(`服务端详情: ${String(err.error)}`);
      }
    }
    detailsObj.errorName = "APIError";
    detailsObj.status = err.status;
    detailsObj.code = err.code;
    detailsObj.type = err.type;
  } else if (err instanceof Error) {
    lines.push(err.message);
    detailsObj.errorName = err.name;
    if (process.env.NODE_ENV === "development") {
      detailsObj.stack = err.stack;
    }
  } else {
    lines.push(String(err));
  }

  const key = getDashscopeApiKey();
  if (process.env.NODE_ENV === "development" && key) {
    detailsObj.apiKeyPreview = `${key.slice(0, 6)}…${key.slice(-4)}`;
  }

  return {
    error: lines.join("\n\n"),
    details: JSON.stringify(detailsObj, null, 2),
  };
}
