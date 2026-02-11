import { useState, useEffect, useCallback } from "react";

// ============================================================
// TintLab MVP v3 — 체육관·학원 전용 올인원 운영 SaaS
// 7 Modules: 상권분석 | 브랜드 | 마케팅 | 콘텐츠 | 행정 | 학원비 | 캘린더
// ============================================================

// --- CONFIG ---
const CONFIG = {
  GOOGLE_SHEET_URL: "YOUR_GOOGLE_APPS_SCRIPT_URL",
  KAKAO_API_KEY: "", // Kakao REST API Key (env: VITE_KAKAO_API_KEY)
  NAVER_CLIENT_ID: "", // Naver API (env: VITE_NAVER_CLIENT_ID)
};

// Try to load from env (Vite)
if (typeof import.meta !== "undefined" && import.meta.env) {
  CONFIG.KAKAO_API_KEY = import.meta.env.VITE_KAKAO_API_KEY || "";
  CONFIG.NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID || "";
  if (import.meta.env.VITE_SHEET_URL) CONFIG.GOOGLE_SHEET_URL = import.meta.env.VITE_SHEET_URL;
}

// ============================================================
// DATA: 12-Month Season DB for 체육관 & 학원
// ============================================================
const SEASON_DB = {
  "체육관": {
    "1월": { theme: "🎯 신년 신규회원 모집", tasks: ["신년 목표 이벤트 기획", "겨울방학 특강 마감 안내", "네이버플레이스 신년 사진 업데이트"], content: ["신년 인사 카드뉴스", "겨울방학 특강 성과 영상", "새해 다짐 릴스"], admin: ["연말정산 자료 발행", "4대보험 정산", "근로계약서 갱신"], urgency: "high" },
    "2월": { theme: "💪 봄맞이 다이어트 캠페인", tasks: ["봄 다이어트 프로그램 기획", "체험 수업 이벤트 준비", "승급심사 일정 공지"], content: ["비포/애프터 카드뉴스", "체험 수업 안내 릴스", "봄 운동 팁 블로그"], admin: ["사업장현황신고 (2/10)", "면세사업자 수입금액 신고"], urgency: "high" },
    "3월": { theme: "🏆 승급심사 시즌", tasks: ["승급심사 홍보 콘텐츠 제작", "신학기 신규 모집 집중", "학부모 참관 수업 안내"], content: ["승급심사 준비 과정 영상", "신학기 등록 안내 카드뉴스", "수련생 인터뷰 블로그"], admin: ["1분기 교습비 게시 확인", "체육시설 안전점검"], urgency: "high" },
    "4월": { theme: "🌸 봄 체험 이벤트", tasks: ["봄나들이 체험 행사", "기존 회원 추천 이벤트", "네이버 리뷰 캠페인"], content: ["봄 야외 수련 사진", "회원 추천 이벤트 안내", "운동 효과 인포그래픽"], admin: ["건강보험 정산", "보험 갱신 확인"], urgency: "mid" },
    "5월": { theme: "👨‍👩‍👧‍👦 가정의달 가족 프로그램", tasks: ["가족 합동 수업 기획", "어버이날 이벤트", "학부모 참관 수업"], content: ["가족 수업 사진/영상", "어버이날 감사 카드뉴스", "아이 성장 스토리 블로그"], admin: ["근로자의날 휴무 안내", "종합소득세 준비 (5/31)"], urgency: "mid" },
    "6월": { theme: "☀️ 여름방학 특강 사전홍보", tasks: ["여름방학 캠프/특강 기획", "사전등록 할인 이벤트", "SNS 집중 홍보"], content: ["여름캠프 안내 카드뉴스", "작년 캠프 하이라이트 영상", "여름방학 일정 안내문"], admin: ["상반기 안전교육 실시", "냉방기기 점검"], urgency: "high" },
    "7월": { theme: "🏕️ 여름방학 집중반", tasks: ["여름캠프 운영", "집중 수련 프로그램", "2학기 사전등록 안내"], content: ["캠프 현장 릴스", "수련 과정 타임랩스", "학부모 후기 카드뉴스"], admin: ["부가세 확정신고 (7/25)", "냉방비 관리"], urgency: "high" },
    "8월": { theme: "📚 2학기 신규 등록", tasks: ["2학기 등록 캠페인", "승급심사 준비", "체험 수업 확대"], content: ["2학기 프로그램 소개", "회원 성장 비포/애프터", "시설 안내 영상"], admin: ["2학기 보험 갱신", "시설 정비"], urgency: "high" },
    "9월": { theme: "🍂 가을 시즌 이벤트", tasks: ["가을 체험 행사", "대회 참가 안내", "추석 연휴 안내"], content: ["대회 준비 과정 영상", "추석 인사 카드뉴스", "가을 운동 팁 블로그"], admin: ["추석 연휴 일정 공지", "체육시설 안전점검"], urgency: "mid" },
    "10월": { theme: "🥋 승급심사·대회 시즌", tasks: ["승급심사 집중 홍보", "지역 대회 참가", "학부모 초청 시연"], content: ["심사 준비 릴스", "대회 참가 하이라이트", "수련생 성장 스토리"], admin: ["4분기 교습비 게시 확인", "연말 행사 예산 편성"], urgency: "high" },
    "11월": { theme: "🎁 연말 이벤트 준비", tasks: ["신년 사전등록 할인", "연말 시연회/발표회 기획", "감사 이벤트"], content: ["연말 행사 사전 안내", "1년 성장 하이라이트 영상", "감사 메시지 카드뉴스"], admin: ["연말정산 준비", "퇴직금 정산 확인"], urgency: "mid" },
    "12월": { theme: "🎄 연말행사 + 신년 사전등록", tasks: ["시연회/승급심사 개최", "신년 등록 조기할인", "우수 수련생 시상"], content: ["연말 행사 하이라이트", "수료증 수여 사진", "신년 등록 안내 카드뉴스"], admin: ["연말정산 마무리", "다음해 사업계획서 작성"], urgency: "high" },
  },
  "학원": {
    "1월": { theme: "🎯 겨울방학 특강 + 신학기 사전등록", tasks: ["겨울방학 특강 마무리", "신학기 사전등록 캠페인", "학부모 상담 주간 운영"], content: ["겨울방학 성과 리포트", "신학기 커리큘럼 안내", "학부모 후기 카드뉴스"], admin: ["연말정산 자료 발행", "4대보험 정산"], urgency: "high" },
    "2월": { theme: "📝 신학기 원생 모집 집중", tasks: ["신학기 등록 마감 캠페인", "레벨테스트 운영", "학부모 설명회 개최"], content: ["레벨테스트 안내 카드뉴스", "강사 소개 영상", "학습법 팁 블로그"], admin: ["사업장현황신고 (2/10)", "교습비 변경 신고"], urgency: "high" },
    "3월": { theme: "📚 신학기 적응 프로그램", tasks: ["신규 원생 적응 관리", "첫 학부모 상담", "학습 계획 수립"], content: ["첫 수업 현장 릴스", "학습 플래너 소개", "신학기 적응 팁 블로그"], admin: ["1분기 교습비 게시 확인", "학원 행정 변경 신고"], urgency: "mid" },
    "4월": { theme: "📊 중간고사 대비 특강", tasks: ["중간고사 특강 개설", "학습 성과 중간 점검", "학부모 상담"], content: ["중간고사 대비 포인트 카드뉴스", "학습법 영상", "성적향상 사례 블로그"], admin: ["건강보험 정산", "보험 갱신"], urgency: "mid" },
    "5월": { theme: "👨‍👩‍👧‍👦 학부모 소통 강화", tasks: ["학부모 공개수업", "어버이날 이벤트", "여름방학 사전 안내"], content: ["어버이날 감사 카드", "공개수업 현장 영상", "학부모 참여 후기"], admin: ["종합소득세 신고 (5/31)", "근로자의날 휴무"], urgency: "mid" },
    "6월": { theme: "☀️ 기말 + 여름방학 특강 홍보", tasks: ["기말고사 특강", "여름방학 프로그램 사전등록", "학습 성과 보고서 발송"], content: ["기말 대비 카드뉴스", "여름특강 안내문", "상반기 성과 리포트"], admin: ["상반기 결산", "여름방학 시간표 변경 신고"], urgency: "high" },
    "7월": { theme: "🏖️ 여름방학 집중반", tasks: ["여름방학 집중 프로그램 운영", "보충/선행 수업", "2학기 사전등록"], content: ["집중반 수업 현장 릴스", "학습 챌린지 인스타", "여름방학 활용법 블로그"], admin: ["부가세 확정신고 (7/25)", "냉방비 관리"], urgency: "high" },
    "8월": { theme: "📚 2학기 신규 등록", tasks: ["2학기 등록 마감 캠페인", "레벨테스트 재운영", "학부모 설명회"], content: ["2학기 커리큘럼 안내", "강사진 소개 업데이트", "등록 혜택 카드뉴스"], admin: ["2학기 시간표 확정", "강사 계약 갱신"], urgency: "high" },
    "9월": { theme: "📝 2학기 안정화", tasks: ["신규 원생 적응 관리", "추석 연휴 보강 일정", "학부모 상담"], content: ["추석 인사 카드뉴스", "2학기 학습 계획 안내", "학생 성장 스토리"], admin: ["추석 연휴 일정 공지", "하반기 안전교육"], urgency: "mid" },
    "10월": { theme: "📊 기말 대비 + 겨울방학 안내", tasks: ["기말고사 특강 준비", "겨울방학 프로그램 기획", "학습 성과 분석"], content: ["기말 대비 학습법 영상", "겨울방학 사전 안내", "성적향상 TOP5 카드뉴스"], admin: ["4분기 교습비 게시 확인", "연말 예산 편성"], urgency: "mid" },
    "11월": { theme: "❄️ 겨울방학 특강 사전등록", tasks: ["겨울방학 특강 등록 오픈", "기말고사 특강 운영", "학부모 감사 이벤트"], content: ["겨울방학 특강 안내", "기말 응원 카드뉴스", "1년 성과 하이라이트"], admin: ["연말정산 준비", "퇴직금 정산 확인"], urgency: "high" },
    "12월": { theme: "🎄 연말 + 신년 사전등록", tasks: ["겨울방학 특강 시작", "신년 사전등록 할인", "수료식/발표회"], content: ["수료식 현장 영상", "신년 등록 안내", "학생 성장 리포트"], admin: ["연말정산 마무리", "다음해 운영계획 수립"], urgency: "high" },
  }
};

// --- SNS Channel Guide ---
const CHANNELS = {
  "네이버플레이스": { icon: "📍", purpose: "검색 노출 + 신뢰도 (가장 중요)", freq: "주 1~2회 업데이트", tips: ["사진 20장 이상 유지", "소식 탭 주 1회 업데이트", "리뷰 답글 24시간 내 작성", "영업시간·메뉴 정보 항상 최신 유지"] },
  "네이버블로그": { icon: "📝", purpose: "SEO 검색 유입 + 정보 전달", freq: "주 1~2회 포스팅", tips: ["'[지역명]+[업종]+추천' 키워드 필수 포함", "본문 1,500자 이상 + 사진 5장 이상", "체험 후기·성과 사례 중심", "네이버플레이스 링크 항상 삽입"] },
  "인스타그램": { icon: "📸", purpose: "비주얼 브랜딩 + 신규 유입", freq: "주 3~5회", tips: ["수업 현장 사진/릴스가 최고 효과", "카드뉴스로 정보 전달", "스토리로 일상 공유 (친근감)", "해시태그 15~20개 세트 준비"] },
  "유튜브/쇼츠": { icon: "🎬", purpose: "영상 브랜딩 + 신뢰도 구축", freq: "주 1~2회", tips: ["30초~1분 숏폼 위주 (촬영 부담↓)", "수업 현장, 원장 팁, 학생 인터뷰", "썸네일이 클릭률의 80%", "꾸준함이 핵심 (주 1회라도 유지)"] },
  "릴스/쇼츠": { icon: "🎞️", purpose: "바이럴 + 신규 노출 확대", freq: "주 2~3회", tips: ["트렌드 음악 + 수업 현장 조합", "15~30초가 최적 길이", "자막 필수 (음소거 시청 대비)", "첫 1초에 시선 잡는 장면"] },
  "틱톡": { icon: "🎵", purpose: "MZ세대 학부모 접근", freq: "주 2~3회", tips: ["챌린지 참여가 노출 극대화", "학생들 참여 콘텐츠 효과적", "가벼운 톤, 재미 요소 중요", "편집 없이 촬영만으로도 OK"] },
  "스레드": { icon: "🧵", purpose: "텍스트 기반 소통 + 커뮤니티", freq: "주 3~5회", tips: ["운영 노하우·교육 철학 공유", "학부모 공감 글이 효과적", "짧고 솔직한 글이 반응 좋음", "인스타 연동으로 시너지"] },
  "네이버밴드": { icon: "🟢", purpose: "기존 학부모 소통 + 입소문 허브", freq: "주 2~3회", tips: ["수업 사진·영상 정기 공유", "공지사항 + 가정통신문 발송", "학부모 참여 이벤트 운영", "밴드 내 소개 요청이 입소문 핵심"] },
  "카카오톡채널": { icon: "💬", purpose: "1:1 소통 + 재등록 유도", freq: "월 2~4회 메시지", tips: ["시즌 안내 + 이벤트 알림 발송", "생일/기념일 자동 메시지", "상담 예약 링크 활용", "너무 잦은 발송은 역효과 (월 4회 이하)"] },
};

// --- Admin Templates DB ---
const ADMIN_TEMPLATES = {
  "근로계약서": { category: "근로·노무", icon: "📄", fields: ["상호명", "대표자", "사업자번호", "주소"], desc: "강사·직원용 표준 근로계약서 (학원업 특화)", monthly: [1, 3, 9] },
  "급여명세서": { category: "근로·노무", icon: "💰", fields: ["상호명", "대표자"], desc: "월급여 명세서 (주휴수당·4대보험 반영)", monthly: [1,2,3,4,5,6,7,8,9,10,11,12] },
  "교육비일할계산표": { category: "교육비", icon: "🧮", fields: ["상호명", "교습과목", "교습비"], desc: "중도 입학/퇴원 시 일할 자동계산", monthly: [1,2,3,4,5,6,7,8,9,10,11,12] },
  "환불안내문": { category: "교육비", icon: "💸", fields: ["상호명", "대표자"], desc: "학원법 제18조 기준 환불 규정 안내문", monthly: [1,2,3,4,5,6,7,8,9,10,11,12] },
  "교습비게시양식": { category: "교육비", icon: "📋", fields: ["상호명", "교습과목", "교습비"], desc: "학원 내 교습비 게시 의무 양식 (분기별)", monthly: [1, 4, 7, 10] },
  "가정통신문": { category: "소통", icon: "📮", fields: ["상호명", "로고", "대표자"], desc: "월별 안내사항 + 행사 일정 (자동 생성)", monthly: [1,2,3,4,5,6,7,8,9,10,11,12] },
  "수료증": { category: "소통", icon: "🏅", fields: ["상호명", "로고", "대표자"], desc: "수료증/상장 (학생 이름 자동 입력)", monthly: [2, 7, 12] },
  "연간운영계획서": { category: "운영", icon: "📊", fields: ["상호명", "대표자", "연도"], desc: "12개월 교육·행사·마케팅 통합 계획서", monthly: [1, 12] },
  "월간교육계획안": { category: "운영", icon: "📅", fields: ["상호명", "로고"], desc: "월별 수업 계획 + 행사 일정표", monthly: [1,2,3,4,5,6,7,8,9,10,11,12] },
  "안전관리체크리스트": { category: "안전", icon: "🔒", fields: ["상호명", "주소"], desc: "시설 안전점검 체크리스트 (체육시설 의무)", monthly: [3, 6, 9, 12] },
  "비상연락망": { category: "안전", icon: "📞", fields: ["상호명", "주소", "대표자"], desc: "비상 연락처 목록 (소방서·병원·교육청)", monthly: [3] },
  "부가세신고체크리스트": { category: "세무", icon: "🧾", fields: ["상호명", "사업자번호"], desc: "부가가치세 신고 준비 체크리스트", monthly: [1, 7] },
  "종합소득세안내": { category: "세무", icon: "📑", fields: ["상호명", "사업자번호"], desc: "종합소득세 신고 안내 + 준비 서류", monthly: [5] },
};

// --- Color Palettes ---
const PALETTES = [
  { name: "활동적·에너지", colors: ["#E53E3E", "#FF6B35", "#FFD93D", "#F7F7F7"], desc: "태권도·합기도·체육관에 적합" },
  { name: "따뜻한·친근한", colors: ["#F6AD55", "#FC8181", "#FBD38D", "#FFFAF0"], desc: "어린이 학원·유아 체육에 적합" },
  { name: "신뢰·지적인", colors: ["#3182CE", "#2B6CB0", "#63B3ED", "#EBF8FF"], desc: "보습학원·국어·수학 학원에 적합" },
  { name: "자연·건강한", colors: ["#38A169", "#68D391", "#C6F6D5", "#F0FFF4"], desc: "요가·필라테스·건강 체육에 적합" },
  { name: "세련·모던", colors: ["#2D3748", "#4A5568", "#A0AEC0", "#F7FAFC"], desc: "성인 피트니스·프리미엄 학원에 적합" },
  { name: "창의·감성", colors: ["#805AD5", "#B794F4", "#E9D8FD", "#FAF5FF"], desc: "미술·음악·예체능 학원에 적합" },
];

const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const NOW_MONTH = MONTHS[new Date().getMonth()];

// ============================================================
// API Functions
// ============================================================
async function searchKakaoLocal(query, lat, lng) {
  if (!CONFIG.KAKAO_API_KEY) return null;
  try {
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&x=${lng}&y=${lat}&radius=1000&size=15`;
    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${CONFIG.KAKAO_API_KEY}` } });
    return await res.json();
  } catch { return null; }
}

async function geocodeAddress(address) {
  if (!CONFIG.KAKAO_API_KEY) return null;
  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${CONFIG.KAKAO_API_KEY}` } });
    return await res.json();
  } catch { return null; }
}

async function checkBizStatus(bizNo) {
  // 국세청 사업자 상태조회 API (실제 사용시 서버사이드에서 호출)
  // MVP에서는 형식 검증만 수행
  const clean = bizNo.replace(/[^0-9]/g, "");
  if (clean.length !== 10) return { valid: false, message: "사업자등록번호 10자리를 입력하세요" };
  // 사업자번호 검증 알고리즘
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * weights[i];
  sum += Math.floor((parseInt(clean[8]) * 5) / 10);
  const check = (10 - (sum % 10)) % 10;
  if (check === parseInt(clean[9])) return { valid: true, message: "유효한 사업자등록번호입니다" };
  return { valid: false, message: "사업자등록번호를 다시 확인하세요" };
}

async function saveToSheet(data) {
  if (CONFIG.GOOGLE_SHEET_URL.includes("YOUR_")) return;
  try {
    await fetch(CONFIG.GOOGLE_SHEET_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp: new Date().toISOString(), ...data })
    });
  } catch (e) { console.log("Sheet save:", e); }
}

// ============================================================
// Utility Functions
// ============================================================
function formatNum(n) { return n.toLocaleString("ko-KR"); }
function formatBizNo(v) {
  const n = v.replace(/[^0-9]/g, "").slice(0, 10);
  if (n.length <= 3) return n;
  if (n.length <= 5) return n.slice(0, 3) + "-" + n.slice(3);
  return n.slice(0, 3) + "-" + n.slice(3, 5) + "-" + n.slice(5);
}

// ============================================================
// STYLES
// ============================================================
const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Noto Sans KR',-apple-system,sans-serif" },
  container: { maxWidth: 800, margin: "0 auto", padding: "0 16px 100px" },
  card: { background: "white", borderRadius: 14, padding: "20px 22px", marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #E2E8F0" },
  label: { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #D1D5DB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" },
  btn: { padding: "12px 24px", background: "#0B3D91", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" },
  btnSm: { padding: "7px 16px", background: "#0B3D91", color: "white", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  tag: { padding: "4px 10px", background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 16, fontSize: 10, fontWeight: 500, display: "inline-block" },
  h2: { fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 12 },
  h3: { fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 8, marginTop: 16 },
  muted: { fontSize: 11, color: "#94A3B8" },
};

// ============================================================
// COMPONENTS
// ============================================================

// --- Header ---
function Header({ biz, onReset, activeTab, setActiveTab }) {
  const tabs = [
    { id: "home", label: "홈", icon: "🏠" },
    { id: "analysis", label: "상권분석", icon: "🏪" },
    { id: "brand", label: "브랜드", icon: "🎨" },
    { id: "marketing", label: "마케팅", icon: "📊" },
    { id: "content", label: "콘텐츠", icon: "📝" },
    { id: "admin", label: "행정·세무", icon: "📋" },
    { id: "fee", label: "학원비", icon: "💰" },
    { id: "calendar", label: "캘린더", icon: "📅" },
  ];
  return (
    <div style={{ background: "white", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: biz?.palette?.[0] || "#0B3D91", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 15, fontWeight: 900 }}>T</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0B3D91" }}>{biz?.name || "틴트랩"}</div>
            {biz?.name && <div style={{ fontSize: 9, color: "#94A3B8" }}>{biz.industry} · {biz.location}</div>}
          </div>
        </div>
        <button onClick={onReset} style={{ fontSize: 10, color: "#94A3B8", background: "none", border: "1px solid #E2E8F0", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>초기화</button>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", overflowX: "auto", gap: 0, padding: "0 8px", WebkitOverflowScrolling: "touch" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
            borderBottom: activeTab === t.id ? `3px solid ${biz?.palette?.[0] || "#0B3D91"}` : "3px solid transparent",
            color: activeTab === t.id ? (biz?.palette?.[0] || "#0B3D91") : "#94A3B8",
            fontSize: 11, fontWeight: activeTab === t.id ? 700 : 400,
          }}>{t.icon} {t.label}</button>
        ))}
      </div>
    </div>
  );
}

// --- Onboarding ---
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [biz, setBiz] = useState({ industry: "체육관", bizType: "개인", certs: [], palette: PALETTES[0].colors });
  const [bizCheck, setBizCheck] = useState(null);

  const handleBizNo = async (v) => {
    const formatted = formatBizNo(v);
    setBiz(p => ({ ...p, bizNo: formatted }));
    if (formatted.replace(/[^0-9]/g, "").length === 10) {
      const result = await checkBizStatus(formatted);
      setBizCheck(result);
    } else { setBizCheck(null); }
  };

  if (step === 0) return (
    <div style={{ ...S.container, paddingTop: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0B3D91", marginBottom: 6 }}>틴트랩에 오신 것을 환영합니다</h1>
        <p style={{ fontSize: 13, color: "#64748B" }}>사업장 정보를 입력하면 맞춤형 운영 도구가 세팅됩니다</p>
      </div>
      <div style={S.card}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={S.label}>사업자등록번호</label>
            <input value={biz.bizNo || ""} onChange={e => handleBizNo(e.target.value)} placeholder="000-00-00000" style={S.input} />
            {bizCheck && <div style={{ fontSize: 11, marginTop: 4, color: bizCheck.valid ? "#059669" : "#DC2626" }}>{bizCheck.valid ? "✅" : "❌"} {bizCheck.message}</div>}
          </div>
          <div>
            <label style={S.label}>상호명 *</label>
            <input value={biz.name || ""} onChange={e => setBiz(p => ({...p, name: e.target.value}))} placeholder="예: 강서비룡태권도" style={S.input} />
          </div>
          <div>
            <label style={S.label}>대표자명 *</label>
            <input value={biz.owner || ""} onChange={e => setBiz(p => ({...p, owner: e.target.value}))} placeholder="예: 홍길동" style={S.input} />
          </div>
          <div>
            <label style={S.label}>업종 *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {["체육관", "학원"].map(ind => (
                <button key={ind} onClick={() => setBiz(p => ({...p, industry: ind}))} style={{
                  padding: "14px", border: biz.industry === ind ? "2px solid #0B3D91" : "1.5px solid #E2E8F0",
                  borderRadius: 10, background: biz.industry === ind ? "#EFF6FF" : "white",
                  fontSize: 14, fontWeight: biz.industry === ind ? 700 : 400, cursor: "pointer"
                }}>{ind === "체육관" ? "🥋 체육관 (태권도·합기도·검도 등)" : "📚 학원 (국어·수학·영어·예체능)"}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={S.label}>세부 업종</label>
            <input value={biz.subIndustry || ""} onChange={e => setBiz(p => ({...p, subIndustry: e.target.value}))} placeholder="예: 태권도, 국어, 수학, 피아노" style={S.input} />
          </div>
          <div>
            <label style={S.label}>소재지 (동 단위) *</label>
            <input value={biz.location || ""} onChange={e => setBiz(p => ({...p, location: e.target.value}))} placeholder="예: 서울시 강서구 내발산동" style={S.input} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={S.label}>사업 업력 (년)</label>
              <input type="number" value={biz.bizYears || ""} onChange={e => setBiz(p => ({...p, bizYears: parseInt(e.target.value) || 0}))} style={S.input} />
            </div>
            <div>
              <label style={S.label}>현재 원생 수 (명)</label>
              <input type="number" value={biz.studentCount || ""} onChange={e => setBiz(p => ({...p, studentCount: parseInt(e.target.value) || 0}))} style={S.input} />
            </div>
          </div>
          <div>
            <label style={S.label}>교습비 (월)</label>
            <input type="number" value={biz.monthlyFee || ""} onChange={e => setBiz(p => ({...p, monthlyFee: parseInt(e.target.value) || 0}))} placeholder="예: 150000" style={S.input} />
          </div>
        </div>
        <button onClick={() => biz.name && biz.location && setStep(1)} disabled={!biz.name || !biz.location} style={{ ...S.btn, marginTop: 20, opacity: biz.name && biz.location ? 1 : 0.4 }}>
          다음 → 브랜드 컬러 선택
        </button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div style={{ ...S.container, paddingTop: 24 }}>
      <h2 style={S.h2}>🎨 우리 {biz.industry}의 마케팅 컬러를 선택하세요</h2>
      <p style={{ fontSize: 12, color: "#64748B", marginBottom: 16 }}>선택한 컬러가 모든 문서·콘텐츠·굿즈에 자동 적용됩니다.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PALETTES.map((p, i) => (
          <button key={i} onClick={() => setBiz(prev => ({...prev, palette: p.colors, paletteName: p.name}))} style={{
            ...S.card, marginBottom: 0, cursor: "pointer", textAlign: "left",
            border: JSON.stringify(biz.palette) === JSON.stringify(p.colors) ? "2.5px solid #0B3D91" : "1.5px solid #E2E8F0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {p.colors.map((c, j) => <div key={j} style={{ width: 28, height: 28, borderRadius: 6, background: c, border: "1px solid #E2E8F0" }} />)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{p.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ ...S.card, marginTop: 16 }}>
        <label style={S.label}>직접 메인 컬러 선택</label>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="color" value={biz.palette?.[0] || "#0B3D91"} onChange={e => {
            const main = e.target.value;
            setBiz(p => ({...p, palette: [main, main+"99", main+"44", "#F8FAFC"], paletteName: "커스텀"}));
          }} style={{ width: 48, height: 48, border: "none", cursor: "pointer", borderRadius: 8 }} />
          <span style={{ fontSize: 12, color: "#64748B" }}>원하는 색을 직접 선택할 수 있습니다</span>
        </div>
      </div>
      {/* Preview */}
      <div style={{ ...S.card, marginTop: 12, background: biz.palette[3] || "#F8FAFC" }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10, color: "#64748B" }}>미리보기</div>
        <div style={{ background: biz.palette[0], color: "white", borderRadius: 10, padding: "16px 20px", marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{biz.name || "우리 학원"}</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>{biz.subIndustry || biz.industry} · {biz.location}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1, background: biz.palette[1], borderRadius: 8, padding: "10px", textAlign: "center", fontSize: 11, color: "white", fontWeight: 600 }}>버튼</div>
          <div style={{ flex: 1, background: biz.palette[2], borderRadius: 8, padding: "10px", textAlign: "center", fontSize: 11, color: "#334155", fontWeight: 600 }}>배경</div>
        </div>
      </div>
      <button onClick={() => { onComplete(biz); saveToSheet({ type: "onboarding", ...biz, palette: biz.palette.join(",") }); }} style={{ ...S.btn, marginTop: 16 }}>
        ✅ 설정 완료 — 대시보드로 이동
      </button>
    </div>
  );
}

// --- Dashboard (Home) ---
function HomeTab({ biz }) {
  const season = SEASON_DB[biz.industry]?.[NOW_MONTH] || {};
  const thisMonthTemplates = Object.entries(ADMIN_TEMPLATES).filter(([_, t]) => t.monthly.includes(new Date().getMonth() + 1));

  return (
    <div>
      {/* Welcome Card */}
      <div style={{ background: `linear-gradient(135deg, ${biz.palette[0]}, ${biz.palette[1] || biz.palette[0]})`, borderRadius: 16, padding: "24px", color: "white", marginBottom: 16 }}>
        <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>👋 {biz.owner || "원장"}님, 좋은 하루입니다!</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: "6px 0" }}>{NOW_MONTH} 핵심: {season.theme}</h2>
        <div style={{ fontSize: 12, opacity: 0.85 }}>{biz.name} · {biz.industry} · 원생 {biz.studentCount || "?"}명</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
          {[
            { label: "이달 마케팅", value: season.urgency === "high" ? "🔴 최우선" : "🟡 중요" },
            { label: "실행할 일", value: `${(season.tasks||[]).length}건` },
            { label: "필요 문서", value: `${thisMonthTemplates.length}종` },
          ].map((item, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: 9, opacity: 0.7 }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* This Month Tasks */}
      <div style={S.card}>
        <h3 style={S.h2}>📋 {NOW_MONTH} 할 일</h3>
        {(season.tasks || []).map((t, i) => (
          <TaskItem key={i} text={t} />
        ))}
        <div style={{ ...S.h3, color: "#DC2626" }}>⚠️ 행정 체크</div>
        {(season.admin || []).map((t, i) => (
          <TaskItem key={i} text={t} isAdmin />
        ))}
      </div>

      {/* Quick Stats */}
      <div style={S.card}>
        <h3 style={S.h2}>📊 이달 추천 콘텐츠</h3>
        {(season.content || []).map((c, i) => (
          <div key={i} style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: 8, marginBottom: 6, fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{c}</span>
            <span style={{ ...S.tag, background: biz.palette[2] || "#EFF6FF", borderColor: biz.palette[0], color: biz.palette[0] }}>만들기</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskItem({ text, isAdmin }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={() => setDone(!done)} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", width: "100%", textAlign: "left",
      border: done ? "1.5px solid #059669" : "1.5px solid #E2E8F0", borderRadius: 8, background: done ? "#F0FDF4" : "white",
      cursor: "pointer", marginBottom: 5,
    }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
        border: done ? "none" : "2px solid #D1D5DB", background: done ? "#059669" : "white", color: "white", fontSize: 12, fontWeight: 700, flexShrink: 0
      }}>{done ? "✓" : ""}</div>
      <span style={{ fontSize: 12, color: isAdmin ? "#B91C1C" : "#374151", textDecoration: done ? "line-through" : "none" }}>{text}</span>
    </button>
  );
}

// --- Module 1: 상권분석 ---
function AnalysisTab({ biz }) {
  const [loading, setLoading] = useState(false);
  const [competitors, setCompetitors] = useState(null);
  const [schools, setSchools] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    // Try Kakao Local API
    const geo = await geocodeAddress(biz.location);
    if (geo?.documents?.[0]) {
      const { x: lng, y: lat } = geo.documents[0];
      const keyword = biz.industry === "체육관" ? "태권도" : "학원";
      const result = await searchKakaoLocal(keyword, lat, lng);
      if (result?.documents) setCompetitors(result.documents);
      const schoolResult = await searchKakaoLocal("초등학교", lat, lng);
      if (schoolResult?.documents) setSchools(schoolResult.documents);
    }
    // Simulate if no API key
    if (!CONFIG.KAKAO_API_KEY) {
      await new Promise(r => setTimeout(r, 1500));
      setCompetitors(generateMockCompetitors(biz));
      setSchools(generateMockSchools(biz));
    }
    setLoading(false);
    saveToSheet({ type: "analysis", name: biz.name, location: biz.location, industry: biz.industry });
  };

  return (
    <div>
      <div style={S.card}>
        <h2 style={S.h2}>🏪 상권분석 리포트</h2>
        <p style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>{biz.location} 기반 {biz.industry} 상권을 분석합니다.</p>
        {!competitors ? (
          <button onClick={runAnalysis} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.6 : 1 }}>
            {loading ? "⏳ 분석 중..." : "🔍 상권분석 시작"}
          </button>
        ) : (
          <>
            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              <StatCard label="반경 1km 경쟁업체" value={`${competitors.length}개`} color="#DC2626" />
              <StatCard label="주변 학교" value={`${(schools||[]).length}개`} color="#2563EB" />
              <StatCard label="경쟁 강도" value={competitors.length > 10 ? "높음" : competitors.length > 5 ? "보통" : "낮음"} color={competitors.length > 10 ? "#DC2626" : "#059669"} />
            </div>

            {/* Competitor List */}
            <h3 style={S.h3}>🏬 반경 1km 내 경쟁업체</h3>
            {competitors.slice(0, 8).map((c, i) => (
              <div key={i} style={{ padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: 8, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.place_name || c.name}</div>
                  <div style={{ fontSize: 10, color: "#94A3B8" }}>{c.road_address_name || c.address} · {c.distance ? `${c.distance}m` : ""}</div>
                </div>
                {c.phone && <div style={{ fontSize: 10, color: "#64748B" }}>{c.phone}</div>}
              </div>
            ))}

            {/* Schools */}
            {schools && schools.length > 0 && (
              <>
                <h3 style={S.h3}>🏫 주변 학교 (타겟 학부모 분포)</h3>
                {schools.slice(0, 5).map((s, i) => (
                  <div key={i} style={{ padding: "8px 14px", background: "#F8FAFC", borderRadius: 8, marginBottom: 4, fontSize: 12 }}>
                    📍 {s.place_name || s.name} — {s.road_address_name || s.address}
                  </div>
                ))}
              </>
            )}

            {/* Persona */}
            <div style={{ ...S.card, marginTop: 16, background: "#EFF6FF", border: "1.5px solid #BFDBFE" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E40AF", marginBottom: 8 }}>👤 추천 타겟 페르소나</h3>
              <div style={{ fontSize: 12, lineHeight: 1.8, color: "#1E3A5F" }}>
                <strong>1차 타겟:</strong> {biz.location.split(" ").pop()} 거주, {biz.industry === "체육관" ? "7~13세 자녀를 둔 학부모" : "초등~중등 자녀를 둔 학부모"}<br/>
                <strong>핵심 니즈:</strong> {biz.industry === "체육관" ? "체력 향상, 인성 교육, 안전한 방과후 활동" : "성적 향상, 학습 습관 형성, 입시 준비"}<br/>
                <strong>정보 탐색 채널:</strong> 네이버 검색, 맘카페, 학부모 밴드, 지인 소개<br/>
                <strong>의사결정 요인:</strong> {biz.industry === "체육관" ? "① 관장 경력 ② 시설 안전 ③ 아이 반응 ④ 거리 ⑤ 비용" : "① 강사 실력 ② 성적 향상 사례 ③ 커리큘럼 ④ 거리 ⑤ 비용"}
              </div>
            </div>

            {/* API Info */}
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, fontSize: 10, color: "#92400E" }}>
              💡 {CONFIG.KAKAO_API_KEY ? "실제 Kakao Local API 데이터입니다." : "데모 데이터입니다. Kakao API 키를 설정하면 실제 상권 데이터로 분석됩니다."} 
              소상공인 상권정보 API, 행정안전부 인구통계 API는 Phase 2에서 연동 예정입니다.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px", textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#94A3B8" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function generateMockCompetitors(biz) {
  const names = biz.industry === "체육관"
    ? ["대한태권도", "정도관 태권도", "해동검도 도장", "합기도 수련관", "킥복싱 체육관", "MMA 피트니스", "국기원 태권도", "무예 합기도"]
    : ["수학의 달인", "눈높이 학원", "대치국어학원", "수학 전문학원", "스카이 영어", "아이캔 수학", "우등생 국어", "빅클래스 영어"];
  return names.map((name, i) => ({
    name, place_name: name,
    address: `${biz.location} ${100 + i * 50}번지`,
    road_address_name: `${biz.location} ${["대로","길","로"][i%3]} ${10+i}`,
    distance: 150 + Math.floor(Math.random() * 800),
    phone: `02-${String(2000+Math.floor(Math.random()*8000)).padStart(4,"0")}-${String(Math.floor(Math.random()*10000)).padStart(4,"0")}`
  }));
}

function generateMockSchools(biz) {
  const dong = biz.location.split(" ").pop() || "";
  return ["가람초등학교","나래초등학교","다솜중학교","바른초등학교","하늘중학교"].map((name, i) => ({
    name, place_name: name, address: `${biz.location} 학교길 ${i+1}`,
    road_address_name: `${biz.location} 학교로 ${10+i*5}`, distance: 200 + i * 180
  }));
}

// --- Module 2: 브랜드 스튜디오 ---
function BrandTab({ biz, setBiz }) {
  return (
    <div>
      <div style={S.card}>
        <h2 style={S.h2}>🎨 브랜드 스튜디오</h2>
        <p style={{ fontSize: 12, color: "#64748B", marginBottom: 16 }}>한번 설정하면 모든 문서·콘텐츠에 자동 적용됩니다.</p>

        {/* Current Brand */}
        <div style={{ background: biz.palette[0], borderRadius: 12, padding: "20px", color: "white", marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{biz.name}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{biz.subIndustry || biz.industry} · {biz.location}</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>대표: {biz.owner || "-"}</div>
        </div>

        {/* Color Palette */}
        <h3 style={S.h3}>컬러 팔레트: {biz.paletteName || "기본"}</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {biz.palette.map((c, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ width: "100%", height: 48, borderRadius: 8, background: c, border: "1px solid #E2E8F0" }} />
              <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 4 }}>{c}</div>
              <div style={{ fontSize: 9, color: "#64748B" }}>{["메인", "서브", "배경", "라이트"][i]}</div>
            </div>
          ))}
        </div>

        {/* Change Palette */}
        <h3 style={S.h3}>팔레트 변경</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {PALETTES.map((p, i) => (
            <button key={i} onClick={() => setBiz(prev => ({...prev, palette: p.colors, paletteName: p.name}))} style={{
              padding: "10px", border: JSON.stringify(biz.palette) === JSON.stringify(p.colors) ? "2px solid #0B3D91" : "1px solid #E2E8F0",
              borderRadius: 8, background: "white", cursor: "pointer", textAlign: "left",
            }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                {p.colors.map((c, j) => <div key={j} style={{ width: 16, height: 16, borderRadius: 3, background: c }} />)}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600 }}>{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Kit Preview */}
      <div style={S.card}>
        <h3 style={S.h2}>📦 브랜드 키트 미리보기</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["명함 디자인", "상장/수료증", "가정통신문 헤더", "카드뉴스 템플릿", "SNS 프로필", "굿즈 디자인"].map((item, i) => (
            <div key={i} style={{ border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: 60, background: `linear-gradient(135deg, ${biz.palette[0]}, ${biz.palette[1]})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 20 }}>{["💳","🏅","📮","📱","👤","🎁"][i]}</span>
              </div>
              <div style={{ padding: "8px 10px" }}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{item}</div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{i < 2 ? "Pro" : i < 4 ? "Basic" : "Enterprise"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Module 3: 마케팅 자동화 ---
function MarketingTab({ biz }) {
  const [selMonth, setSelMonth] = useState(NOW_MONTH);
  const [selChannel, setSelChannel] = useState(null);
  const season = SEASON_DB[biz.industry]?.[selMonth] || {};

  return (
    <div>
      {/* Monthly Selector */}
      <div style={S.card}>
        <h2 style={S.h2}>📊 월별 마케팅 플랜</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginBottom: 16 }}>
          {MONTHS.map(m => {
            const s = SEASON_DB[biz.industry]?.[m];
            const isCur = m === selMonth;
            return (
              <button key={m} onClick={() => setSelMonth(m)} style={{
                padding: "8px 4px", borderRadius: 6, border: isCur ? `2px solid ${biz.palette[0]}` : "1px solid #E2E8F0",
                background: isCur ? biz.palette[0] : s?.urgency === "high" ? "#FEF2F2" : "white",
                color: isCur ? "white" : "#374151", fontSize: 10, fontWeight: isCur ? 700 : 400, cursor: "pointer",
              }}>{m}{m === NOW_MONTH ? " ◀" : ""}</button>
            );
          })}
        </div>

        {/* Selected Month Plan */}
        <div style={{ background: biz.palette[0], borderRadius: 12, padding: "18px", color: "white", marginBottom: 16 }}>
          <div style={{ fontSize: 11, opacity: 0.7 }}>📅 {selMonth} 마케팅 테마</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{season.theme}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <span style={{ padding: "3px 10px", background: "rgba(255,255,255,0.2)", borderRadius: 10, fontSize: 10 }}>
              {season.urgency === "high" ? "🔴 최우선 시기" : "🟡 중요"}
            </span>
          </div>
        </div>

        {/* Tasks & Content */}
        <h3 style={S.h3}>✅ {selMonth} 실행 항목</h3>
        {(season.tasks || []).map((t, i) => <TaskItem key={i} text={t} />)}

        <h3 style={S.h3}>📝 {selMonth} 추천 콘텐츠</h3>
        {(season.content || []).map((c, i) => (
          <div key={i} style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: 8, marginBottom: 5, fontSize: 12 }}>{c}</div>
        ))}

        <h3 style={S.h3}>⚠️ {selMonth} 행정 체크</h3>
        {(season.admin || []).map((a, i) => (
          <div key={i} style={{ padding: "10px 14px", background: "#FEF2F2", borderRadius: 8, marginBottom: 5, fontSize: 12, color: "#991B1B" }}>📌 {a}</div>
        ))}
      </div>

      {/* Channel Guide */}
      <div style={S.card}>
        <h2 style={S.h2}>📱 9대 채널 마케팅 가이드</h2>
        <p style={{ fontSize: 11, color: "#64748B", marginBottom: 12 }}>채널을 탭하면 상세 가이드가 나옵니다.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {Object.entries(CHANNELS).map(([name, ch]) => (
            <button key={name} onClick={() => setSelChannel(selChannel === name ? null : name)} style={{
              padding: "10px 8px", border: selChannel === name ? `2px solid ${biz.palette[0]}` : "1px solid #E2E8F0",
              borderRadius: 10, background: selChannel === name ? (biz.palette[2] || "#EFF6FF") : "white",
              cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontSize: 20 }}>{ch.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{name}</div>
            </button>
          ))}
        </div>

        {selChannel && CHANNELS[selChannel] && (
          <div style={{ marginTop: 12, padding: "16px", background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{CHANNELS[selChannel].icon} {selChannel}</h3>
            <div style={{ fontSize: 12, color: biz.palette[0], fontWeight: 600, marginBottom: 4 }}>{CHANNELS[selChannel].purpose}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 10 }}>권장 빈도: {CHANNELS[selChannel].freq}</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>💡 실행 팁:</div>
            {CHANNELS[selChannel].tips.map((tip, i) => (
              <div key={i} style={{ padding: "6px 10px", background: "white", borderRadius: 6, marginBottom: 4, fontSize: 11, borderLeft: `3px solid ${biz.palette[0]}` }}>
                {tip}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Word of Mouth */}
      <div style={{ ...S.card, background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#92400E", marginBottom: 8 }}>🗣️ 입소문 마케팅 (가장 중요!)</h3>
        <div style={{ fontSize: 12, color: "#78350F", lineHeight: 1.8 }}>
          체육관·학원 신규 유입의 <strong>80% 이상이 입소문과 소개</strong>입니다.<br/><br/>
          <strong>틴트랩 입소문 시스템:</strong><br/>
          ✅ 학부모가 지인에게 보내기 쉬운 '학원 소개 키트' 링크 제공<br/>
          ✅ 추천인 카드 디자인 + 이벤트 기획안<br/>
          ✅ 수업 현장 사진/영상 → 밴드·카카오 자동 공유<br/>
          ✅ 네이버 리뷰 요청 메시지 + 답글 가이드<br/>
          ✅ 맘카페·학부모밴드 게시글 작성 가이드
        </div>
      </div>
    </div>
  );
}

// --- Module 4: 콘텐츠 팩토리 ---
function ContentTab({ biz }) {
  const [type, setType] = useState("letter");
  const season = SEASON_DB[biz.industry]?.[NOW_MONTH] || {};

  const types = [
    { id: "letter", label: "📮 가정통신문", desc: "학부모 안내문" },
    { id: "card", label: "📱 카드뉴스", desc: "SNS용 이미지" },
    { id: "blog", label: "📝 블로그 초안", desc: "네이버 블로그" },
    { id: "caption", label: "💬 SNS 캡션", desc: "인스타·스레드" },
    { id: "script", label: "🎬 영상 대본", desc: "릴스·쇼츠" },
    { id: "event", label: "🎁 이벤트 기획", desc: "프로모션" },
  ];

  const dong = biz.location?.split(" ").pop() || "우리동네";
  const sub = biz.subIndustry || biz.industry;

  const content = {
    letter: {
      title: `${biz.name} ${NOW_MONTH} 가정통신문`,
      body: `안녕하세요, ${biz.name} ${biz.industry === "체육관" ? "관장" : "원장"} ${biz.owner || ""}입니다.\n\n${season.theme?.replace(/[^\w\sㄱ-힣]/g,"") || "이달"} 시즌을 맞이하여 안내드립니다.\n\n■ ${NOW_MONTH} 주요 일정\n${(season.tasks||[]).map((t,i) => `  ${i+1}. ${t}`).join("\n")}\n\n■ 안내사항\n- 수업 시간: [시간 기입]\n- 준비물: [준비물 기입]\n- 기타 문의: [연락처]\n\n항상 ${biz.name}에 보내주시는 관심과 사랑에 감사드립니다.\n\n${biz.name} ${biz.industry === "체육관" ? "관장" : "원장"} ${biz.owner || ""} 드림`
    },
    card: {
      title: `${NOW_MONTH} 카드뉴스 텍스트`,
      body: `[슬라이드 1 - 커버]\n${biz.name}\n${season.theme}\n\n[슬라이드 2 - 본문]\n${biz.industry === "체육관" ? "우리 아이의 체력과 자신감을\n한 단계 업그레이드!" : "이번 달 학습 목표를\n확실하게 달성하세요!"}\n\n[슬라이드 3 - 상세]\n${(season.tasks||[]).slice(0,3).map(t => `✅ ${t}`).join("\n")}\n\n[슬라이드 4 - CTA]\n📞 상담 문의: [전화번호]\n📍 ${biz.location}\n🔗 네이버 플레이스에서 "${biz.name}" 검색!`
    },
    blog: {
      title: `[${dong} ${sub} 추천] ${biz.name} ${NOW_MONTH} 안내`,
      body: `안녕하세요! ${dong}에서 ${sub}${biz.industry === "체육관" ? "을 전문으로 지도하는" : "을 전문으로 가르치는"} ${biz.name}입니다.\n\n${season.theme}${season.urgency === "high" ? " 시즌을 맞아 특별 프로그램을 준비했습니다." : "에 대해 안내드립니다."}\n\n## ${biz.name}이 특별한 이유\n\n1. [첫 번째 강점 - 예: ${biz.bizYears || 5}년 경력의 전문 강사진]\n2. [두 번째 강점 - 예: 체계적인 커리큘럼]\n3. [세 번째 강점 - 예: 쾌적한 시설과 안전 관리]\n\n## ${NOW_MONTH} 프로그램 안내\n\n${(season.tasks||[]).map(t => `- ${t}`).join("\n")}\n\n## 수업 안내\n- 대상: ${biz.industry === "체육관" ? "유아~성인" : "초등~중등"}\n- 위치: ${biz.location}\n- 문의: [전화번호]\n\n네이버에서 "${dong} ${sub}" 또는 "${biz.name}" 검색해주세요!\n\n#${dong}${sub} #${biz.name} #${dong}${biz.industry}`
    },
    caption: {
      title: `인스타그램/스레드 캡션`,
      body: `[인스타그램 캡션]\n${season.theme} ${biz.industry === "체육관" ? "💪🥋" : "📚✏️"}\n\n${biz.name}에서 준비한\n${NOW_MONTH} 특별 프로그램!\n\n${(season.tasks||[]).slice(0,2).map(t => `✅ ${t}`).join("\n")}\n\n🔗 프로필 링크에서 상담 예약하세요!\n\n#${dong}${sub} #${biz.name.replace(/\s/g,"")} #${dong}${biz.industry}\n#${biz.industry === "체육관" ? "태권도 #무도교육 #체력향상 #어린이태권도" : "학원 #공부 #성적향상 #학습법"}\n\n---\n\n[스레드 캡션]\n${biz.industry === "체육관" ? "관장" : "원장"}으로 ${biz.bizYears || 5}년째.\n\n${NOW_MONTH}이 되면 항상 드는 생각이 있어요.\n"${season.theme?.replace(/[^\w\sㄱ-힣]/g,"")}" 때 우리 아이들이 가장 많이 성장하거든요.\n\n올해도 어김없이 준비했습니다 ✨`
    },
    script: {
      title: `릴스/쇼츠 영상 대본 (30초)`,
      body: `[영상 대본 - ${season.theme}]\n\n⏱️ 0~3초 (후킹)\n${biz.industry === "체육관" ? "우리 아이가 이렇게 달라질 수 있다고?" : `${dong} 학부모님들이 가장 궁금해하는 것!`}\n→ 텍스트 자막: "${biz.name}의 비밀"\n\n⏱️ 3~10초 (문제 제기)\n${biz.industry === "체육관" ? '"운동을 시작한 지 3개월, 아이의 자세가 완전히 달라졌어요"' : '"성적이 오르는 건 공부량이 아니라 공부법이에요"'}\n→ 수업 현장 B롤 삽입\n\n⏱️ 10~25초 (솔루션)\n${(season.tasks||[]).slice(0,2).map(t => `"${t}"`).join("\n")}\n→ 학생 활동 장면 + 성과 장면\n\n⏱️ 25~30초 (CTA)\n"${biz.name}에서 직접 체험해보세요!"\n→ 위치 정보 + 연락처 텍스트\n\n🎵 배경음악: 밝고 에너지 있는 트렌드 음악\n📍 촬영 팁: 세로 9:16, 자연광 추천, 자막 필수`
    },
    event: {
      title: `${NOW_MONTH} 이벤트 기획안`,
      body: `[이벤트명] ${biz.name} ${season.theme} 이벤트\n\n■ 이벤트 1: 체험 수업 무료\n- 기간: ${NOW_MONTH} 1일~15일\n- 대상: 신규 상담 고객\n- 내용: 1회 무료 체험 수업\n- 홍보: 네이버플레이스 + 인스타 + 밴드\n\n■ 이벤트 2: 추천인 혜택\n- 기간: ${NOW_MONTH} 전체\n- 내용: 기존 회원이 신규 회원 소개 시\n  → 추천인: 1개월 수강료 10% 할인\n  → 신규: 등록비 면제\n- 추천 카드 디자인 + 카카오톡 발송\n\n■ 이벤트 3: SNS 후기 이벤트\n- 내용: 인스타/블로그에 후기 작성 시\n  → 소정의 선물 증정\n  → "${biz.name}" 태그 필수\n\n■ 예상 비용\n- 체험 수업: 강사 인건비만 (추가 비용 0)\n- 추천인 할인: 월 수강료의 10% × 예상 5건\n- 후기 선물: 건당 5,000원 × 10건 = 50,000원\n- 총 예산: 약 10~20만원`
    }
  };

  return (
    <div>
      <div style={S.card}>
        <h2 style={S.h2}>📝 콘텐츠 팩토리</h2>
        <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>우리 {biz.industry} 브랜드가 입혀진 콘텐츠를 자동으로 생성합니다.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 16 }}>
          {types.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} style={{
              padding: "12px 8px", border: type === t.id ? `2px solid ${biz.palette[0]}` : "1px solid #E2E8F0",
              borderRadius: 10, background: type === t.id ? (biz.palette[2] || "#EFF6FF") : "white", cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</div>
              <div style={{ fontSize: 9, color: "#94A3B8" }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Content */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>{content[type]?.title}</h3>
          <button onClick={() => { navigator.clipboard?.writeText(content[type]?.body || ""); alert("클립보드에 복사되었습니다!"); }} style={S.btnSm}>📋 복사</button>
        </div>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.8, color: "#334155", background: "#F8FAFC", padding: "16px", borderRadius: 10, border: "1px solid #E2E8F0", fontFamily: "'Noto Sans KR',sans-serif", maxHeight: 500, overflow: "auto" }}>
          {content[type]?.body}
        </pre>
      </div>
    </div>
  );
}

// --- Module 5: 행정·세무 ---
function AdminTab({ biz }) {
  const thisMonth = new Date().getMonth() + 1;
  const thisMonthTemplates = Object.entries(ADMIN_TEMPLATES).filter(([_, t]) => t.monthly.includes(thisMonth));
  const allTemplates = Object.entries(ADMIN_TEMPLATES);
  const categories = [...new Set(Object.values(ADMIN_TEMPLATES).map(t => t.category))];
  const [selCat, setSelCat] = useState("all");
  const [preview, setPreview] = useState(null);

  const filtered = selCat === "all" ? allTemplates : allTemplates.filter(([_, t]) => t.category === selCat);

  return (
    <div>
      {/* This Month Alert */}
      {thisMonthTemplates.length > 0 && (
        <div style={{ ...S.card, background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#991B1B", marginBottom: 8 }}>⚠️ {NOW_MONTH} 필요 문서 ({thisMonthTemplates.length}종)</h3>
          {thisMonthTemplates.map(([name, t]) => (
            <div key={name} style={{ padding: "8px 12px", background: "white", borderRadius: 6, marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12 }}>{t.icon} {name}</span>
              <button onClick={() => setPreview(name)} style={{ ...S.btnSm, fontSize: 10, padding: "4px 10px" }}>미리보기</button>
            </div>
          ))}
        </div>
      )}

      {/* Template Gallery */}
      <div style={S.card}>
        <h2 style={S.h2}>📋 행정·세무 템플릿</h2>
        <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>상호·대표자·로고가 자동 입력된 템플릿을 제공합니다.</p>

        {/* Category Filter */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
          <button onClick={() => setSelCat("all")} style={{ ...S.tag, cursor: "pointer", background: selCat === "all" ? biz.palette[0] : "#F1F5F9", color: selCat === "all" ? "white" : "#64748B", border: "none" }}>전체</button>
          {categories.map(c => (
            <button key={c} onClick={() => setSelCat(c)} style={{ ...S.tag, cursor: "pointer", background: selCat === c ? biz.palette[0] : "#F1F5F9", color: selCat === c ? "white" : "#64748B", border: "none" }}>{c}</button>
          ))}
        </div>

        {/* Template List */}
        {filtered.map(([name, t]) => (
          <div key={name} style={{ padding: "14px", border: "1px solid #E2E8F0", borderRadius: 10, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.icon} {name}</div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{t.desc}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                {t.fields.map(f => <span key={f} style={{ fontSize: 9, padding: "2px 6px", background: "#F0FDF4", borderRadius: 8, color: "#059669" }}>✅ {f}</span>)}
              </div>
            </div>
            <button onClick={() => setPreview(name)} style={S.btnSm}>보기</button>
          </div>
        ))}
      </div>

      {/* Template Preview Modal */}
      {preview && ADMIN_TEMPLATES[preview] && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "white", borderRadius: 16, maxWidth: 500, width: "100%", maxHeight: "80vh", overflow: "auto", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{ADMIN_TEMPLATES[preview].icon} {preview}</h3>
              <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ border: "2px solid #E2E8F0", borderRadius: 12, padding: "20px" }}>
              {/* Auto-filled header */}
              <div style={{ textAlign: "center", borderBottom: `3px solid ${biz.palette[0]}`, paddingBottom: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, background: biz.palette[0], borderRadius: 8, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 18 }}>T</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: biz.palette[0] }}>{biz.name}</div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{biz.location} | 대표: {biz.owner || "-"} | 사업자: {biz.bizNo || "-"}</div>
              </div>
              <div style={{ textAlign: "center", fontSize: 18, fontWeight: 800, marginBottom: 16 }}>{preview}</div>
              <div style={{ fontSize: 12, color: "#64748B", lineHeight: 2, background: "#F8FAFC", padding: 16, borderRadius: 8 }}>
                {generateTemplateContent(preview, biz)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => { navigator.clipboard?.writeText(generateTemplateContent(preview, biz)); alert("복사 완료!"); }} style={{ ...S.btn, flex: 1 }}>📋 텍스트 복사</button>
              <button onClick={() => setPreview(null)} style={{ ...S.btn, flex: 1, background: "#64748B" }}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateTemplateContent(name, biz) {
  const templates = {
    "가정통신문": `[${biz.name} 가정통신문]\n\n학부모님께,\n\n안녕하세요, ${biz.name} ${biz.industry === "체육관" ? "관장" : "원장"} ${biz.owner || ""}입니다.\n\n■ 이달 주요 안내\n1. [안내사항 1]\n2. [안내사항 2]\n\n■ 일정 안내\n- [일정 1]: 월 일 (요일)\n- [일정 2]: 월 일 (요일)\n\n■ 당부 말씀\n[당부 내용]\n\n감사합니다.\n${biz.name} ${biz.industry === "체육관" ? "관장" : "원장"} ${biz.owner || ""} 드림\n연락처: [전화번호]`,
    "근로계약서": `[표준 근로계약서]\n\n사업장명: ${biz.name}\n사업자등록번호: ${biz.bizNo || "___-__-_____"}\n대표자: ${biz.owner || "___"}\n소재지: ${biz.location || "___"}\n\n1. 근로계약기간: 20__년 __월 __일 ~ 20__년 __월 __일\n2. 근무장소: ${biz.location}\n3. 업무내용: ${biz.industry === "체육관" ? "체육지도" : "교육지도"} 및 관련 업무\n4. 근무시간: __시 ~ __시 (휴게시간 __시간 포함)\n5. 근무일: 주 __일 (매주 __요일 휴무)\n6. 임금: 월 ________원 (세전)\n7. 임금지급일: 매월 __일\n8. 4대보험: □ 국민연금 □ 건강보험 □ 고용보험 □ 산재보험`,
    "교육비일할계산표": `[교육비 일할 계산표]\n\n학원명: ${biz.name}\n교습과목: ${biz.subIndustry || "___"}\n월 교습비: ${biz.monthlyFee ? formatNum(biz.monthlyFee) + "원" : "___원"}\n\n■ 일할 계산 공식 (학원법 시행령 제18조)\n일할 교습비 = 월 교습비 ÷ 해당 월 총 일수 × 수강 일수\n\n※ 학원비 관리 탭에서 자동 계산기를 이용하세요.`,
    "환불안내문": `[수강료 반환 기준 안내]\n\n${biz.name}\n\n학원의 설립·운영 및 과외교습에 관한 법률 제18조에 따른\n수강료 반환 기준을 안내드립니다.\n\n1. 학원 사정으로 교습을 못 받은 경우: 전액 반환\n2. 본인 사정으로 수강 포기:\n   - 수업 시작 전: 이미 납부한 수강료 전액\n   - 총 수업시간의 1/3 경과 전: 이미 납부한 수강료의 2/3\n   - 총 수업시간의 1/2 경과 전: 이미 납부한 수강료의 1/2\n   - 총 수업시간의 1/2 경과 후: 반환하지 않음`,
  };
  return templates[name] || `[${name}]\n\n학원명: ${biz.name}\n대표자: ${biz.owner || "___"}\n사업자번호: ${biz.bizNo || "___"}\n소재지: ${biz.location}\n\n(상세 내용은 Pro 버전에서 제공됩니다)`;
}

// --- Module 6: 학원비 관리 ---
function FeeTab({ biz }) {
  const [mode, setMode] = useState("daily");
  const [fee, setFee] = useState(biz.monthlyFee || 150000);
  const [totalDays, setTotalDays] = useState(28);
  const [usedDays, setUsedDays] = useState(15);
  const [refundStage, setRefundStage] = useState("before");
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState("");

  const dailyRate = Math.round(fee / totalDays);
  const prorated = dailyRate * usedDays;
  const refundAmounts = {
    before: fee,
    "1/3": Math.round(fee * 2 / 3),
    "1/2": Math.round(fee / 2),
    after: 0,
  };
  const refundLabels = {
    before: "수업 시작 전 → 전액 반환",
    "1/3": "총 수업시간 1/3 경과 전 → 2/3 반환",
    "1/2": "총 수업시간 1/2 경과 전 → 1/2 반환",
    after: "총 수업시간 1/2 경과 후 → 반환 없음",
  };

  return (
    <div>
      {/* Calculator Mode Selector */}
      <div style={S.card}>
        <h2 style={S.h2}>💰 학원비 관리</h2>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[{ id: "daily", label: "🧮 일할계산기" }, { id: "refund", label: "💸 환불계산기" }, { id: "manage", label: "📊 수납관리" }].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              flex: 1, padding: "10px", border: mode === m.id ? `2px solid ${biz.palette[0]}` : "1px solid #E2E8F0",
              borderRadius: 8, background: mode === m.id ? (biz.palette[2] || "#EFF6FF") : "white", fontSize: 12, fontWeight: mode === m.id ? 700 : 400, cursor: "pointer",
            }}>{m.label}</button>
          ))}
        </div>
      </div>

      {/* 일할계산기 */}
      {mode === "daily" && (
        <div style={S.card}>
          <h3 style={S.h3}>🧮 교육비 일할 계산기</h3>
          <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 12 }}>학원법 시행령 제18조 기준 | 일할 교습비 = 월 교습비 ÷ 해당 월 총 일수 × 수강 일수</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div>
              <label style={S.label}>월 교습비 (원)</label>
              <input type="number" value={fee} onChange={e => setFee(parseInt(e.target.value) || 0)} style={S.input} />
            </div>
            <div>
              <label style={S.label}>해당 월 총 일수</label>
              <input type="number" value={totalDays} onChange={e => setTotalDays(parseInt(e.target.value) || 1)} style={S.input} />
            </div>
            <div>
              <label style={S.label}>실제 수강 일수</label>
              <input type="number" value={usedDays} onChange={e => setUsedDays(parseInt(e.target.value) || 0)} style={S.input} />
            </div>
          </div>
          {/* Result */}
          <div style={{ background: biz.palette[0], borderRadius: 12, padding: "20px", color: "white", textAlign: "center" }}>
            <div style={{ fontSize: 11, opacity: 0.7 }}>일할 교습비</div>
            <div style={{ fontSize: 32, fontWeight: 900, margin: "6px 0" }}>{formatNum(prorated)}원</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>일당 {formatNum(dailyRate)}원 × {usedDays}일</div>
          </div>
          <div style={{ marginTop: 10, padding: "10px 14px", background: "#F8FAFC", borderRadius: 8, fontSize: 11, color: "#64748B" }}>
            💡 {biz.name} 기준 | 월 교습비 {formatNum(fee)}원 ÷ {totalDays}일 = 일당 {formatNum(dailyRate)}원
          </div>
        </div>
      )}

      {/* 환불계산기 */}
      {mode === "refund" && (
        <div style={S.card}>
          <h3 style={S.h3}>💸 수강료 환불 계산기</h3>
          <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 12 }}>학원법 제18조 기준</p>
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>납부한 수강료 (원)</label>
            <input type="number" value={fee} onChange={e => setFee(parseInt(e.target.value) || 0)} style={S.input} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>수강 진행 상태</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(refundLabels).map(([key, label]) => (
                <button key={key} onClick={() => setRefundStage(key)} style={{
                  padding: "12px 14px", border: refundStage === key ? `2px solid ${biz.palette[0]}` : "1px solid #E2E8F0",
                  borderRadius: 8, background: refundStage === key ? (biz.palette[2] || "#EFF6FF") : "white",
                  fontSize: 12, textAlign: "left", cursor: "pointer", fontWeight: refundStage === key ? 600 : 400,
                }}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{ background: "#FEF2F2", borderRadius: 12, padding: "20px", textAlign: "center", border: "1.5px solid #FECACA" }}>
            <div style={{ fontSize: 11, color: "#991B1B" }}>환불 금액</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#DC2626", margin: "6px 0" }}>{formatNum(refundAmounts[refundStage])}원</div>
            <div style={{ fontSize: 11, color: "#991B1B" }}>납부액 {formatNum(fee)}원 중</div>
          </div>
        </div>
      )}

      {/* 수납관리 */}
      {mode === "manage" && (
        <div style={S.card}>
          <h3 style={S.h3}>📊 수납 현황 (간이)</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={newStudent} onChange={e => setNewStudent(e.target.value)} placeholder="원생명 입력" style={{ ...S.input, flex: 1 }} />
            <button onClick={() => { if (newStudent) { setStudents(p => [...p, { name: newStudent, paid: false, amount: fee }]); setNewStudent(""); } }} style={S.btnSm}>추가</button>
          </div>
          {students.length === 0 && <div style={{ textAlign: "center", padding: "30px", color: "#94A3B8", fontSize: 12 }}>원생을 추가하세요 (Pro에서 전체 기능 제공)</div>}
          {students.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid #E2E8F0", borderRadius: 8, marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontSize: 11, color: "#94A3B8", marginLeft: 8 }}>{formatNum(s.amount)}원</span>
              </div>
              <button onClick={() => setStudents(p => p.map((st, j) => j === i ? {...st, paid: !st.paid} : st))} style={{
                padding: "4px 12px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
                background: s.paid ? "#059669" : "#FEE2E2", color: s.paid ? "white" : "#DC2626",
              }}>{s.paid ? "✅ 납부" : "미납"}</button>
            </div>
          ))}
          {students.length > 0 && (
            <div style={{ marginTop: 12, padding: "12px", background: "#F8FAFC", borderRadius: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span>총 {students.length}명 | 납부 {students.filter(s=>s.paid).length}명 | 미납 {students.filter(s=>!s.paid).length}명</span>
              <span style={{ fontWeight: 700, color: biz.palette[0] }}>수납률 {students.length > 0 ? Math.round(students.filter(s=>s.paid).length / students.length * 100) : 0}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Module 7: 월간 캘린더 ---
function CalendarTab({ biz }) {
  const [selMonth, setSelMonth] = useState(NOW_MONTH);
  const season = SEASON_DB[biz.industry]?.[selMonth] || {};
  const thisMonthTemplates = Object.entries(ADMIN_TEMPLATES).filter(([_, t]) => t.monthly.includes(MONTHS.indexOf(selMonth) + 1));

  return (
    <div>
      <div style={S.card}>
        <h2 style={S.h2}>📅 {biz.industry} 연간 운영 캘린더</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
          {MONTHS.map(m => {
            const s = SEASON_DB[biz.industry]?.[m];
            const isSel = m === selMonth;
            const isCur = m === NOW_MONTH;
            return (
              <button key={m} onClick={() => setSelMonth(m)} style={{
                padding: "10px 6px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                border: isSel ? `2.5px solid ${biz.palette[0]}` : "1px solid #E2E8F0",
                background: isSel ? biz.palette[0] : s?.urgency === "high" ? "#FEF2F2" : "white",
                color: isSel ? "white" : "#374151",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{m} {isCur && !isSel ? "◀" : ""}</div>
                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2, lineHeight: 1.2 }}>{s?.theme?.slice(2, 14) || ""}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Month Detail */}
      <div style={S.card}>
        <div style={{ background: `linear-gradient(135deg, ${biz.palette[0]}, ${biz.palette[1] || biz.palette[0]})`, borderRadius: 12, padding: "18px", color: "white", marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{selMonth}</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>{season.theme}</div>
          <span style={{ display: "inline-block", marginTop: 6, padding: "3px 10px", background: "rgba(255,255,255,0.2)", borderRadius: 10, fontSize: 10 }}>
            {season.urgency === "high" ? "🔴 마케팅 집중 시기" : "🟡 일반 운영"}
          </span>
        </div>

        <h3 style={S.h3}>📊 마케팅 할 일</h3>
        {(season.tasks || []).map((t, i) => <TaskItem key={`t${i}`} text={t} />)}

        <h3 style={S.h3}>📝 제작할 콘텐츠</h3>
        {(season.content || []).map((c, i) => (
          <div key={i} style={{ padding: "8px 14px", background: biz.palette[2] || "#EFF6FF", borderRadius: 8, marginBottom: 4, fontSize: 12 }}>{c}</div>
        ))}

        <h3 style={S.h3}>⚠️ 행정·세무 체크</h3>
        {(season.admin || []).map((a, i) => (
          <div key={i} style={{ padding: "8px 14px", background: "#FEF2F2", borderRadius: 8, marginBottom: 4, fontSize: 12, color: "#991B1B" }}>📌 {a}</div>
        ))}

        {thisMonthTemplates.length > 0 && (
          <>
            <h3 style={S.h3}>📋 필요 문서 ({thisMonthTemplates.length}종)</h3>
            {thisMonthTemplates.map(([name, t]) => (
              <div key={name} style={{ padding: "8px 14px", background: "#F8FAFC", borderRadius: 8, marginBottom: 4, fontSize: 12 }}>{t.icon} {name} — {t.desc}</div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function TintLabV3() {
  const [biz, setBiz] = useState(null);
  const [tab, setTab] = useState("home");

  const reset = () => { setBiz(null); setTab("home"); };

  if (!biz) return <Onboarding onComplete={(data) => { setBiz(data); setTab("home"); }} />;

  const tabContent = {
    home: <HomeTab biz={biz} />,
    analysis: <AnalysisTab biz={biz} />,
    brand: <BrandTab biz={biz} setBiz={setBiz} />,
    marketing: <MarketingTab biz={biz} />,
    content: <ContentTab biz={biz} />,
    admin: <AdminTab biz={biz} />,
    fee: <FeeTab biz={biz} />,
    calendar: <CalendarTab biz={biz} />,
  };

  return (
    <div style={S.page}>
      <Header biz={biz} onReset={reset} activeTab={tab} setActiveTab={setTab} />
      <div style={S.container}>
        <div style={{ paddingTop: 16 }}>
          {tabContent[tab] || tabContent.home}
        </div>
      </div>
    </div>
  );
}
