import { NextRequest, NextResponse } from "next/server";
import {
  createQwenClient,
  dashscopeKeyMissingDetails,
  dashscopeKeyMissingError,
  formatDashscopeError,
  getDashscopeApiKey,
  QWEN_MODEL,
} from "@/lib/dashscope";

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

type GeneratedDestinationInfo = {
  season?: string;
  climate?: string;
  tips?: string;
};

function getSeasonHint(departureDate: string): string {
  const month = new Date(departureDate + "T00:00:00").getMonth() + 1;
  if (month >= 3 && month <= 5) return "春季";
  if (month >= 6 && month <= 8) return "夏季";
  if (month >= 9 && month <= 11) return "秋季";
  return "冬季";
}

function buildPrompt(
  destination: string,
  days: number,
  departureDate: string,
  additionalInfo?: string
): string {
  const season = getSeasonHint(departureDate);
  const hasExtra = Boolean(additionalInfo?.trim());

  return `你是一位资深旅行规划师，熟悉全球各目的地的气候、文化、签证政策与当地生活细节。请根据以下行程，生成一份高度个性化、可直接照着打包的行李清单。

## 行程信息
- 目的地：${destination}
- 出发日期：${departureDate}（约属${season}，请结合当地该季节真实气候）
- 旅行天数：${days} 天
- 补充信息：${hasExtra ? additionalInfo!.trim() : "无"}

## 输出格式
仅返回 JSON，不要 markdown 代码块，结构如下：
{
  "destination_info": {
    "season": "当前季节（如：初夏 / 干季 / 深冬）",
    "climate": "一句话描述当地该时段的气候特点（如：日均 28℃，湿热多阵雨，紫外线强）",
    "tips": "2～3 句出行注意事项，涵盖气候应对、文化礼仪或安全提示"
  },
  "categories": [
    { "name": "分类名称", "items": ["物品1", "物品2"] }
  ]
}

## 分类（必须且仅包含以下 6 个，按此顺序）
${CATEGORY_NAMES.map((n, i) => `${i + 1}. ${n}`).join("\n")}

## 核心要求

### 1. 目的地针对性（最重要）
- 用户默认为**中国大陆居民**，从中国大陆出发。
- **判断目的地是否在中国境内**：
  - 若目的地属于中国大陆境内（如北京、三亚、云南、成都、西藏等），「证件与支付」**不需要**护照、签证、国际漫游/eSIM；身份证即可，交通用国内高铁/机票 App（如铁路 12306、携程）。
  - 若目的地在中国境外（含港澳台及所有海外目的地），「证件与支付」**必须**包含护照（确认有效期 ≥ 6 个月）、目的地签证或入境许可、国际漫游开通或当地 eSIM/SIM 卡。
- 根据「${destination}」推断当地气候、电压/插座、货币、常用交通与支付方式，写入具体物品。
- 结合当地文化与旅行习惯给出特色建议，例如：
  - 日本：西瓜卡/IC 卡、Visit Japan Web 登记、日元现金、室内拖鞋、折叠伞、eSIM
  - 澳大利亚/新西兰：高倍防晒霜 SPF50+、防蚊液、泳装、澳标转换插头
  - 欧洲：申根区签证、欧元现金、欧标转换插头、防盗腰包
  - 东南亚：轻便透气衣物、防蚊液、肠胃药、拖鞋、当地 SIM/eSIM
  - 中国国内：身份证、手机（支付宝/微信支付）、高铁票/机票、地图 App
- 若目的地不明确，根据名称合理推断国家/地区后再给建议。
- 「证件与支付」「行程准备」中须包含该目的地真实会用到的证件、App、交通卡或入境事项。

### 2. 按 ${days} 天调整数量
- 衣物类物品必须体现天数：内衣裤、袜子、T 恤等按「每天 1 件 + 备用 1～2 件」或「每 2～3 天 1 件（外套/长裤）」估算，并写清数量。
- 示例（${days} 天）：内衣 ${Math.min(days + 1, days + 2)} 条、袜子 ${Math.min(days + 1, days + 2)} 双、外穿衣物按天数分层列出。
- 洗漱/日用品按天数说明是否需旅行装或大容量（如 ${days >= 7 ? "7 天以上建议分装或当地购买" : "短期旅行装即可"}）。

### 3. 补充信息专属物品
${
  hasExtra
    ? `- 用户补充：「${additionalInfo!.trim()}」。必须在相关分类中增加**专属物品**，不可忽略。参考：
  - 带小孩/亲子：儿童推车/背带、儿童常用药、零食、绘本、儿童防晒霜、备用衣物等
  - 商务出行：正装/衬衫、领带、笔记本电脑、名片、便携熨斗、商务鞋等
  - 冬季/滑雪：羽绒服、保暖内衣、手套、暖宝宝、润唇膏等
  - 户外/徒步：登山鞋、冲锋衣、登山杖、头灯、急救包等
  - 其他需求：逐条理解并在合适分类中体现`
    : "- 无补充信息时，不强行添加亲子/商务等场景物品。"
}

### 4. 仅包含当前实际有效的物品
- **严禁**列入已废除的政策性要求，包括但不限于：健康码、核酸检测证明、疫苗接种证明（如目的地已不强制要求）、行程卡等疫情时代产物。
- 所有证件、App、入境要求须基于目的地**2025 年现行规定**，如实填写；若不确定，写"建议出发前确认最新入境政策"，不得编造或沿用过时要求。
- 「行程准备」中仅列真实存在且当前有效的 App、通关方式或预约系统（如日本 Visit Japan Web、澳大利亚 SmartGate、欧洲 ETIAS 等）。

### 5. 物品描述必须具体可执行
- **禁止**模糊表述：如「换洗衣物」「常用药品」「充电器」「洗漱用品」。
- **必须**写清品名 + 数量/规格，例如：
  - ✅「轻便速干 T 恤 3 件」「内裤 5 条」「袜子 5 双」
  - ✅「10000mAh 移动电源 1 个」「欧标转换插头 1 个」
  - ✅「SPF50+ 防晒霜 1 支 50ml」
- 每个分类 3～5 条物品，共约 18～28 条，全部使用简体中文。`;
}

type ParsedResponse = {
  categories: GeneratedCategory[];
  destinationInfo?: GeneratedDestinationInfo;
};

function parseResponse(text: string): ParsedResponse {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : trimmed;
  const parsed = JSON.parse(jsonStr) as {
    categories: GeneratedCategory[];
    destination_info?: GeneratedDestinationInfo;
  };
  if (!Array.isArray(parsed.categories)) {
    throw new Error("Invalid response format");
  }
  return {
    categories: parsed.categories,
    destinationInfo: parsed.destination_info,
  };
}

async function generatePackingList(
  apiKey: string,
  prompt: string
): Promise<string> {
  const client = createQwenClient(apiKey);

  const completion = await client.chat.completions.create({
    model: QWEN_MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 4096,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("千问 API 返回了空内容");
  }
  return text;
}

export async function POST(request: NextRequest) {
  const apiKey = getDashscopeApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: dashscopeKeyMissingError(),
        details: dashscopeKeyMissingDetails(),
      },
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

  const prompt = buildPrompt(
    destination.trim(),
    days,
    departureDate,
    additionalInfo?.trim()
  );

  try {
    const text = await generatePackingList(apiKey, prompt);
    const { categories, destinationInfo } = parseResponse(text);

    const normalized = CATEGORY_NAMES.map((name) => {
      const found =
        categories.find((c) => c.name === name) ??
        categories.find((c) => c.name.includes(name.slice(0, 2)));
      return {
        name,
        items: found?.items?.length ? found.items : [`${name}相关物品`],
      };
    });

    return NextResponse.json({
      categories: normalized,
      destinationInfo,
      modelUsed: QWEN_MODEL,
    });
  } catch (err) {
    console.error("Qwen API error:", err);
    const { error, details } = formatDashscopeError(err);
    return NextResponse.json({ error, details }, { status: 500 });
  }
}
