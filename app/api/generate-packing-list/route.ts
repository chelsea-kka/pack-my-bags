import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const MODEL = "gemini-1.5-flash";

const CATEGORY_NAMES = [
  "证件与支付",
  "衣物与装备",
  "电子设备",
  "日常用品",
  "健康与安全",
  "行程准备",
] as const;

type GeneratedCategory = {
  name: string;
  items: string[];
};

function buildPrompt(
  destination: string,
  days: number,
  departureDate: string,
  additionalInfo?: string
): string {
  return `你是一位专业的旅行规划助手。请根据以下行程信息，生成一份详细的行李打包清单。

目的地：${destination}
出发日期：${departureDate}
旅行天数：${days}天
${additionalInfo ? `补充信息：${additionalInfo}` : "补充信息：无"}

请返回严格的 JSON 格式（不要包含 markdown 代码块），结构如下：
{
  "categories": [
    {
      "name": "分类名称",
      "items": ["物品1", "物品2"]
    }
  ]
}

要求：
1. 必须包含以下 6 个分类（按此顺序）：${CATEGORY_NAMES.join("、")}
2. 每个分类至少 2-4 个具体、实用的物品
3. 物品描述要结合目的地、季节、天数和补充信息个性化
4. 使用中文`;
}

function parseResponse(text: string): GeneratedCategory[] {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
  const parsed = JSON.parse(jsonStr) as { categories: GeneratedCategory[] };
  if (!Array.isArray(parsed.categories)) {
    throw new Error("Invalid response format");
  }
  return parsed.categories;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY 未配置" },
      { status: 500 }
    );
  }

  let body: {
    destination?: string;
    days?: number;
    departureDate?: string;
    additionalInfo?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效的请求体" }, { status: 400 });
  }

  const { destination, days, departureDate, additionalInfo } = body;

  if (!destination?.trim() || !departureDate || !days || days < 1) {
    return NextResponse.json(
      { error: "请填写目的地、出发时间和旅行天数" },
      { status: 400 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
    },
  });

  try {
    const result = await model.generateContent(
      buildPrompt(
        destination.trim(),
        days,
        departureDate,
        additionalInfo?.trim()
      )
    );

    const text = result.response.text();
    if (!text) {
      throw new Error("Empty response");
    }

    const categories = parseResponse(text);

    const normalized = CATEGORY_NAMES.map((name) => {
      const found =
        categories.find((c) => c.name === name) ??
        categories.find((c) => c.name.includes(name.slice(0, 2)));
      return {
        name,
        items: found?.items?.length ? found.items : [`${name}相关物品`],
      };
    });

    return NextResponse.json({ categories: normalized });
  } catch (err) {
    console.error("Gemini API error:", err);
    const message =
      err instanceof Error ? err.message : "生成清单失败，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
