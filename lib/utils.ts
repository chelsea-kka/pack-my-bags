import type { PackingCategory, Trip } from "./types";

/**
 * 中文目的地 → Unsplash 搜索关键词映射表
 * 覆盖常见国家、城市和国内热门目的地
 */
const DESTINATION_KEYWORDS: Record<string, string> = {
  // 亚洲国家
  泰国: "Thailand travel temple",
  日本: "Japan travel",
  韩国: "Korea Seoul travel",
  越南: "Vietnam travel",
  印度尼西亚: "Indonesia travel",
  马来西亚: "Malaysia travel",
  印度: "India travel",
  尼泊尔: "Nepal Himalayas",
  斯里兰卡: "Sri Lanka travel",
  菲律宾: "Philippines island beach",
  柬埔寨: "Cambodia Angkor Wat",
  缅甸: "Myanmar travel",
  // 欧洲国家
  法国: "France travel",
  英国: "England countryside travel",
  意大利: "Italy travel",
  德国: "Germany travel",
  西班牙: "Spain travel",
  葡萄牙: "Portugal Lisbon travel",
  荷兰: "Netherlands Amsterdam",
  瑞士: "Switzerland Alps mountains",
  奥地利: "Austria travel",
  希腊: "Greece island sea",
  捷克: "Czech Prague travel",
  匈牙利: "Hungary Budapest travel",
  波兰: "Poland travel",
  芬兰: "Finland forest lake",
  瑞典: "Sweden Scandinavia",
  挪威: "Norway fjord",
  丹麦: "Denmark Copenhagen",
  冰岛: "Iceland landscape aurora",
  // 美洲
  美国: "USA travel",
  加拿大: "Canada nature",
  墨西哥: "Mexico travel",
  巴西: "Brazil travel",
  阿根廷: "Argentina travel",
  // 中东 & 非洲
  迪拜: "Dubai skyline",
  土耳其: "Turkey Istanbul travel",
  埃及: "Egypt pyramid",
  摩洛哥: "Morocco travel",
  南非: "South Africa travel",
  肯尼亚: "Kenya safari wildlife",
  // 大洋洲
  澳大利亚: "Australia travel",
  新西兰: "New Zealand landscape",
  // 亚洲城市
  东京: "Tokyo Japan city",
  京都: "Kyoto Japan temple",
  大阪: "Osaka Japan",
  首尔: "Seoul Korea",
  釜山: "Busan Korea sea",
  曼谷: "Bangkok Thailand temple",
  清迈: "Chiang Mai Thailand",
  巴厘岛: "Bali Indonesia rice terrace",
  普吉岛: "Phuket Thailand beach",
  河内: "Hanoi Vietnam",
  胡志明市: "Ho Chi Minh Vietnam",
  西贡: "Saigon Vietnam",
  暹粒: "Siem Reap Cambodia",
  加德满都: "Kathmandu Nepal",
  新加坡: "Singapore skyline night",
  吉隆坡: "Kuala Lumpur Malaysia",
  // 欧洲城市
  巴黎: "Paris Eiffel Tower",
  伦敦: "London travel",
  罗马: "Rome Italy Colosseum",
  威尼斯: "Venice Italy canal",
  佛罗伦萨: "Florence Italy",
  米兰: "Milan Italy",
  巴塞罗那: "Barcelona Spain",
  马德里: "Madrid Spain",
  阿姆斯特丹: "Amsterdam Netherlands canal",
  维也纳: "Vienna Austria",
  布拉格: "Prague Czech Republic",
  布达佩斯: "Budapest Hungary",
  苏黎世: "Zurich Switzerland",
  日内瓦: "Geneva Switzerland lake",
  因特拉肯: "Interlaken Switzerland",
  里斯本: "Lisbon Portugal",
  雅典: "Athens Greece Acropolis",
  圣托里尼: "Santorini Greece white blue",
  赫尔辛基: "Helsinki Finland",
  斯德哥尔摩: "Stockholm Sweden",
  哥本哈根: "Copenhagen Denmark",
  奥斯陆: "Oslo Norway",
  雷克雅未克: "Reykjavik Iceland",
  拉普兰: "Lapland Finland winter snow",
  // 北欧自然
  北极光: "Northern Lights aurora borealis",
  // 美洲城市
  纽约: "New York City skyline",
  洛杉矶: "Los Angeles California",
  旧金山: "San Francisco bridge",
  拉斯维加斯: "Las Vegas night",
  夏威夷: "Hawaii beach ocean",
  迈阿密: "Miami beach",
  温哥华: "Vancouver Canada",
  多伦多: "Toronto Canada",
  // 中东城市
  开罗: "Cairo Egypt pyramid",
  马拉喀什: "Marrakech Morocco",
  开普敦: "Cape Town South Africa",
  // 大洋洲城市
  悉尼: "Sydney Opera House",
  墨尔本: "Melbourne Australia",
  奥克兰: "Auckland New Zealand",
  皇后镇: "Queenstown New Zealand",
  // 中国国内
  北京: "Beijing China",
  上海: "Shanghai China skyline",
  广州: "Guangzhou China",
  深圳: "Shenzhen China modern",
  成都: "Chengdu China panda",
  重庆: "Chongqing China night",
  西安: "Xian China terracotta",
  桂林: "Guilin China karst landscape",
  杭州: "Hangzhou China West Lake",
  苏州: "Suzhou China garden",
  厦门: "Xiamen China coast",
  三亚: "Sanya China beach",
  丽江: "Lijiang China ancient town",
  大理: "Dali Yunnan China",
  云南: "Yunnan China landscape",
  西藏: "Tibet plateau monastery",
  拉萨: "Lhasa Tibet",
  张家界: "Zhangjiajie China Avatar mountains",
  黄山: "Huangshan China misty mountains",
  九寨沟: "Jiuzhaigou China colorful lake",
  青海: "Qinghai China lake turquoise",
  新疆: "Xinjiang China landscape",
  内蒙古: "Inner Mongolia grassland",
  海南: "Hainan China beach",
  台湾: "Taiwan travel",
  台北: "Taipei Taiwan night market",
  香港: "Hong Kong skyline",
  澳门: "Macau casino travel",
};

/**
 * 根据目的地名称返回 Unsplash 按关键词搜索的图片 URL。
 * 使用 source.unsplash.com 的 featured 随机重定向接口，
 * 同一关键词每次会返回不同的真实图片。
 */
export function getCityImageUrl(destination: string): string {
  // 先查精确匹配，再查包含关系（例如"法国·巴黎"能命中"巴黎"）
  let keyword = DESTINATION_KEYWORDS[destination];
  if (!keyword) {
    for (const [key, kw] of Object.entries(DESTINATION_KEYWORDS)) {
      if (destination.includes(key)) {
        keyword = kw;
        break;
      }
    }
  }
  // 未命中时直接用目的地名作为关键词（英文目的地也能搜到）
  const query = encodeURIComponent(keyword ?? `${destination} travel`);
  return `https://source.unsplash.com/featured/800x500/?${query}`;
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
