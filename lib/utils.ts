import type { PackingCategory, Trip } from "./types";

// ─── Destination photo IDs (curated, stable Unsplash direct CDN links) ────────
// Using direct photo IDs avoids the deprecated source.unsplash.com redirect.
// URL format: https://images.unsplash.com/photo-{ID}?w=800&h=480&fit=crop&auto=format&q=80

const DESTINATION_PHOTO_IDS: Record<string, string> = {
  // East Asia
  日本: "1490806843957-31f4c9a91c65",
  东京: "1540959733332-eab4deabeeaf",
  京都: "1493976040374-85c8e12f0c0e",
  大阪: "1493976040374-85c8e12f0c0e",
  韩国: "1517154421773-0855b07a25d4",
  首尔: "1517154421773-0855b07a25d4",
  // Southeast Asia
  泰国: "1528360983277-13d401cdc186",
  曼谷: "1528360983277-13d401cdc186",
  清迈: "1528360983277-13d401cdc186",
  巴厘岛: "1537996194471-e657df975ab4",
  普吉岛: "1524492412937-28c6667b4d0e",
  越南: "1559592413-7cec4d0cae2b",
  河内: "1559592413-7cec4d0cae2b",
  胡志明市: "1559592413-7cec4d0cae2b",
  新加坡: "1525625293386-23a59d37df71",
  印度: "1524492412937-28c6667b4d0e",
  // Europe
  法国: "1502602898657-3e91760cbb34",
  巴黎: "1502602898657-3e91760cbb34",
  意大利: "1515542622106-78bda8ba0e5b",
  罗马: "1515542622106-78bda8ba0e5b",
  威尼斯: "1534430480872-3498386e7856",
  英国: "1513635269975-59663e0ac1ad",
  伦敦: "1513635269975-59663e0ac1ad",
  西班牙: "1539037116277-4db20889f2d4",
  巴塞罗那: "1539037116277-4db20889f2d4",
  希腊: "1506905925346-21bda4d32df4",
  圣托里尼: "1506905925346-21bda4d32df4",
  瑞士: "1531973576160-7125cd663d86",
  荷兰: "1512470876302-972faa2aa9a4",
  阿姆斯特丹: "1512470876302-972faa2aa9a4",
  葡萄牙: "1511739001486-6bfe10ce785f",
  里斯本: "1511739001486-6bfe10ce785f",
  德国: "1511739001486-6bfe10ce785f",
  奥地利: "1531973576160-7125cd663d86",
  // Nordic
  芬兰: "1519681393784-d120267933ba",
  拉普兰: "1519681393784-d120267933ba",
  冰岛: "1504829857797-ddff29c27927",
  挪威: "1513519245088-8b1a55a9e0c9",
  瑞典: "1519681393784-d120267933ba",
  丹麦: "1513519245088-8b1a55a9e0c9",
  // Oceania
  澳大利亚: "1523482580672-f1450b69ef35",
  悉尼: "1523482580672-f1450b69ef35",
  新西兰: "1505764707775-d6e3c9b0f6f3",
  // Middle East & Africa
  迪拜: "1512453979798-5ea266f8880c",
  土耳其: "1527838832700-5059252337ae",
  // China domestic
  北京: "1508804185872-173bbf0a4139",
  上海: "1545558014-8692077e9b5c",
  香港: "1536599018926-de2d30cad94a",
  台湾: "1570804100373-bccc5d4c69f9",
  台北: "1570804100373-bccc5d4c69f9",
  成都: "1524492412937-28c6667b4d0e",
  云南: "1505764707775-d6e3c9b0f6f3",
  西藏: "1504829857797-ddff29c27927",
  桂林: "1493976040374-85c8e12f0c0e",
  张家界: "1493976040374-85c8e12f0c0e",
  杭州: "1540959733332-eab4deabeeaf",
  三亚: "1537996194471-e657df975ab4",
  // Americas
  美国: "1551854838-212c42b153a8",
  纽约: "1548449547-7b32e8bd3c4c",
  洛杉矶: "1534430480872-3498386e7856",
  旧金山: "1534430480872-3498386e7856",
  夏威夷: "1537996194471-e657df975ab4",
  加拿大: "1505764707775-d6e3c9b0f6f3",
  温哥华: "1519681393784-d120267933ba",
};

// Stable fallback pool (all are known-good Unsplash photo IDs)
const FALLBACK_PHOTO_IDS = [
  "1540959733332-eab4deabeeaf", // Tokyo street
  "1502602898657-3e91760cbb34", // Paris
  "1511739001486-6bfe10ce785f", // Europe
  "1493976040374-85c8e12f0c0e", // Kyoto garden
  "1524492412937-28c6667b4d0e", // India
  "1539037116277-4db20889f2d4", // Barcelona
  "1513635269975-59663e0ac1ad", // London
  "1505764707775-d6e3c9b0f6f3", // Nature
  "1528360983277-13d401cdc186", // Thailand
  "1537996194471-e657df975ab4", // Bali
  "1506905925346-21bda4d32df4", // Santorini
  "1519681393784-d120267933ba", // Aurora
  "1504829857797-ddff29c27927", // Iceland
  "1531973576160-7125cd663d86", // Alps
];

export function getCityImageUrl(destination: string): string {
  // Exact match
  let photoId = DESTINATION_PHOTO_IDS[destination];

  // Substring match (e.g. "法国·巴黎" → "巴黎")
  if (!photoId) {
    for (const [key, id] of Object.entries(DESTINATION_PHOTO_IDS)) {
      if (destination.includes(key)) {
        photoId = id;
        break;
      }
    }
  }

  // Deterministic fallback from pool
  if (!photoId) {
    let hash = 0;
    for (let i = 0; i < destination.length; i++) {
      hash = (hash << 5) - hash + destination.charCodeAt(i);
      hash |= 0;
    }
    photoId = FALLBACK_PHOTO_IDS[Math.abs(hash) % FALLBACK_PHOTO_IDS.length];
  }

  return `https://images.unsplash.com/photo-${photoId}?w=800&h=480&fit=crop&auto=format&q=80`;
}

// ─── (deprecated keyword map kept for reference only) ────────────────────────
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
