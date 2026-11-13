// 부산 전역 여행 · 노선 데이터
// - 좌표는 실제 경위도(근사값)이며 geoToMap()으로 3D 지도 좌표(km)로 변환한다.
// - 각 명소의 panoramaUrl 에 360도(equirectangular) 이미지 URL을 넣으면
//   절차적 3D 장면 대신 파노라마로 교체된다. (proceduralScenes.js 참고)

export const MAP = {
  centerLon: 129.085,
  centerLat: 35.17,
  kmPerLon: 91.0,
  kmPerLat: 111.0,
  halfSizeKm: 17.2, // 지도 한 변의 절반 (km)
  scale: 0.09, // 1km = 0.09m (테이블 디오라마)
};

/** 경위도 → 지도 로컬 좌표(km). x=동쪽, z=남쪽(+), 북쪽이 -z */
export function geoToMap(lon, lat) {
  return {
    x: (lon - MAP.centerLon) * MAP.kmPerLon,
    z: -(lat - MAP.centerLat) * MAP.kmPerLat,
  };
}

export const REGIONS = [
  { id: 'east', name: '동부산권', color: '#ff6b5e' },
  { id: 'suyeong', name: '수영·남구권', color: '#3fa7ff' },
  { id: 'old', name: '원도심·영도권', color: '#ffb02e' },
  { id: 'north', name: '도심·북부산권', color: '#62d26f' },
  { id: 'west', name: '서부산권', color: '#c77dff' },
];

export const SPOTS = [
  // ───────── 동부산권 ─────────
  {
    id: 'haeundae', name: '해운대 해수욕장', nameEn: 'Haeundae Beach', region: 'east',
    lon: 129.1604, lat: 35.1587, sky: 'day', ambience: 'sea',
    station: { line: 2, name: '해운대' }, busStop: '해운대해수욕장',
    desc: '부산을 대표하는 1.5km 백사장. 고층 호텔과 엘시티가 병풍처럼 둘러싼 도심형 해변입니다.',
    highlights: ['백사장과 파라솔', '엘시티 · 달맞이 언덕', '동백섬 방향 산책로'],
    panoramaUrl: null,
  },
  {
    id: 'marine', name: '마린시티 · 동백섬', nameEn: 'Marine City & Dongbaekseom', region: 'east',
    lon: 129.148, lat: 35.1545, sky: 'night', ambience: 'sea',
    station: { line: 2, name: '동백' }, busStop: '동백섬입구',
    desc: '초고층 주상복합이 만드는 야경과 누리마루 APEC하우스가 있는 동백섬 해안 산책로입니다.',
    highlights: ['마린시티 마천루 야경', '누리마루 APEC하우스', '동백섬 등대'],
    panoramaUrl: null,
  },
  {
    id: 'yonggungsa', name: '해동용궁사', nameEn: 'Haedong Yonggungsa', region: 'east',
    lon: 129.2233, lat: 35.1884, sky: 'day', ambience: 'sea',
    station: { line: 2, name: '장산' }, busStop: '용궁사·국립수산과학관',
    desc: '바다 위 갯바위에 지어진 수상 법당. 파도 소리와 함께 일출을 맞는 사찰입니다.',
    highlights: ['대웅전과 해수관음상', '108계단 · 석탑', '갯바위와 파도'],
    panoramaUrl: null,
  },
  {
    id: 'jukseong', name: '기장 죽성성당', nameEn: 'Jukseong Church', region: 'east',
    lon: 129.2475, lat: 35.2412, sky: 'day', ambience: 'sea',
    station: { line: 4, name: '안평' }, busStop: '죽성드림세트장',
    desc: '드라마 세트장으로 지어진 바닷가의 작은 성당. 붉은 지붕과 흰 등대가 그림 같은 곳입니다.',
    highlights: ['붉은 지붕 성당', '흰 등대와 방파제', '기장 앞바다'],
    panoramaUrl: null,
  },
  // ───────── 수영·남구권 ─────────
  {
    id: 'gwangalli', name: '광안리 · 광안대교', nameEn: 'Gwangalli & Gwangan Bridge', region: 'suyeong',
    lon: 129.1186, lat: 35.1532, sky: 'night', ambience: 'sea',
    station: { line: 2, name: '광안' }, busStop: '광안리해수욕장',
    desc: '7.4km 광안대교의 LED 경관조명과 불꽃이 밤바다를 물들이는 부산 야경 1번지입니다.',
    highlights: ['광안대교 경관조명', '불꽃놀이', '해변 카페거리'],
    panoramaUrl: null,
  },
  {
    id: 'oryukdo', name: '오륙도 스카이워크', nameEn: 'Oryukdo Skywalk', region: 'suyeong',
    lon: 129.1245, lat: 35.101, sky: 'day', ambience: 'sea',
    station: { line: 2, name: '경성대·부경대' }, busStop: '오륙도스카이워크',
    desc: '35m 해안 절벽 위로 뻗은 유리 다리. 발아래 파도와 오륙도 섬들이 한눈에 보입니다.',
    highlights: ['유리 바닥 스카이워크', '오륙도 여섯 섬', '동해·남해 분기점'],
    panoramaUrl: null,
  },
  {
    id: 'igidae', name: '이기대 해안', nameEn: 'Igidae Coastal Walk', region: 'suyeong',
    lon: 129.1235, lat: 35.118, sky: 'dusk', ambience: 'sea',
    station: { line: 2, name: '남천' }, busStop: '이기대입구',
    desc: '기암절벽을 따라 걷는 해안 산책로. 바다 건너 광안대교와 마린시티가 펼쳐집니다.',
    highlights: ['해안 데크길 · 구름다리', '기암절벽', '광안대교 원경'],
    panoramaUrl: null,
  },
  // ───────── 원도심·영도권 ─────────
  {
    id: 'gamcheon', name: '감천문화마을', nameEn: 'Gamcheon Culture Village', region: 'old',
    lon: 129.0106, lat: 35.0975, sky: 'day', ambience: 'wind', pinHeight: 1.5,
    station: { line: 1, name: '토성' }, busStop: '감천문화마을',
    desc: '산비탈을 따라 알록달록한 집들이 계단식으로 늘어선 "한국의 마추픽추"입니다.',
    highlights: ['계단식 파스텔 집', '어린왕자와 여우', '하늘마루 전망대'],
    panoramaUrl: null,
  },
  {
    id: 'jagalchi', name: '자갈치시장 · 남포동', nameEn: 'Jagalchi Market & Nampo', region: 'old',
    lon: 129.0305, lat: 35.0967, sky: 'day', ambience: 'city', pinHeight: 0.9,
    station: { line: 1, name: '자갈치' }, busStop: '자갈치시장',
    desc: '"오이소 보이소 사이소!" 갈매기 지붕의 국내 최대 수산시장과 영도대교가 있는 항구입니다.',
    highlights: ['갈매기 지붕 시장 건물', '파라솔 좌판', '영도대교 도개'],
    panoramaUrl: null,
  },
  {
    id: 'tower', name: '부산타워 · 용두산공원', nameEn: 'Busan Tower', region: 'old',
    lon: 129.0324, lat: 35.1012, sky: 'day', ambience: 'city', pinHeight: 2.0,
    station: { line: 1, name: '남포' }, busStop: '부산역·용두산공원',
    desc: '해발 69m 용두산 위 120m 높이의 부산타워. 부산항과 영도가 내려다보이는 원도심의 상징입니다.',
    highlights: ['부산타워 전망대', '이순신 장군 동상 · 종각', '꽃시계'],
    panoramaUrl: null,
  },
  {
    id: 'taejongdae', name: '태종대', nameEn: 'Taejongdae', region: 'old',
    lon: 129.085, lat: 35.053, sky: 'day', ambience: 'sea',
    station: { line: 1, name: '남포' }, busStop: '태종대',
    desc: '영도 남쪽 끝 해안 절벽과 울창한 해송 숲. 영도등대와 신선바위가 유명합니다.',
    highlights: ['영도등대 · 신선바위', '다누비 열차', '해안 절벽 전망대'],
    panoramaUrl: null,
  },
  {
    id: 'huinnyeoul', name: '흰여울문화마을', nameEn: 'Huinnyeoul Culture Village', region: 'old',
    lon: 129.0437, lat: 35.0783, sky: 'sunset', ambience: 'sea', pinHeight: 1.2,
    station: { line: 1, name: '남포' }, busStop: '흰여울문화마을',
    desc: '영도 절벽 위 하얀 골목길 마을. 묘박지에 떠 있는 배들과 노을이 어우러집니다.',
    highlights: ['절벽 위 흰 담장길', '묘박지의 배들', '노을'],
    panoramaUrl: null,
  },
  // ───────── 도심·북부산권 ─────────
  {
    id: 'seomyeon', name: '서면', nameEn: 'Seomyeon', region: 'north',
    lon: 129.059, lat: 35.1578, sky: 'night', ambience: 'city',
    station: { line: 1, name: '서면' }, busStop: '서면역',
    desc: '부산 지하철 1·2호선이 만나는 최대 번화가. 네온사인과 먹자골목이 밤새 빛납니다.',
    highlights: ['네온사인 거리', '전포 카페거리', '1·2호선 환승역'],
    panoramaUrl: null,
  },
  {
    id: 'sajik', name: '사직야구장', nameEn: 'Sajik Baseball Stadium', region: 'north',
    lon: 129.0615, lat: 35.194, sky: 'night', ambience: 'crowd',
    station: { line: 3, name: '종합운동장' }, busStop: '사직야구장',
    desc: '"부산 갈매기"가 울려 퍼지는 구도 부산의 심장. 주황 봉다리 응원이 명물입니다.',
    highlights: ['야간 경기 조명탑', '주황 봉다리 응원', '전광판'],
    panoramaUrl: null,
  },
  {
    id: 'beomeosa', name: '범어사 · 금정산성', nameEn: 'Beomeosa & Geumjeongsanseong', region: 'north',
    lon: 129.068, lat: 35.2838, sky: 'day', ambience: 'forest',
    station: { line: 1, name: '범어사' }, busStop: '범어사매표소',
    desc: '금정산 자락의 천년 고찰 범어사와 국내 최대 산성인 금정산성 성곽길입니다.',
    highlights: ['일주문 · 대웅전', '삼층석탑', '금정산성 북문'],
    panoramaUrl: null,
  },
  // ───────── 서부산권 ─────────
  {
    id: 'dadaepo', name: '다대포 해수욕장', nameEn: 'Dadaepo Beach (Sunset)', region: 'west',
    lon: 128.9662, lat: 35.0468, sky: 'sunset', ambience: 'sea',
    station: { line: 1, name: '다대포해수욕장' }, busStop: '다대포해수욕장',
    desc: '낙동강 하구와 바다가 만나는 넓은 갯벌 해변. 부산에서 가장 아름다운 낙조 명소입니다.',
    highlights: ['수평선 낙조', '꿈의 낙조분수', '고우니 생태길'],
    panoramaUrl: null,
  },
  {
    id: 'eulsukdo', name: '을숙도', nameEn: 'Eulsukdo Island', region: 'west',
    lon: 128.944, lat: 35.104, sky: 'dusk', ambience: 'forest',
    station: { line: 1, name: '하단' }, busStop: '을숙도',
    desc: '낙동강 하구의 철새 도래지. 갈대밭 사이 탐방로와 하굿둑이 펼쳐진 생태공원입니다.',
    highlights: ['갈대밭 탐방로', '철새 군무', '낙동강 하굿둑'],
    panoramaUrl: null,
  },
];

export const spotById = (id) => SPOTS.find((s) => s.id === id) || null;
export const regionById = (id) => REGIONS.find((r) => r.id === id) || REGIONS[0];

// ─────────────────────────────────────────────────────────────
// 부산 도시철도 1~4호선 (주요 역, ground=true 는 지상/고가 구간)
// ─────────────────────────────────────────────────────────────
export const SUBWAY_LINES = [
  {
    id: 1, name: '1호선', color: '#f06a00',
    stations: [
      { name: '다대포해수욕장', lon: 128.9655, lat: 35.048 },
      { name: '다대포항', lon: 128.972, lat: 35.0575 },
      { name: '신평', lon: 128.9605, lat: 35.095 },
      { name: '하단', lon: 128.9665, lat: 35.1063 },
      { name: '괴정', lon: 128.992, lat: 35.0997 },
      { name: '서대신', lon: 129.012, lat: 35.1105 },
      { name: '토성', lon: 129.0195, lat: 35.1008 },
      { name: '자갈치', lon: 129.0263, lat: 35.0972 },
      { name: '남포', lon: 129.0345, lat: 35.0979 },
      { name: '중앙', lon: 129.0367, lat: 35.104 },
      { name: '부산역', lon: 129.0394, lat: 35.1146 },
      { name: '초량', lon: 129.0425, lat: 35.121 },
      { name: '범일', lon: 129.0595, lat: 35.141 },
      { name: '서면', lon: 129.059, lat: 35.1578 },
      { name: '부전', lon: 129.0595, lat: 35.1625 },
      { name: '양정', lon: 129.0712, lat: 35.173 },
      { name: '시청', lon: 129.0765, lat: 35.1795 },
      { name: '연산', lon: 129.0817, lat: 35.1862 },
      { name: '교대', lon: 129.08, lat: 35.1955 },
      { name: '동래', lon: 129.0785, lat: 35.2057, ground: true },
      { name: '온천장', lon: 129.0862, lat: 35.2203, ground: true },
      { name: '부산대', lon: 129.0895, lat: 35.2298, ground: true },
      { name: '구서', lon: 129.0915, lat: 35.2478, ground: true },
      { name: '범어사', lon: 129.0925, lat: 35.2732 },
      { name: '노포', lon: 129.095, lat: 35.2838, ground: true },
    ],
  },
  {
    id: 2, name: '2호선', color: '#55b331',
    stations: [
      { name: '장산', lon: 129.177, lat: 35.17 },
      { name: '중동', lon: 129.1685, lat: 35.1668 },
      { name: '해운대', lon: 129.1586, lat: 35.1637 },
      { name: '동백', lon: 129.1484, lat: 35.1611 },
      { name: '벡스코', lon: 129.1385, lat: 35.169 },
      { name: '센텀시티', lon: 129.1317, lat: 35.169 },
      { name: '민락', lon: 129.1247, lat: 35.1672 },
      { name: '수영', lon: 129.1147, lat: 35.1657 },
      { name: '광안', lon: 129.1132, lat: 35.1576 },
      { name: '금련산', lon: 129.1105, lat: 35.15 },
      { name: '남천', lon: 129.1078, lat: 35.142 },
      { name: '경성대·부경대', lon: 129.101, lat: 35.1375 },
      { name: '대연', lon: 129.092, lat: 35.1352 },
      { name: '못골', lon: 129.0855, lat: 35.134 },
      { name: '문현', lon: 129.067, lat: 35.139 },
      { name: '전포', lon: 129.065, lat: 35.153 },
      { name: '서면', lon: 129.059, lat: 35.1578 },
      { name: '가야', lon: 129.043, lat: 35.1558 },
      { name: '주례', lon: 128.9995, lat: 35.1505 },
      { name: '사상', lon: 128.9845, lat: 35.1625 },
      { name: '덕천', lon: 129.0052, lat: 35.2105 },
      { name: '화명', lon: 129.0118, lat: 35.2355 },
      { name: '호포', lon: 129.0165, lat: 35.2815, ground: true },
    ],
  },
  {
    id: 3, name: '3호선', color: '#c9a227',
    stations: [
      { name: '수영', lon: 129.1147, lat: 35.1657 },
      { name: '망미', lon: 129.1065, lat: 35.1725 },
      { name: '연산', lon: 129.0817, lat: 35.1862 },
      { name: '거제', lon: 129.0745, lat: 35.189 },
      { name: '종합운동장', lon: 129.0605, lat: 35.1905 },
      { name: '사직', lon: 129.0654, lat: 35.1968 },
      { name: '미남', lon: 129.068, lat: 35.2053 },
      { name: '만덕', lon: 129.0375, lat: 35.2125 },
      { name: '덕천', lon: 129.0052, lat: 35.2105 },
      { name: '구포', lon: 128.996, lat: 35.2065, ground: true },
      { name: '강서구청', lon: 128.982, lat: 35.211, ground: true },
      { name: '대저', lon: 128.956, lat: 35.2135, ground: true },
    ],
  },
  {
    id: 4, name: '4호선', color: '#2f7fd6',
    stations: [
      { name: '미남', lon: 129.068, lat: 35.2053 },
      { name: '동래', lon: 129.0785, lat: 35.2057 },
      { name: '수안', lon: 129.0895, lat: 35.203 },
      { name: '낙민', lon: 129.0975, lat: 35.1995 },
      { name: '충렬사', lon: 129.1035, lat: 35.2005 },
      { name: '명장', lon: 129.1085, lat: 35.205 },
      { name: '서동', lon: 129.114, lat: 35.213 },
      { name: '금사', lon: 129.12, lat: 35.217 },
      { name: '반여농산물시장', lon: 129.128, lat: 35.218, ground: true },
      { name: '석대', lon: 129.1345, lat: 35.219, ground: true },
      { name: '영산대', lon: 129.143, lat: 35.228, ground: true },
      { name: '윗반송', lon: 129.157, lat: 35.233, ground: true },
      { name: '고촌', lon: 129.17, lat: 35.238, ground: true },
      { name: '안평', lon: 129.18, lat: 35.24, ground: true },
    ],
  },
];

export const lineById = (id) => SUBWAY_LINES.find((l) => l.id === id);
export const HUB_STATION = '부산역'; // 지도(허브)에서 출발할 때의 기준 역

/**
 * 지하철 경로 탐색 (역 이름 기준 BFS, 환승역은 이름이 같은 역).
 * @returns {{stops:{name:string,line:number,ground:boolean}[], transfers:{at:string,from:number,to:number}[], hops:number}}
 */
export function planSubwayTrip(fromName, toName) {
  const adj = new Map();
  const link = (a, b, line, ground) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a).push({ to: b, line, ground });
  };
  for (const line of SUBWAY_LINES) {
    for (let i = 0; i < line.stations.length - 1; i++) {
      const a = line.stations[i];
      const b = line.stations[i + 1];
      const ground = !!(a.ground && b.ground) || !!b.ground;
      link(a.name, b.name, line.id, ground);
      link(b.name, a.name, line.id, !!(a.ground && b.ground) || !!a.ground);
    }
  }
  if (!adj.has(fromName)) fromName = HUB_STATION;
  if (!adj.has(toName)) toName = HUB_STATION;
  if (fromName === toName) {
    // 같은 역이면 한 정거장 옆에서 출발하는 것으로 처리 (탑승 연출용)
    fromName = adj.get(toName)[0].to;
  }
  const prev = new Map([[fromName, null]]);
  const queue = [fromName];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === toName) break;
    for (const e of adj.get(cur) || []) {
      if (!prev.has(e.to)) {
        prev.set(e.to, { from: cur, line: e.line, ground: e.ground });
        queue.push(e.to);
      }
    }
  }
  const rev = [];
  let cur = toName;
  while (cur && prev.get(cur)) {
    const p = prev.get(cur);
    rev.push({ name: cur, line: p.line, ground: p.ground });
    cur = p.from;
  }
  rev.reverse();
  const firstLine = rev.length ? rev[0].line : 1;
  const stops = [{ name: fromName, line: firstLine, ground: false }, ...rev];
  const transfers = [];
  for (let i = 1; i < stops.length - 1; i++) {
    if (stops[i].line !== stops[i + 1].line) {
      transfers.push({ at: stops[i].name, from: stops[i].line, to: stops[i + 1].line });
    }
  }
  return { stops, transfers, hops: stops.length - 1 };
}

// ─────────────────────────────────────────────────────────────
// 버스 노선 (path: [lon, lat, 고가높이(km, 선택)])
// type: 'citytour' = 2층 오픈탑 시티투어버스, 'city' = 시내버스
// legs[i] = stops[i] → stops[i+1] 구간의 풍경 (biome, bridge=교량 이름)
// ─────────────────────────────────────────────────────────────
export const GWANGAN_BRIDGE = [
  [129.11, 35.1375, 0.0],
  [129.1135, 35.1392, 0.42],
  [129.1185, 35.1412, 0.42],
  [129.1235, 35.144, 0.42],
  [129.1285, 35.1478, 0.42],
  [129.1328, 35.1525, 0.42],
  [129.1358, 35.1585, 0.42],
  [129.1372, 35.1632, 0.0],
];

export const BUSAN_HARBOR_BRIDGE = [
  [129.07, 35.0935, 0.0],
  [129.074, 35.0965, 0.4],
  [129.0795, 35.1005, 0.4],
  [129.085, 35.1045, 0.4],
  [129.089, 35.108, 0.0],
];

export const BUS_ROUTES = [
  {
    id: 'red', name: '시티투어 레드라인', short: '레드라인', type: 'citytour', color: '#e53935',
    stops: ['tower', 'gwangalli', 'marine', 'haeundae'],
    legs: [
      { biome: 'city', bridge: '부산항대교' },
      { biome: 'coast', bridge: '광안대교' },
      { biome: 'coast' },
    ],
    path: [
      [129.0394, 35.1146], [129.05, 35.12], [129.062, 35.1265], [129.078, 35.1305],
      [129.092, 35.1335], [129.103, 35.135], ...GWANGAN_BRIDGE,
      [129.1392, 35.1668], [129.1425, 35.162], [129.1455, 35.1575], [129.1505, 35.1565],
      [129.156, 35.1598], [129.1604, 35.1602],
    ],
  },
  {
    id: 'blue', name: '시티투어 블루라인', short: '블루라인', type: 'citytour', color: '#1e88e5',
    stops: ['haeundae', 'yonggungsa', 'jukseong'],
    legs: [{ biome: 'coast' }, { biome: 'coast' }],
    path: [
      [129.1604, 35.1602], [129.171, 35.1605], [129.183, 35.1595], [129.193, 35.164],
      [129.2, 35.1785], [129.212, 35.1835], [129.2222, 35.1886], [129.227, 35.2],
      [129.2285, 35.215], [129.232, 35.2275], [129.2405, 35.236], [129.2465, 35.241],
    ],
  },
  {
    id: 'green', name: '시티투어 그린라인', short: '그린라인', type: 'citytour', color: '#43a047',
    stops: ['jagalchi', 'huinnyeoul', 'taejongdae', 'oryukdo', 'igidae'],
    legs: [
      { biome: 'coast' },
      { biome: 'coast' },
      { biome: 'coast', bridge: '부산항대교' },
      { biome: 'coast' },
    ],
    path: [
      [129.0305, 35.0972], [129.0362, 35.0952], [129.0395, 35.0915], [129.0425, 35.0845],
      [129.0445, 35.0788], [129.05, 35.071], [129.06, 35.064], [129.072, 35.0575],
      [129.0842, 35.0545], [129.0835, 35.064], [129.0785, 35.075], [129.0725, 35.0865],
      ...BUSAN_HARBOR_BRIDGE,
      [129.097, 35.11], [129.108, 35.1105], [129.118, 35.1065], [129.1235, 35.1018],
      [129.1215, 35.109], [129.1222, 35.1178],
    ],
  },
  {
    id: 'orange', name: '시티투어 오렌지라인', short: '오렌지라인', type: 'citytour', color: '#fb8c00',
    stops: ['tower', 'gamcheon', 'dadaepo', 'eulsukdo'],
    legs: [{ biome: 'city' }, { biome: 'coast' }, { biome: 'coast' }],
    path: [
      [129.0394, 35.1146], [129.0362, 35.1065], [129.033, 35.1005], [129.0255, 35.0995],
      [129.0185, 35.1005], [129.0112, 35.0978], [129.004, 35.09], [128.996, 35.079],
      [128.986, 35.066], [128.976, 35.054], [128.9668, 35.0482], [128.9625, 35.06],
      [128.9612, 35.08], [128.9655, 35.1], [128.9662, 35.1062], [128.9555, 35.1055],
      [128.9452, 35.1045],
    ],
  },
  {
    id: 'b1003', name: '급행버스 1003번', short: '1003번', type: 'city', color: '#d81b60',
    stops: ['haeundae', 'gwangalli', 'seomyeon', 'tower', 'jagalchi'],
    legs: [{ biome: 'coast' }, { biome: 'city' }, { biome: 'city' }, { biome: 'city' }],
    path: [
      [129.1604, 35.1602], [129.15, 35.163], [129.138, 35.1672], [129.126, 35.167],
      [129.1165, 35.165], [129.1172, 35.1575], [129.1186, 35.1545], [129.113, 35.1465],
      [129.1065, 35.14], [129.095, 35.1362], [129.08, 35.1362], [129.0672, 35.14],
      [129.0625, 35.15], [129.059, 35.1575], [129.0585, 35.148], [129.0575, 35.138],
      [129.05, 35.127], [129.0415, 35.1165], [129.037, 35.106], [129.0335, 35.1005],
      [129.0305, 35.0972],
    ],
  },
  {
    id: 'b80', name: '시내버스 80번', short: '80번', type: 'city', color: '#1565c0',
    stops: ['seomyeon', 'sajik', 'beomeosa'],
    legs: [{ biome: 'city' }, { biome: 'city' }],
    path: [
      [129.059, 35.1575], [129.0635, 35.166], [129.0712, 35.173], [129.079, 35.1835],
      [129.0735, 35.1885], [129.0635, 35.192], [129.0615, 35.1942], [129.0665, 35.2045],
      [129.0775, 35.2075], [129.0855, 35.22], [129.0885, 35.2305], [129.09, 35.2475],
      [129.0875, 35.266], [129.078, 35.2775], [129.0685, 35.2835],
    ],
  },
];

export const busRouteById = (id) => BUS_ROUTES.find((r) => r.id === id);

/**
 * 버스 여정 계획.
 * @param {string|null} fromId 현재 명소 (없으면 지도에서 출발)
 * @param {string} toId 목적지 명소
 * @returns {{route:object, stops:string[], legs:object[]}} stops[0]=승차, 마지막=목적지
 */
export function planBusTrip(fromId, toId) {
  const candidates = BUS_ROUTES.filter((r) => r.stops.includes(toId));
  let route = candidates.find((r) => fromId && r.stops.includes(fromId) && fromId !== toId);
  if (!route) route = candidates.find((r) => r.type === 'citytour') || candidates[0] || BUS_ROUTES[0];
  const ti = Math.max(0, route.stops.indexOf(toId));
  let fi = fromId ? route.stops.indexOf(fromId) : -1;
  if (fi < 0 || fi === ti) {
    // 노선 위에 출발지가 없으면 목적지에서 최대 2정거장 전(없으면 반대편)에서 승차
    fi = ti > 0 ? Math.max(0, ti - 2) : Math.min(route.stops.length - 1, 2);
  }
  const stops = [];
  const legs = [];
  const step = ti > fi ? 1 : -1;
  for (let i = fi; i !== ti + step; i += step) stops.push(route.stops[i]);
  for (let i = fi; i !== ti; i += step) legs.push(route.legs[step > 0 ? i : i - 1]);
  return { route, stops, legs };
}

/** 현재 명소에서 버스로 갈 "다음 명소" (노선 순서대로, 종점이면 되돌아옴) */
export function nextSpotByBus(spotId) {
  const routes = BUS_ROUTES.filter((r) => r.stops.includes(spotId));
  const route = routes.find((r) => r.type === 'citytour') || routes[0];
  if (!route) return SPOTS[0].id;
  const i = route.stops.indexOf(spotId);
  return i < route.stops.length - 1 ? route.stops[i + 1] : route.stops[i - 1];
}

/** 현재 명소에서 지하철로 갈 "다음 명소" (전체 투어 순서) */
export function nextSpotBySubway(spotId) {
  const i = SPOTS.findIndex((s) => s.id === spotId);
  return SPOTS[(i + 1 + SPOTS.length) % SPOTS.length].id;
}

// ─────────────────────────────────────────────────────────────
// 지형 데이터 (3D 지도용): 해안선 폴리곤 [lon, lat]
// ─────────────────────────────────────────────────────────────
export const LAND_POLYGONS = [
  // 부산 본토 (낙동강 동안 ~ 기장 해안)
  [
    [129.005, 35.33], [129.275, 35.33], [129.262, 35.3], [129.245, 35.27], [129.238, 35.258],
    [129.25, 35.243], [129.24, 35.228], [129.232, 35.205], [129.2262, 35.189], [129.214, 35.18],
    [129.202, 35.178], [129.205, 35.17], [129.195, 35.16], [129.182, 35.156], [129.172, 35.157],
    [129.16, 35.1572], [129.154, 35.155], [129.153, 35.152], [129.146, 35.153], [129.141, 35.156],
    [129.135, 35.164], [129.13, 35.156], [129.122, 35.153], [129.116, 35.151], [129.112, 35.145],
    [129.113, 35.136], [129.121, 35.132], [129.126, 35.122], [129.127, 35.108], [129.1265, 35.0995],
    [129.11, 35.098], [129.098, 35.1], [129.085, 35.108], [129.07, 35.115], [129.058, 35.122],
    [129.045, 35.115], [129.04, 35.103], [129.035, 35.097], [129.025, 35.092], [129.02, 35.078],
    [129.022, 35.063], [129.01, 35.066], [129.0, 35.075], [128.995, 35.06], [128.985, 35.052],
    [128.975, 35.047], [128.968, 35.037], [128.962, 35.046], [128.955, 35.052], [128.957, 35.08],
    [128.962, 35.11], [128.968, 35.15], [128.985, 35.2], [128.992, 35.24], [129.0, 35.28],
  ],
  // 강서구 (낙동강 서안)
  [
    [128.895, 35.33], [128.985, 35.33], [128.978, 35.28], [128.97, 35.24], [128.962, 35.2],
    [128.945, 35.15], [128.935, 35.11], [128.925, 35.085], [128.895, 35.08],
  ],
  // 을숙도
  [
    [128.94, 35.118], [128.948, 35.12], [128.952, 35.108], [128.95, 35.094], [128.944, 35.088],
    [128.939, 35.096], [128.938, 35.108],
  ],
  // 영도
  [
    [129.035, 35.093], [129.05, 35.097], [129.068, 35.092], [129.08, 35.08], [129.092, 35.06],
    [129.088, 35.05], [129.075, 35.053], [129.06, 35.062], [129.045, 35.075], [129.036, 35.085],
  ],
];

export const MOUNTAINS = [
  { name: '금정산', lon: 129.045, lat: 35.262, h: 801, r: 5.2 },
  { name: '백양산', lon: 129.02, lat: 35.185, h: 642, r: 3.4 },
  { name: '황령산', lon: 129.083, lat: 35.1575, h: 427, r: 2.2 },
  { name: '장산', lon: 129.146, lat: 35.197, h: 634, r: 3.4 },
  { name: '승학산', lon: 128.992, lat: 35.122, h: 497, r: 2.6 },
  { name: '엄광산', lon: 129.02, lat: 35.137, h: 504, r: 2.3 },
  { name: '봉래산', lon: 129.063, lat: 35.074, h: 395, r: 1.5 },
  { name: '달음산', lon: 129.21, lat: 35.305, h: 587, r: 3.2 },
  { name: '철마산', lon: 129.15, lat: 35.28, h: 605, r: 3.6 },
  { name: '아미산', lon: 128.972, lat: 35.066, h: 234, r: 1.2 },
  { name: '일광산', lon: 129.2, lat: 35.262, h: 317, r: 2.2 },
  { name: '구곡산', lon: 129.185, lat: 35.205, h: 434, r: 2.6 },
];

// 지도 위 건물 군집 (h: km 단위 과장 높이)
export const DISTRICTS = [
  { name: '서면', lon: 129.059, lat: 35.157, r: 1.2, n: 46, hMin: 0.25, hMax: 0.95 },
  { name: '마린시티', lon: 129.1445, lat: 35.1565, r: 0.45, n: 16, hMin: 1.0, hMax: 2.3 },
  { name: '센텀시티', lon: 129.13, lat: 35.1705, r: 0.8, n: 26, hMin: 0.4, hMax: 1.5 },
  { name: '해운대', lon: 129.162, lat: 35.1625, r: 0.8, n: 28, hMin: 0.4, hMax: 1.5 },
  { name: '남포·중앙', lon: 129.034, lat: 35.105, r: 0.7, n: 30, hMin: 0.2, hMax: 0.75 },
  { name: '동래', lon: 129.081, lat: 35.206, r: 1.1, n: 30, hMin: 0.2, hMax: 0.8 },
  { name: '연산', lon: 129.081, lat: 35.186, r: 0.9, n: 24, hMin: 0.2, hMax: 0.8 },
  { name: '사상', lon: 128.986, lat: 35.16, r: 1.1, n: 24, hMin: 0.15, hMax: 0.6 },
  { name: '하단', lon: 128.969, lat: 35.106, r: 0.7, n: 16, hMin: 0.15, hMax: 0.6 },
  { name: '광안', lon: 129.114, lat: 35.158, r: 0.7, n: 24, hMin: 0.25, hMax: 0.9 },
  { name: '대연', lon: 129.096, lat: 35.135, r: 0.9, n: 24, hMin: 0.2, hMax: 0.8 },
  { name: '화명', lon: 129.011, lat: 35.235, r: 0.9, n: 20, hMin: 0.3, hMax: 0.9 },
  { name: '기장', lon: 129.215, lat: 35.244, r: 0.9, n: 14, hMin: 0.15, hMax: 0.5 },
  { name: '명지', lon: 128.922, lat: 35.1, r: 1.0, n: 16, hMin: 0.2, hMax: 0.7 },
  { name: '영도', lon: 129.052, lat: 35.091, r: 0.6, n: 16, hMin: 0.15, hMax: 0.55 },
  { name: '다대', lon: 128.978, lat: 35.058, r: 0.7, n: 14, hMin: 0.2, hMax: 0.7 },
  { name: '덕천·구포', lon: 129.002, lat: 35.208, r: 0.7, n: 16, hMin: 0.2, hMax: 0.7 },
  { name: '부산대', lon: 129.088, lat: 35.231, r: 0.8, n: 16, hMin: 0.15, hMax: 0.6 },
  { name: '정관', lon: 129.178, lat: 35.32, r: 0.9, n: 12, hMin: 0.2, hMax: 0.7 },
  { name: '김해공항', lon: 128.94, lat: 35.18, r: 1.0, n: 8, hMin: 0.08, hMax: 0.2 },
];
