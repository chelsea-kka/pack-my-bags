import type { PackingCategory, Trip } from "./types";

// ─── 目的地 → Unsplash 英文搜索关键词 ─────────────────────────────────────────
// 用于在 Unsplash 上按关键词搜索与目的地匹配的真实图片
const DESTINATION_KEYWORDS: Record<string, string> = {
  // 亚洲国家
  泰国: "Thailand travel temple",
  日本: "Japan travel",
  韩国: "Korea Seoul travel",
  越南: "Vietnam landscape travel",
  印度尼西亚: "Indonesia travel",
  马来西亚: "Malaysia travel",
  印度: "India travel landscape",
  尼泊尔: "Nepal Himalayas",
  斯里兰卡: "Sri Lanka travel",
  菲律宾: "Philippines island beach",
  柬埔寨: "Cambodia Angkor Wat",
  缅甸: "Myanmar travel",
  新加坡: "Singapore city skyline",
  // 欧洲国家
  法国: "France travel countryside",
  英国: "England travel",
  意大利: "Italy travel landscape",
  德国: "Germany travel",
  西班牙: "Spain travel",
  葡萄牙: "Portugal travel",
  荷兰: "Netherlands Amsterdam",
  瑞士: "Switzerland Alps mountains",
  奥地利: "Austria travel",
  希腊: "Greece island sea",
  捷克: "Czech Prague travel",
  匈牙利: "Hungary Budapest travel",
  波兰: "Poland travel",
  芬兰: "Finland forest lake",
  瑞典: "Sweden Scandinavia travel",
  挪威: "Norway fjord landscape",
  丹麦: "Denmark Copenhagen travel",
  冰岛: "Iceland landscape aurora",
  // 美洲
  美国: "USA travel landscape",
  加拿大: "Canada nature landscape",
  墨西哥: "Mexico travel",
  巴西: "Brazil travel",
  阿根廷: "Argentina travel",
  // 中东 & 非洲
  迪拜: "Dubai skyline architecture",
  土耳其: "Turkey Istanbul travel",
  埃及: "Egypt pyramid desert",
  摩洛哥: "Morocco travel desert",
  南非: "South Africa landscape",
  肯尼亚: "Kenya safari wildlife",
  // 大洋洲
  澳大利亚: "Australia landscape travel",
  新西兰: "New Zealand landscape travel",
  // 亚洲城市
  东京: "Tokyo Japan city",
  京都: "Kyoto Japan temple",
  大阪: "Osaka Japan",
  首尔: "Seoul Korea city",
  釜山: "Busan Korea sea",
  曼谷: "Bangkok Thailand temple",
  清迈: "Chiang Mai Thailand",
  巴厘岛: "Bali Indonesia rice terrace",
  普吉岛: "Phuket Thailand beach",
  河内: "Hanoi Vietnam street",
  胡志明市: "Ho Chi Minh Vietnam",
  西贡: "Saigon Vietnam city",
  暹粒: "Siem Reap Cambodia Angkor",
  加德满都: "Kathmandu Nepal mountain",
  吉隆坡: "Kuala Lumpur Malaysia",
  // 欧洲城市
  巴黎: "Paris France Eiffel Tower",
  伦敦: "London England travel",
  罗马: "Rome Italy Colosseum",
  威尼斯: "Venice Italy canal",
  佛罗伦萨: "Florence Italy",
  米兰: "Milan Italy fashion",
  巴塞罗那: "Barcelona Spain",
  马德里: "Madrid Spain",
  阿姆斯特丹: "Amsterdam Netherlands canal",
  维也纳: "Vienna Austria",
  布拉格: "Prague Czech Republic",
  布达佩斯: "Budapest Hungary",
  苏黎世: "Zurich Switzerland lake",
  日内瓦: "Geneva Switzerland",
  因特拉肯: "Interlaken Switzerland Alps",
  里斯本: "Lisbon Portugal",
  雅典: "Athens Greece Acropolis",
  圣托里尼: "Santorini Greece white blue",
  赫尔辛基: "Helsinki Finland",
  斯德哥尔摩: "Stockholm Sweden water",
  哥本哈根: "Copenhagen Denmark colorful",
  奥斯陆: "Oslo Norway fjord",
  雷克雅未克: "Reykjavik Iceland",
  拉普兰: "Lapland Finland snow aurora",
  // 美洲城市
  纽约: "New York City skyline",
  洛杉矶: "Los Angeles California",
  旧金山: "San Francisco bridge",
  拉斯维加斯: "Las Vegas night",
  夏威夷: "Hawaii beach ocean tropical",
  迈阿密: "Miami beach",
  温哥华: "Vancouver Canada mountains",
  多伦多: "Toronto Canada city",
  // 中东城市
  开罗: "Cairo Egypt pyramid",
  马拉喀什: "Marrakech Morocco",
  开普敦: "Cape Town South Africa",
  // 大洋洲城市
  悉尼: "Sydney Australia Opera House",
  墨尔本: "Melbourne Australia city",
  奥克兰: "Auckland New Zealand",
  皇后镇: "Queenstown New Zealand mountains",
  // 中国国内
  北京: "Beijing China Great Wall",
  上海: "Shanghai China skyline",
  广州: "Guangzhou China",
  深圳: "Shenzhen China modern city",
  成都: "Chengdu China panda",
  重庆: "Chongqing China night",
  西安: "Xian China ancient terracotta",
  桂林: "Guilin China karst mountains",
  杭州: "Hangzhou China West Lake",
  苏州: "Suzhou China garden",
  厦门: "Xiamen China coast",
  三亚: "Sanya China beach tropical",
  丽江: "Lijiang China ancient town",
  大理: "Dali Yunnan China",
  云南: "Yunnan China landscape",
  西藏: "Tibet plateau monastery",
  拉萨: "Lhasa Tibet",
  张家界: "Zhangjiajie China mountains",
  黄山: "Huangshan China misty mountains",
  九寨沟: "Jiuzhaigou China colorful lake",
  青海: "Qinghai China lake",
  新疆: "Xinjiang China landscape",
  内蒙古: "Inner Mongolia grassland",
  海南: "Hainan China beach",
  台湾: "Taiwan travel",
  台北: "Taipei Taiwan",
  香港: "Hong Kong skyline night",
  澳门: "Macau travel",
};

/**
 * 根据目的地名称从 Unsplash API 获取匹配图片 URL。
 * 支持精确匹配和子串匹配（如"法国·巴黎"→"巴黎"）。
 * 请求失败时 fallback 到 picsum.photos 确定性占位图。
 */
export async function getCityImageUrl(destination: string): Promise<string> {
  // 精确匹配
  let keyword = DESTINATION_KEYWORDS[destination];

  // 子串匹配（如"日本·京都"→"京都"）
  if (!keyword) {
    for (const [key, kw] of Object.entries(DESTINATION_KEYWORDS)) {
      if (destination.includes(key)) {
        keyword = kw;
        break;
      }
    }
  }

  const query = encodeURIComponent(keyword ?? `${destination} travel landscape`);
  const fallback = `https://picsum.photos/seed/${query}/800/480`;

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=U-E0oloa09w_4A0Ik8HdZ_f9DbBY8O2IY_sBa1wkMoI`,
    );
    if (!res.ok) return fallback;
    const data = (await res.json()) as { urls?: { regular?: string } };
    return data.urls?.regular ?? fallback;
  } catch {
    return fallback;
  }
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export function formatDateRange(departureDate: string, days: number): string {
  const start = new Date(departureDate + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  const fmt = (d: Date) =>
    `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return `${fmt(start)} - ${end.getMonth() + 1}月${end.getDate()}日`;
}

export function formatDateRangeShort(departureDate: string, days: number): string {
  const start = new Date(departureDate + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${fmt(start)} – ${fmt(end)}`;
}

export function countProgress(categories: PackingCategory[]): {
  checked: number;
  total: number;
  percent: number;
} {
  let checked = 0;
  let total = 0;
  for (const cat of categories) {
    for (const item of cat.items) {
      total++;
      if (item.checked) checked++;
    }
  }
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
  return { checked, total, percent };
}

export function tripProgress(trip: Trip) {
  return countProgress(trip.categories);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
