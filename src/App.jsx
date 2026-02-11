import { useState, useEffect } from "react";

// ============================================================
// TintLab MVP v2 - 사업자등록증 기반 통합 분석 플랫폼
// 자금조달 가이드 + 마케팅 가이드 + 경영진단
// ============================================================

// --- 2026 정부지원사업 DB ---
const FUNDING_DB = [
  {
    id: "F01", name: "창업도약패키지 (일반형)", org: "중소벤처기업부",
    amount: "최대 2억원", period: "2026.02~03 (연 1회)",
    target: "창업 3~7년 이내 기업", type: "보조금",
    conditions: ["법인/개인사업자", "창업 3~7년", "기술기반 or 지식서비스"],
    industries: ["all"], bizAge: [3, 7], priority: 1,
    tip: "사업계획서 완성도가 핵심. AI/SaaS 키워드 + 기존 매출 실적 강조",
    url: "https://www.k-startup.go.kr"
  },
  {
    id: "F02", name: "창업도약패키지 (민간투자연계형)", org: "중소벤처기업부",
    amount: "최대 3억원 (투자 연계)", period: "2026.02~03",
    target: "투자유치 가능한 창업기업", type: "보조금+투자",
    conditions: ["법인사업자", "투자유치 계획 보유", "스케일업 단계"],
    industries: ["all"], bizAge: [3, 7], priority: 2,
    tip: "투자유치 계획서 + IR 덱 준비 필수. 투자사 LOI 있으면 유리",
    url: "https://www.k-startup.go.kr"
  },
  {
    id: "F03", name: "소상공인 정책자금 (일반경영안정자금)", org: "소상공인시장진흥공단",
    amount: "최대 7천만원 (대출)", period: "2026.01~ (상시)",
    target: "소상공인 전체", type: "저금리대출",
    conditions: ["소상공인 확인서 발급 가능", "상시근로자 5인 미만"],
    industries: ["all"], bizAge: [0, 99], priority: 1,
    tip: "소상공인 확인서 사전 발급 필수. 신용등급 관리 중요",
    url: "https://ols.semas.or.kr"
  },
  {
    id: "F04", name: "소상공인 디지털전환 바우처", org: "소상공인시장진흥공단",
    amount: "최대 300~500만원", period: "2026.03~ (연 1회)",
    target: "디지털 전환 희망 소상공인", type: "바우처",
    conditions: ["소상공인", "디지털 도구 도입 계획"],
    industries: ["all"], bizAge: [0, 99], priority: 1,
    tip: "키오스크·POS보다 마케팅·고객관리 소프트웨어가 신규 트렌드",
    url: "https://www.semas.or.kr"
  },
  {
    id: "F05", name: "여성기업 지원사업", org: "한국여성경제인협회",
    amount: "최대 1억원", period: "2026.03~04",
    target: "여성 대표 기업", type: "보조금",
    conditions: ["여성기업 인증", "사업 영위 1년 이상"],
    industries: ["all"], bizAge: [1, 99], priority: 2,
    tip: "여성기업 인증 사전 취득 필수. 고용 창출 계획 포함 시 가점",
    url: "https://www.wbiz.or.kr", gender: "female"
  },
  {
    id: "F06", name: "사회적기업 사업개발비", org: "한국사회적기업진흥원",
    amount: "최대 1억원", period: "2026.02~03",
    target: "예비사회적기업 / 인증 사회적기업", type: "보조금",
    conditions: ["예비사회적기업 이상", "사회적 가치 창출 계획"],
    industries: ["all"], bizAge: [0, 99], priority: 2,
    tip: "사회적 성과 측정(SROI) 계획 포함 시 유리. 고용 취약계층 비율 중요",
    url: "https://www.socialenterprise.or.kr", social: true
  },
  {
    id: "F07", name: "희망리턴패키지 (재창업)", org: "소상공인시장진흥공단",
    amount: "컨설팅+교육+사업비 패키지", period: "2026.01~ (상시)",
    target: "폐업 경험 소상공인 / 업종전환 희망자", type: "패키지",
    conditions: ["폐업 경험 or 업종전환 계획", "재창업 의지"],
    industries: ["all"], bizAge: [0, 99], priority: 3,
    tip: "대표님이 컨설턴트로 참여 가능. 재창업 교육 이수 필수",
    url: "https://www.semas.or.kr"
  },
  {
    id: "F08", name: "기술보증기금 보증", org: "기술보증기금",
    amount: "최대 30억원 (보증)", period: "상시",
    target: "기술력 보유 기업", type: "보증",
    conditions: ["기술사업계획서", "신용등급 양호"],
    industries: ["지식서비스", "정보·통신", "제조"], bizAge: [0, 99], priority: 2,
    tip: "기술성 평가에서 AI/데이터 활용도 강조. 특허·저작권 보유 시 유리",
    url: "https://www.kibo.or.kr"
  },
  {
    id: "F09", name: "서울시 소상공인 디지털 역량강화", org: "서울시/SBA",
    amount: "교육+컨설팅+실비", period: "2026.03~",
    target: "서울 소재 소상공인", type: "교육+컨설팅",
    conditions: ["서울시 소재 사업장", "소상공인"],
    industries: ["all"], bizAge: [0, 99], priority: 1, region: "서울",
    tip: "1:1 전문가 컨설팅 포함. 틴트랩을 실습 도구로 제안 가능",
    url: "https://www.sba.seoul.kr"
  },
  {
    id: "F10", name: "AI 바우처 지원사업", org: "과학기술정보통신부/NIA",
    amount: "최대 3억원", period: "2026.02~03",
    target: "AI 도입 희망 중소기업", type: "바우처",
    conditions: ["중소기업", "AI 기술 도입 계획", "수요기업 신청"],
    industries: ["all"], bizAge: [0, 99], priority: 2,
    tip: "AI 공급기업으로 등록하면 수요기업 매칭 가능. SaaS 형태 유리",
    url: "https://www.ai-voucher.kr"
  },
];

// --- 업종별 마케팅 DB ---
const INDUSTRY_DB = {
  "체육시설": {
    code: "S96",
    seasons: {
      "1월": { theme: "신년 신규회원 모집", urgency: "high", channels: ["네이버플레이스", "인스타그램", "카카오톡"] },
      "2월": { theme: "봄맞이 다이어트 캠페인", urgency: "mid", channels: ["블로그", "인스타그램"] },
      "3월": { theme: "승급심사/대회 시즌 홍보", urgency: "high", channels: ["카카오톡", "네이버플레이스", "블로그"] },
      "4월": { theme: "봄시즌 체험 이벤트", urgency: "mid", channels: ["인스타그램", "네이버플레이스"] },
      "5월": { theme: "가정의달 가족 프로그램", urgency: "mid", channels: ["카카오톡", "블로그"] },
      "6월": { theme: "여름방학 특강/캠프 홍보", urgency: "high", channels: ["네이버플레이스", "블로그", "카카오톡"] },
      "7월": { theme: "여름방학 집중반 모집", urgency: "high", channels: ["인스타그램", "블로그", "네이버플레이스"] },
      "8월": { theme: "2학기 신규 등록 캠페인", urgency: "high", channels: ["카카오톡", "네이버플레이스"] },
      "9월": { theme: "가을 시즌 이벤트", urgency: "mid", channels: ["인스타그램", "블로그"] },
      "10월": { theme: "승급심사/대회 시즌 홍보", urgency: "high", channels: ["카카오톡", "네이버플레이스", "블로그"] },
      "11월": { theme: "연말 등록 할인 이벤트", urgency: "mid", channels: ["네이버플레이스", "카카오톡"] },
      "12월": { theme: "신년 사전등록 + 연말행사", urgency: "high", channels: ["카카오톡", "인스타그램", "네이버플레이스"] },
    },
    checks: [
      { q: "네이버 플레이스에 등록되어 있나요?", w: 15 },
      { q: "플레이스 사진이 10장 이상인가요?", w: 10 },
      { q: "최근 1개월 내 리뷰가 있나요?", w: 12 },
      { q: "인스타그램 계정을 운영 중인가요?", w: 8 },
      { q: "최근 2주 내 SNS 게시물을 올렸나요?", w: 10 },
      { q: "블로그를 운영하고 있나요?", w: 8 },
      { q: "프로그램/수업 안내 페이지가 있나요?", w: 10 },
      { q: "카카오톡 채널을 운영 중인가요?", w: 7 },
      { q: "정기적인 이벤트/프로모션을 진행하나요?", w: 10 },
      { q: "회원 리뷰/후기를 수집하고 있나요?", w: 10 },
    ],
    templates: {
      "네이버플레이스": ["📸 시설·수업 사진 업데이트", "⭐ 회원 리뷰 요청 메시지", "📝 시설+프로그램 소개 최적화"],
      "인스타그램": ["🎬 수업 하이라이트 릴스", "📊 비포/애프터 카드뉴스", "🎯 이달의 이벤트 스토리"],
      "블로그": ["📖 '[지역명] [업종] 추천' 포스팅", "💡 회원 성공사례 인터뷰", "📋 시즌 프로그램 안내"],
      "카카오톡": ["💬 시즌 안내 메시지", "🎁 추천인 이벤트 안내", "📅 월간 일정 + CTA"],
    }
  },
  "학원": {
    code: "P85",
    seasons: {
      "1월": { theme: "겨울방학 특강 + 신학기 사전등록", urgency: "high", channels: ["카카오톡", "블로그", "네이버플레이스"] },
      "2월": { theme: "신학기 원생 모집 집중", urgency: "high", channels: ["네이버플레이스", "블로그", "카카오톡"] },
      "3월": { theme: "신학기 적응 프로그램", urgency: "mid", channels: ["카카오톡", "인스타그램"] },
      "4월": { theme: "중간고사 대비 특강", urgency: "mid", channels: ["카카오톡", "블로그"] },
      "5월": { theme: "학부모 상담 + 여름방학 사전 안내", urgency: "mid", channels: ["카카오톡"] },
      "6월": { theme: "여름방학 특강 사전등록", urgency: "high", channels: ["블로그", "네이버플레이스", "카카오톡"] },
      "7월": { theme: "여름방학 집중반 운영", urgency: "high", channels: ["인스타그램", "블로그"] },
      "8월": { theme: "2학기 신규 등록", urgency: "high", channels: ["네이버플레이스", "카카오톡", "블로그"] },
      "9월": { theme: "2학기 정착 프로그램", urgency: "mid", channels: ["카카오톡"] },
      "10월": { theme: "기말고사 대비 + 겨울방학 안내", urgency: "mid", channels: ["카카오톡", "블로그"] },
      "11월": { theme: "겨울방학 특강 사전등록", urgency: "high", channels: ["블로그", "네이버플레이스", "카카오톡"] },
      "12월": { theme: "신년 사전등록 + 겨울방학", urgency: "high", channels: ["카카오톡", "네이버플레이스"] },
    },
    checks: [
      { q: "네이버 플레이스에 등록되어 있나요?", w: 15 },
      { q: "커리큘럼 안내 페이지가 있나요?", w: 12 },
      { q: "학부모 리뷰/후기가 5개 이상인가요?", w: 12 },
      { q: "블로그에 교육 콘텐츠를 올리고 있나요?", w: 10 },
      { q: "카카오톡으로 학부모와 소통하나요?", w: 10 },
      { q: "수업 사진/영상을 정기 업로드하나요?", w: 8 },
      { q: "레벨테스트/상담 예약 시스템이 있나요?", w: 8 },
      { q: "시즌별 특강/이벤트를 진행하나요?", w: 10 },
      { q: "성적 향상 사례를 홍보하고 있나요?", w: 8 },
      { q: "경쟁 학원 대비 차별점을 알리고 있나요?", w: 7 },
    ],
    templates: {
      "네이버플레이스": ["📸 수업 현장+교재 사진", "⭐ 학부모 후기 요청", "📝 커리큘럼+강사 소개"],
      "인스타그램": ["📊 성적향상 사례 카드뉴스", "🎬 수업 현장 릴스", "🎯 특강 안내 스토리"],
      "블로그": ["📖 '[지역] [과목] 학원 추천'", "💡 학습법 노하우", "📋 시즌 특강 안내"],
      "카카오톡": ["💬 월간 학습 리포트", "🎁 추천 등록 할인", "📅 학사 일정 안내"],
    }
  },
  "음식점": {
    code: "I56",
    seasons: {
      "1월": { theme: "신년 모임 예약", urgency: "mid", channels: ["네이버플레이스", "인스타그램"] },
      "2월": { theme: "발렌타인+졸업시즌", urgency: "mid", channels: ["인스타그램", "카카오톡"] },
      "3월": { theme: "봄 신메뉴 출시", urgency: "high", channels: ["인스타그램", "네이버플레이스", "블로그"] },
      "4월": { theme: "봄나들이+배달 강화", urgency: "mid", channels: ["네이버플레이스", "배달앱"] },
      "5월": { theme: "가정의달 가족외식", urgency: "high", channels: ["카카오톡", "인스타그램", "네이버플레이스"] },
      "6월": { theme: "여름 시즌메뉴", urgency: "mid", channels: ["블로그", "네이버플레이스"] },
      "7월": { theme: "여름 성수기", urgency: "high", channels: ["인스타그램", "네이버플레이스"] },
      "8월": { theme: "휴가시즌+배달 강화", urgency: "mid", channels: ["배달앱", "네이버플레이스"] },
      "9월": { theme: "가을 신메뉴+추석", urgency: "high", channels: ["카카오톡", "인스타그램", "네이버플레이스"] },
      "10월": { theme: "가을 외식 시즌", urgency: "mid", channels: ["인스타그램", "블로그"] },
      "11월": { theme: "겨울 메뉴+연말 예약", urgency: "high", channels: ["네이버플레이스", "카카오톡", "인스타그램"] },
      "12월": { theme: "연말 송년회 예약", urgency: "high", channels: ["카카오톡", "네이버플레이스", "인스타그램"] },
    },
    checks: [
      { q: "네이버 플레이스에 등록되어 있나요?", w: 15 },
      { q: "메뉴 사진이 전문적으로 찍혀 있나요?", w: 12 },
      { q: "최근 1주일 내 리뷰 답글을 달았나요?", w: 10 },
      { q: "인스타그램에 음식 사진을 올리고 있나요?", w: 10 },
      { q: "배달앱에 등록되어 있나요?", w: 8 },
      { q: "단골 고객 관리를 하고 있나요?", w: 8 },
      { q: "시즌 메뉴/이벤트를 진행하나요?", w: 10 },
      { q: "매장 사진이 최신인가요?", w: 7 },
      { q: "영업시간/휴무일 정보가 정확한가요?", w: 10 },
      { q: "주차/예약 정보를 안내하고 있나요?", w: 10 },
    ],
    templates: {
      "네이버플레이스": ["📸 시즌 메뉴 사진 업데이트", "⭐ 방문 고객 리뷰 이벤트", "📝 매장 정보 최적화"],
      "인스타그램": ["🎬 조리 과정 릴스", "📊 인기메뉴 TOP3 카드뉴스", "🎯 시즌 할인 스토리"],
      "블로그": ["📖 '[지역] 맛집' 포스팅", "💡 셰프 레시피 스토리", "📋 단체예약 안내"],
      "카카오톡": ["💬 시즌 쿠폰 발송", "🎁 생일 혜택 안내", "📅 이번 주 특선 안내"],
    }
  },
  "카페": {
    code: "I56",
    seasons: {
      "1월": { theme: "신년 시즌 음료", urgency: "mid", channels: ["인스타그램", "네이버플레이스"] },
      "2월": { theme: "발렌타인 기획", urgency: "high", channels: ["인스타그램", "카카오톡"] },
      "3월": { theme: "봄 시즌 메뉴", urgency: "high", channels: ["인스타그램", "네이버플레이스", "블로그"] },
      "4월": { theme: "벚꽃 시즌 이벤트", urgency: "high", channels: ["인스타그램", "네이버플레이스"] },
      "5월": { theme: "가정의달 기프트", urgency: "mid", channels: ["카카오톡", "인스타그램"] },
      "6월": { theme: "여름 아이스 음료", urgency: "high", channels: ["인스타그램", "네이버플레이스"] },
      "7월": { theme: "여름 성수기", urgency: "high", channels: ["인스타그램", "배달앱"] },
      "8월": { theme: "휴가시즌 배달", urgency: "mid", channels: ["배달앱", "네이버플레이스"] },
      "9월": { theme: "가을 시즌 메뉴", urgency: "high", channels: ["인스타그램", "블로그"] },
      "10월": { theme: "할로윈 이벤트", urgency: "mid", channels: ["인스타그램"] },
      "11월": { theme: "겨울 시즌 음료", urgency: "high", channels: ["인스타그램", "네이버플레이스"] },
      "12월": { theme: "연말 기프트+굿즈", urgency: "high", channels: ["인스타그램", "카카오톡", "네이버플레이스"] },
    },
    checks: [
      { q: "네이버 플레이스에 등록되어 있나요?", w: 15 },
      { q: "음료/디저트 사진이 감성적인가요?", w: 12 },
      { q: "인스타그램을 주 3회 이상 올리나요?", w: 12 },
      { q: "시즌 음료를 정기 출시하나요?", w: 10 },
      { q: "매장 인테리어 사진이 최신인가요?", w: 8 },
      { q: "리뷰 답글을 정기적으로 다나요?", w: 8 },
      { q: "단골 프로그램(스탬프 등)이 있나요?", w: 8 },
      { q: "배달앱에 등록되어 있나요?", w: 7 },
      { q: "Wi-Fi/콘센트 등 편의정보를 안내하나요?", w: 10 },
      { q: "주차/위치 안내가 명확한가요?", w: 10 },
    ],
    templates: {
      "네이버플레이스": ["📸 시즌 음료 사진", "⭐ 리뷰 이벤트", "📝 메뉴판 최적화"],
      "인스타그램": ["🎬 음료 제조 릴스", "📊 이달의 추천 카드뉴스", "🎯 시즌 이벤트 스토리"],
      "블로그": ["📖 '[지역] 카페 추천'", "💡 원두/레시피 스토리", "📋 시즌 메뉴 안내"],
      "카카오톡": ["💬 시즌 쿠폰", "🎁 생일 무료 음료", "📅 이번 주 이벤트"],
    }
  },
  "미용실": {
    code: "S96",
    seasons: {
      "1월": { theme: "신년 이미지 변신", urgency: "high", channels: ["인스타그램", "네이버플레이스"] },
      "2월": { theme: "졸업/입학 헤어", urgency: "high", channels: ["인스타그램", "블로그", "네이버플레이스"] },
      "3월": { theme: "봄 트렌드 스타일", urgency: "high", channels: ["인스타그램", "네이버플레이스"] },
      "4월": { theme: "봄 컬러 시즌", urgency: "mid", channels: ["인스타그램", "블로그"] },
      "5월": { theme: "웨딩/가정의달", urgency: "mid", channels: ["인스타그램", "카카오톡"] },
      "6월": { theme: "여름 헤어 관리", urgency: "mid", channels: ["블로그", "인스타그램"] },
      "7월": { theme: "여름 스타일 변신", urgency: "mid", channels: ["인스타그램", "네이버플레이스"] },
      "8월": { theme: "2학기/가을 준비", urgency: "mid", channels: ["인스타그램"] },
      "9월": { theme: "가을 컬러 시즌", urgency: "high", channels: ["인스타그램", "네이버플레이스", "블로그"] },
      "10월": { theme: "가을 트렌드", urgency: "mid", channels: ["인스타그램", "블로그"] },
      "11월": { theme: "연말 파티 스타일", urgency: "high", channels: ["인스타그램", "네이버플레이스"] },
      "12월": { theme: "연말+신년 스타일", urgency: "high", channels: ["인스타그램", "카카오톡", "네이버플레이스"] },
    },
    checks: [
      { q: "네이버 플레이스에 등록되어 있나요?", w: 15 },
      { q: "시술 전후 사진을 올리고 있나요?", w: 12 },
      { q: "인스타그램을 주 3회 이상 올리나요?", w: 12 },
      { q: "네이버 예약 시스템을 쓰고 있나요?", w: 10 },
      { q: "디자이너별 포트폴리오가 있나요?", w: 8 },
      { q: "리뷰 답글을 정기적으로 다나요?", w: 10 },
      { q: "시즌 할인/이벤트를 진행하나요?", w: 8 },
      { q: "가격표가 온라인에 공개되어 있나요?", w: 8 },
      { q: "재방문 혜택(쿠폰 등)이 있나요?", w: 7 },
      { q: "매장 인테리어 사진이 최신인가요?", w: 10 },
    ],
    templates: {
      "네이버플레이스": ["📸 시술 전후 사진", "⭐ 방문 후기 요청", "📝 디자이너+가격 최적화"],
      "인스타그램": ["🎬 시술 과정 릴스", "📊 트렌드 스타일 카드뉴스", "🎯 시즌 할인 스토리"],
      "블로그": ["📖 '[지역] 미용실 추천'", "💡 헤어 관리 팁", "📋 시즌 트렌드 안내"],
      "카카오톡": ["💬 재방문 쿠폰", "🎁 생일 할인", "📅 예약 리마인드"],
    }
  }
};

const AREA_TYPES = {
  "역세권": { desc: "유동인구 多, 경쟁 치열", strategy: "차별화+리뷰 관리 최우선" },
  "주거밀집": { desc: "단골 확보 유리, 입소문 중요", strategy: "카카오톡+추천인 이벤트" },
  "학원가": { desc: "학부모 타겟, 시즌 변동", strategy: "블로그 SEO+커뮤니티 침투" },
  "오피스": { desc: "직장인 타겟, 점심·저녁", strategy: "플레이스 최적화+배달앱" },
  "상가밀집": { desc: "경쟁 치열, 가격 민감", strategy: "이벤트+가격 경쟁력 어필" },
};

const MONTHS_KR = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const NOW = new Date();
const CUR_MONTH = MONTHS_KR[NOW.getMonth()];

function getScore(ans, checks) {
  let t = 0, m = 0;
  checks.forEach((c, i) => { m += c.w; if (ans[i]) t += c.w; });
  return Math.round((t / m) * 100);
}

function getGrade(s) {
  if (s >= 80) return { g: "A", c: "#059669", l: "우수", m: "기본기 탄탄. 콘텐츠 품질과 전환율에 집중하세요." };
  if (s >= 60) return { g: "B", c: "#2563EB", l: "양호", m: "빈 채널을 채우고 콘텐츠 주기를 만들어야 합니다." };
  if (s >= 40) return { g: "C", c: "#F59E0B", l: "보통", m: "네이버플레이스부터 정비하고 1개 채널에 집중하세요." };
  return { g: "D", c: "#DC2626", l: "위험", m: "즉시 네이버플레이스 등록+기본 정보 정비가 필요합니다." };
}

function matchFunding(info) {
  const age = info.bizYears || 3;
  return FUNDING_DB.filter(f => {
    if (f.bizAge && (age < f.bizAge[0] || age > f.bizAge[1])) return false;
    if (f.region && !info.location?.includes("서울")) return false;
    return true;
  }).sort((a, b) => a.priority - b.priority);
}

// ============================================================
// COMPONENTS
// ============================================================

function Header({ onReset }) {
  return (
    <div style={{ background: "white", borderBottom: "1px solid #E5E7EB", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, background: "#0B3D91", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 15, fontWeight: 900 }}>T</div>
        <span style={{ fontSize: 17, fontWeight: 800, color: "#0B3D91" }}>틴트랩</span>
        <span style={{ fontSize: 10, color: "#9CA3AF", padding: "2px 6px", background: "#F3F4F6", borderRadius: 4 }}>AI 통합분석</span>
      </div>
      <button onClick={onReset} style={{ fontSize: 11, color: "#6B7280", background: "none", border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>처음부터</button>
    </div>
  );
}

function Progress({ step, labels }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
      {labels.map((l, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ height: 4, background: i <= step ? "#0B3D91" : "#E5E7EB", borderRadius: i === 0 ? "4px 0 0 4px" : i === labels.length - 1 ? "0 4px 4px 0" : 0 }} />
          <div style={{ fontSize: 10, marginTop: 5, color: i <= step ? "#0B3D91" : "#C9CDD3", fontWeight: i === step ? 700 : 400 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

// Step 1: 사업자 정보 입력
function StepBizInfo({ info, setInfo, onNext }) {
  const industries = Object.keys(INDUSTRY_DB);
  const complete = info.name && info.industry && info.location && info.areaType;
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>사업장 정보를 입력하세요</h2>
      <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 20 }}>사업자등록증 기반으로 자금조달·마케팅·경영 통합 분석을 제공합니다.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={lbl}>사업자등록번호 (선택)</label>
          <input value={info.bizNo || ""} onChange={e => setInfo({...info, bizNo: e.target.value})} placeholder="000-00-00000" style={inp} />
          <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>* 입력 시 국세청 API로 사업 상태 자동 확인</div>
        </div>
        <div>
          <label style={lbl}>상호명 *</label>
          <input value={info.name || ""} onChange={e => setInfo({...info, name: e.target.value})} placeholder="예: 강서비룡태권도" style={inp} />
        </div>
        <div>
          <label style={lbl}>업종 *</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {industries.map(ind => (
              <button key={ind} onClick={() => setInfo({...info, industry: ind})} style={{
                padding: "10px 8px", border: info.industry === ind ? "2px solid #0B3D91" : "1.5px solid #E5E7EB",
                borderRadius: 8, background: info.industry === ind ? "#EEF2FF" : "white",
                fontSize: 13, fontWeight: info.industry === ind ? 700 : 400, cursor: "pointer"
              }}>{ind}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={lbl}>소재지 (동 단위) *</label>
          <input value={info.location || ""} onChange={e => setInfo({...info, location: e.target.value})} placeholder="예: 서울시 강서구 내발산동" style={inp} />
        </div>
        <div>
          <label style={lbl}>상권 유형 *</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {Object.entries(AREA_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setInfo({...info, areaType: k})} style={{
                padding: "10px", border: info.areaType === k ? "2px solid #0B3D91" : "1.5px solid #E5E7EB",
                borderRadius: 8, background: info.areaType === k ? "#EEF2FF" : "white", cursor: "pointer", textAlign: "left"
              }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{k}</div>
                <div style={{ fontSize: 10, color: "#6B7280" }}>{v.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={lbl}>사업 업력 (년)</label>
            <input type="number" value={info.bizYears || ""} onChange={e => setInfo({...info, bizYears: parseInt(e.target.value) || 0})} placeholder="3" style={inp} />
          </div>
          <div>
            <label style={lbl}>법인/개인</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["법인", "개인"].map(t => (
                <button key={t} onClick={() => setInfo({...info, bizType: t})} style={{
                  flex: 1, padding: "10px", border: info.bizType === t ? "2px solid #0B3D91" : "1.5px solid #E5E7EB",
                  borderRadius: 8, background: info.bizType === t ? "#EEF2FF" : "white", fontSize: 13, fontWeight: info.bizType === t ? 700 : 400, cursor: "pointer"
                }}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label style={lbl}>보유 인증 (해당 항목 선택)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["여성기업", "소셜벤처", "예비사회적기업", "벤처기업", "이노비즈", "없음"].map(cert => (
              <button key={cert} onClick={() => {
                const certs = info.certs || [];
                setInfo({...info, certs: certs.includes(cert) ? certs.filter(c => c !== cert) : [...certs.filter(c => c !== "없음"), cert === "없음" ? cert : cert].filter(c => cert === "없음" ? c === "없음" : c !== "없음")});
              }} style={{
                padding: "6px 12px", border: (info.certs || []).includes(cert) ? "2px solid #0B3D91" : "1.5px solid #E5E7EB",
                borderRadius: 20, background: (info.certs || []).includes(cert) ? "#EEF2FF" : "white",
                fontSize: 11, fontWeight: (info.certs || []).includes(cert) ? 700 : 400, cursor: "pointer"
              }}>{cert}</button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={onNext} disabled={!complete} style={{ ...btn, marginTop: 20, background: complete ? "#0B3D91" : "#D1D5DB" }}>
        다음 → 마케팅 현황 진단
      </button>
    </div>
  );
}

// Step 2: 체크리스트
function StepChecklist({ industry, onComplete }) {
  const [ans, setAns] = useState({});
  const checks = INDUSTRY_DB[industry].checks;
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>마케팅 현황 진단</h2>
      <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>해당 항목을 체크하세요. 미체크 항목이 개선 포인트입니다.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {checks.map((c, i) => (
          <button key={i} onClick={() => setAns(p => ({...p, [i]: !p[i]}))} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
            border: ans[i] ? "1.5px solid #059669" : "1.5px solid #E5E7EB",
            borderRadius: 8, background: ans[i] ? "#F0FDF4" : "white", cursor: "pointer", textAlign: "left"
          }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
              border: ans[i] ? "none" : "2px solid #D1D5DB", background: ans[i] ? "#059669" : "white", color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0
            }}>{ans[i] ? "✓" : ""}</div>
            <span style={{ fontSize: 12.5 }}>{c.q}</span>
          </button>
        ))}
      </div>
      <button onClick={() => onComplete(ans)} style={{ ...btn, marginTop: 20 }}>진단 완료 → AI 통합분석 시작</button>
    </div>
  );
}

// Step 3: 분석 중
function StepAnalyzing({ onDone }) {
  const [p, setP] = useState(0);
  const steps = ["사업자 정보 확인...", "상권 데이터 수집...", "경쟁업체 분석...", "2026년 정부지원사업 매칭...", "업종 시즌성 분석...", "마케팅 플랜 설계...", "자금조달 가이드 생성...", "통합 리포트 완성!"];
  useEffect(() => {
    const t = setInterval(() => { setP(prev => { if (prev >= steps.length - 1) { clearInterval(t); setTimeout(onDone, 500); return prev; } return prev + 1; }); }, 450);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign: "center", padding: "50px 0" }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>🧠</div>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>AI 통합분석 중</h2>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 28 }}>{steps[p]}</p>
      <div style={{ width: "100%", height: 6, background: "#E5E7EB", borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ width: `${((p + 1) / steps.length) * 100}%`, height: "100%", background: "linear-gradient(90deg,#0B3D91,#2563EB)", borderRadius: 3, transition: "width 0.3s" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 280, margin: "0 auto", textAlign: "left" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ fontSize: 11, color: i <= p ? "#059669" : "#D1D5DB" }}>{i <= p ? "✅" : "⬜"} {s}</div>
        ))}
      </div>
    </div>
  );
}

// Step 4: 통합 결과 리포트
function StepResult({ info, answers }) {
  const [tab, setTab] = useState("funding");
  const data = INDUSTRY_DB[info.industry];
  const score = getScore(answers, data.checks);
  const grade = getGrade(score);
  const season = data.seasons[CUR_MONTH];
  const funding = matchFunding(info);
  const competitors = 5 + Math.floor(Math.random() * 10);

  const tabs = [
    { id: "funding", label: "💰 자금조달 가이드", count: funding.length },
    { id: "marketing", label: "📊 마케팅 가이드" },
    { id: "content", label: "✍️ 콘텐츠 플랜" },
    { id: "action", label: "✅ 실행 체크리스트" },
  ];

  return (
    <div>
      {/* Header Card */}
      <div style={{ background: "linear-gradient(135deg,#0B3D91,#1E40AF)", borderRadius: 14, padding: "22px 24px", color: "white", marginBottom: 20 }}>
        <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>AI 통합분석 리포트</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 3 }}>{info.name}</h2>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{info.location} · {info.areaType} · {info.industry} · {info.bizType || "법인"} · {info.bizYears || 3}년차</div>
            {info.certs?.length > 0 && info.certs[0] !== "없음" && (
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                {info.certs.map(c => <span key={c} style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255,255,255,0.2)", borderRadius: 10 }}>{c}</span>)}
              </div>
            )}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{grade.g}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>마케팅 등급</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
          {[
            { label: "마케팅 점수", value: `${score}/100` },
            { label: "매칭 지원사업", value: `${funding.length}건` },
            { label: "동종 경쟁", value: `${competitors}개소` },
            { label: "이달 마케팅", value: season.urgency === "high" ? "🔴 최우선" : "🟡 중요" },
          ].map((item, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 10, opacity: 0.7 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 3, marginBottom: 16, background: "#F3F4F6", padding: 3, borderRadius: 10 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "9px 6px", border: "none", borderRadius: 8,
            background: tab === t.id ? "white" : "transparent", color: tab === t.id ? "#0B3D91" : "#6B7280",
            fontWeight: tab === t.id ? 700 : 400, fontSize: 11.5, cursor: "pointer",
            boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
          }}>{t.label}{t.count ? ` (${t.count})` : ""}</button>
        ))}
      </div>

      {/* === 자금조달 가이드 === */}
      {tab === "funding" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: "12px 16px", background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 10, fontSize: 12, color: "#92400E" }}>
            💡 <strong>{info.name}</strong>의 업종·업력·인증을 기반으로 <strong>{funding.length}개</strong> 지원사업을 매칭했습니다. 우선순위가 높은 순으로 정렬되어 있습니다.
          </div>
          {funding.map((f, i) => (
            <div key={f.id} style={{ border: i < 3 ? "2px solid #0B3D91" : "1.5px solid #E5E7EB", borderRadius: 12, padding: "16px 18px", background: i < 3 ? "#FAFBFF" : "white", position: "relative" }}>
              {i < 3 && <div style={{ position: "absolute", top: -1, right: 16, background: "#0B3D91", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: "0 0 6px 6px" }}>추천 {i + 1}순위</div>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "#6B7280" }}>{f.org}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0B3D91" }}>{f.amount}</div>
                  <div style={{ fontSize: 10, color: "#9CA3AF" }}>{f.type}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                <span style={tag}>{f.period}</span>
                <span style={tag}>{f.target}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "#374151", background: "#F9FAFB", padding: "10px 12px", borderRadius: 8, lineHeight: 1.6 }}>
                <strong>💡 팁:</strong> {f.tip}
              </div>
            </div>
          ))}
          <div style={{ padding: "16px", background: "linear-gradient(135deg,#EEF2FF,#F0FDF4)", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0B3D91", marginBottom: 4 }}>📋 맞춤 사업계획서가 필요하신가요?</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>틴트랩의 컨설턴트가 1:1로 사업계획서를 작성해드립니다.</div>
            <a href="http://pf.kakao.com/_uxcbwxj" target="_blank" rel="noopener" style={{ display: "inline-block", padding: "10px 28px", background: "#0B3D91", color: "white", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>카카오톡 상담 신청</a>
          </div>
        </div>
      )}

      {/* === 마케팅 가이드 === */}
      {tab === "marketing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Score */}
          <div style={{ border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "18px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>마케팅 진단 결과</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, height: 10, background: "#E5E7EB", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ width: `${score}%`, height: "100%", background: grade.c, borderRadius: 5 }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: grade.c }}>{score}</div>
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 8, padding: "8px 12px", background: "#F9FAFB", borderRadius: 6 }}>💡 {grade.m}</div>
          </div>

          {/* This Month Plan */}
          <div style={{ border: "2px solid #0B3D91", borderRadius: 12, padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: "#0B3D91", fontWeight: 700 }}>📅 {CUR_MONTH} 마케팅 플랜</div>
                <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2 }}>{season.theme}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{season.urgency === "high" ? "🔴 최우선" : "🟡 중요"}</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {season.channels.map(ch => <span key={ch} style={{ ...tag, background: "#EEF2FF", borderColor: "#C7D2FE", color: "#3730A3" }}>{ch}</span>)}
            </div>
            <div style={{ fontSize: 12, color: "#374151", background: "#F9FAFB", padding: 12, borderRadius: 8, lineHeight: 1.8 }}>
              <strong>AI 추천 실행 순서:</strong><br />
              1️⃣ 네이버플레이스 {season.theme} 관련 사진·정보 업데이트<br />
              2️⃣ {season.channels[0]}에 시즌 콘텐츠 3건 게시<br />
              3️⃣ 기존 고객 대상 카카오톡 안내 발송<br />
              4️⃣ 2주 후 성과 체크 → 보완
            </div>
          </div>

          {/* Weak Points */}
          <div style={{ border: "1.5px solid #FCA5A5", borderRadius: 12, padding: "16px", background: "#FEF2F2" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>⚠️ 즉시 개선 필요</div>
            {data.checks.filter((_, i) => !answers[i]).slice(0, 4).map((c, i) => (
              <div key={i} style={{ fontSize: 12, color: "#7F1D1D", padding: "5px 0", borderBottom: "1px solid #FECACA", display: "flex", justifyContent: "space-between" }}>
                <span>❌ {c.q}</span><span style={{ fontSize: 11, fontWeight: 600 }}>-{c.w}점</span>
              </div>
            ))}
          </div>

          {/* 12-Month Calendar */}
          <div style={{ border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📊 연간 마케팅 캘린더</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
              {MONTHS_KR.map(m => {
                const s = data.seasons[m];
                const cur = m === CUR_MONTH;
                return (
                  <div key={m} style={{ padding: "6px 8px", borderRadius: 6, fontSize: 10,
                    background: cur ? "#0B3D91" : s.urgency === "high" ? "#FEF2F2" : "#F9FAFB",
                    color: cur ? "white" : "#374151", border: cur ? "none" : "1px solid #E5E7EB"
                  }}>
                    <div style={{ fontWeight: 700 }}>{m} {cur ? "◀" : ""}</div>
                    <div style={{ marginTop: 1, opacity: 0.8, lineHeight: 1.2 }}>{s.theme.slice(0, 10)}..</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* === 콘텐츠 플랜 === */}
      {tab === "content" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {season.channels.map(ch => (
            <div key={ch} style={{ border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{ch} — {CUR_MONTH} 추천 콘텐츠</div>
              {(data.templates[ch] || []).map((tpl, i) => (
                <div key={i} style={{ padding: "10px 12px", background: "#F9FAFB", borderRadius: 6, marginBottom: 6, fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{tpl.replace("[지역명]", info.location?.split(" ").pop() || "").replace("[지역]", info.location?.split(" ").pop() || "").replace("[업종]", info.industry).replace("[과목]", "국어")}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", background: "#EEF2FF", borderRadius: 10, color: "#3730A3", fontWeight: 600, whiteSpace: "nowrap" }}>가이드</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#B45309" }}>💡 AI 콘텐츠 자동생성 미리보기</div>
            <div style={{ fontSize: 12, color: "#78350F", marginTop: 8, background: "white", padding: 12, borderRadius: 8, border: "1px solid #FDE68A", lineHeight: 1.7 }}>
              <strong>[{info.name}] {CUR_MONTH} 블로그 포스팅 초안</strong><br /><br />
              제목: "{info.location?.split(" ").pop()} {info.industry} 추천 | {info.name}에서 {season.theme}"<br /><br />
              ✅ 도입: 계절감 + 고객 니즈 공감<br />
              ✅ 본문: 프로그램/메뉴 상세 + 사진 3장 이상<br />
              ✅ 마무리: 예약/방문 CTA + 네이버플레이스 링크<br /><br />
              <span style={{ fontSize: 11, color: "#0B3D91", fontWeight: 600 }}>🔒 전체 자동생성은 Pro 구독에서 제공</span>
            </div>
          </div>
        </div>
      )}

      {/* === 실행 체크리스트 === */}
      {tab === "action" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>이번 달 우선 실행 항목입니다. 위에서부터 순서대로 진행하세요.</div>
          
          <div style={{ fontSize: 13, fontWeight: 700, color: "#DC2626", marginTop: 4 }}>🔴 즉시 실행 (이번 주)</div>
          {[
            `네이버플레이스에 ${season.theme} 관련 사진 3장 업로드`,
            "플레이스 영업시간·메뉴/프로그램 정보 최신화",
            `${season.channels[0]}에 시즌 콘텐츠 1건 게시`,
          ].map((t, i) => <ActionItem key={i} text={t} />)}

          <div style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B", marginTop: 8 }}>🟡 이번 달 내 실행</div>
          {[
            "기존 고객 대상 카카오톡 시즌 안내 발송",
            `블로그에 '${info.location?.split(" ").pop()} ${info.industry} 추천' 포스팅`,
            "고객 리뷰 3건 이상 요청",
          ].map((t, i) => <ActionItem key={i} text={t} />)}

          <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginTop: 8 }}>💰 자금조달 액션</div>
          {funding.slice(0, 3).map((f, i) => <ActionItem key={i} text={`${f.name} 신청 준비 (${f.period})`} />)}

          <div style={{ marginTop: 12, padding: "14px", background: "linear-gradient(135deg,#0B3D91,#7C3AED)", borderRadius: 12, textAlign: "center", color: "white" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>매월 자동으로 받아보세요</div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 12 }}>자금조달 가이드 + 마케팅 플랜 + 콘텐츠 + 실행 체크리스트</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {[
                { plan: "Basic", price: "3.9만", desc: "플랜+콘텐츠 5건" },
                { plan: "Pro ⭐", price: "9.9만", desc: "무제한+대시보드" },
                { plan: "Enterprise", price: "29만", desc: "+1:1 컨설팅" },
              ].map(p => (
                <div key={p.plan} style={{ flex: 1, maxWidth: 150, background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{p.plan}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>월 {p.price}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div style={{ marginTop: 24, textAlign: "center", padding: "16px", background: "#F9FAFB", borderRadius: 12, border: "1.5px solid #E5E7EB" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>더 자세한 맞춤 분석이 필요하신가요?</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <a href="http://pf.kakao.com/_uxcbwxj" target="_blank" rel="noopener" style={{ padding: "10px 24px", background: "#FEE500", color: "#3C1E1E", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>💬 카카오톡 상담</a>
          <a href="https://www.band.us/band/56652519/post" target="_blank" rel="noopener" style={{ padding: "10px 24px", background: "#0B3D91", color: "white", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>📢 정부지원사업 소식</a>
        </div>
        <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 8 }}>© 2026 틴트랩 by (주)틴트레이닝. All rights reserved.</div>
      </div>
    </div>
  );
}

function ActionItem({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 8, background: "white" }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, border: "2px solid #D1D5DB", flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: "#374151" }}>{text}</span>
    </div>
  );
}

// Shared styles
const lbl = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 };
const inp = { width: "100%", padding: "10px 14px", border: "1.5px solid #D1D5DB", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };
const btn = { width: "100%", padding: "14px", background: "#0B3D91", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" };
const tag = { padding: "4px 10px", background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 16, fontSize: 10, fontWeight: 500 };

// ============================================================
// MAIN APP
// ============================================================
export default function TintLabV2() {
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({ bizYears: 3, bizType: "법인", certs: [] });
  const [answers, setAnswers] = useState({});

  const reset = () => { setStep(0); setInfo({ bizYears: 3, bizType: "법인", certs: [] }); setAnswers({}); };
  const labels = ["사업장 정보", "마케팅 진단", "AI 분석", "통합 리포트"];

  // Google Sheets 연동 (배포 시 Apps Script URL로 교체)
  const saveToSheet = async (data) => {
    const SHEET_URL = "YOUR_GOOGLE_APPS_SCRIPT_URL"; // 배포 시 교체
    try {
      if (SHEET_URL.includes("YOUR_")) return; // 개발 중에는 스킵
      await fetch(SHEET_URL, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          ...data
        })
      });
    } catch (e) { console.log("Sheet save skipped:", e); }
  };

  const handleCheckDone = (ans) => {
    setAnswers(ans);
    const score = getScore(ans, INDUSTRY_DB[info.industry].checks);
    // Save to Google Sheets
    saveToSheet({
      name: info.name, industry: info.industry, location: info.location,
      areaType: info.areaType, bizYears: info.bizYears, bizType: info.bizType,
      certs: (info.certs || []).join(","), score, grade: getGrade(score).g,
      bizNo: info.bizNo || ""
    });
    setStep(2);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", fontFamily: "'Noto Sans KR',-apple-system,sans-serif" }}>
      <Header onReset={reset} />
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 16px" }}>
        {step < 3 && <Progress step={step} labels={labels} />}
        {step === 0 && <StepBizInfo info={info} setInfo={setInfo} onNext={() => setStep(1)} />}
        {step === 1 && <StepChecklist industry={info.industry} onComplete={handleCheckDone} />}
        {step === 2 && <StepAnalyzing onDone={() => setStep(3)} />}
        {step === 3 && <StepResult info={info} answers={answers} />}
      </div>
    </div>
  );
}
