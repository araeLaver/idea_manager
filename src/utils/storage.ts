import type { Idea, IdeaFormData } from '../types';

const STORAGE_KEY = 'ideas';

const sampleIdeas: Idea[] = [
  {
    id: '1',
    title: '음식 배달 로봇 서비스',
    description: '자율주행 로봇을 이용한 음식 배달 서비스. 아파트 단지 내에서 음식점에서 고객의 집까지 무인으로 배달하는 시스템입니다. GPS와 AI 기반 경로 최적화를 통해 효율적인 배달을 제공합니다.',
    category: '로보틱스',
    tags: ['로봇', '배달', 'AI', '자율주행', '푸드테크'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    targetMarket: '아파트 거주자, 음식점 사장, 배달업체',
    potentialRevenue: '월 구독료 모델: 개인 월 9,900원, 음식점 월 199,000원',
    resources: '로봇 하드웨어 개발팀 5명, 소프트웨어 개발팀 8명, 초기 자본 50억원',
    timeline: '프로토타입 6개월, 베타 테스트 3개월, 상용화 1년',
    notes: '규제 이슈와 안전성 확보가 핵심. 소형 아파트 단지부터 시작하여 점진적 확장 전략 필요.'
  },
  {
    id: '2',
    title: 'VR 부동산 투어 플랫폼',
    description: 'VR 기술을 활용하여 집에서도 실제와 같은 부동산 투어를 경험할 수 있는 플랫폼. 360도 촬영과 3D 모델링을 통해 생생한 가상 투어를 제공합니다.',
    category: '부동산테크',
    tags: ['VR', '부동산', '3D', '가상현실', '투어'],
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
    targetMarket: '부동산 중개업소, 건설사, 해외 거주 투자자',
    potentialRevenue: '월 SaaS 구독료 + 프리미엄 투어 건당 수수료',
    resources: 'VR 개발팀 6명, 3D 아티스트 4명, 영업팀 3명',
    timeline: 'MVP 4개월, 파트너십 구축 2개월, 정식 런칭 6개월',
    notes: '코로나19로 인한 비대면 수요 증가. 해외 투자자들에게 특히 유용할 것으로 예상.'
  },
  {
    id: '3',
    title: 'AI 기반 개인 영양사 앱',
    description: '사용자의 건강 상태, 운동량, 식습관을 분석하여 개인 맞춤형 식단과 영양 관리 솔루션을 제공하는 AI 앱. 사진만 찍으면 칼로리와 영양성분을 자동 분석합니다.',
    category: '헬스케어',
    tags: ['AI', '영양', '건강', '식단', '맞춤형'],
    status: 'completed',
    priority: 'high',
    createdAt: '2023-12-05T16:45:00Z',
    updatedAt: '2024-02-01T11:30:00Z',
    targetMarket: '건강 관심층, 다이어터, 운동인, 만성질환자',
    potentialRevenue: '프리미엄 구독료 월 12,900원, 영양사 상담 건당 30,000원',
    resources: 'AI 엔지니어 4명, 영양사 2명, 앱 개발자 5명',
    timeline: '이미 런칭 완료, 사용자 확대 단계',
    notes: '현재 DAU 15,000명, 월간 성장률 25%. 병원과의 B2B 파트너십 추진 중.'
  },
  {
    id: '4',
    title: '스마트 화분 IoT 시스템',
    description: '식물의 수분, 영양, 조도 상태를 실시간으로 모니터링하고 자동으로 관리해주는 스마트 화분. 앱을 통해 원격 모니터링 및 제어가 가능합니다.',
    category: 'IoT',
    tags: ['IoT', '스마트팜', '식물', '자동화', '센서'],
    status: 'draft',
    priority: 'low',
    createdAt: '2024-01-25T13:10:00Z',
    updatedAt: '2024-01-25T13:10:00Z',
    targetMarket: '식물 애호가, 바쁜 직장인, 카페/사무실',
    potentialRevenue: '하드웨어 판매 + 구독 서비스 (센서 데이터 분석)',
    resources: '하드웨어 엔지니어 3명, 앱 개발자 2명, 초기 투자 2억원',
    timeline: '프로토타입 4개월, 양산 준비 6개월',
    notes: '시장 규모가 제한적일 수 있음. B2B 시장(카페, 사무실) 중심으로 접근 고려.'
  },
  {
    id: '5',
    title: '중고 명품 진품 인증 플랫폼',
    description: 'AI와 블록체인 기술을 활용한 중고 명품의 진품 인증 서비스. 전문가 감정과 AI 분석을 결합하여 95% 이상의 정확도로 진품을 판별합니다.',
    category: '이커머스',
    tags: ['블록체인', 'AI', '명품', '진품인증', 'C2C'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-08T09:20:00Z',
    updatedAt: '2024-01-28T14:45:00Z',
    targetMarket: '명품 애호가, 중고 거래자, 리셀러',
    potentialRevenue: '인증 수수료 건당 50,000원, 거래 수수료 5%',
    resources: 'AI 개발자 5명, 블록체인 개발자 3명, 명품 감정사 10명',
    timeline: '베타 서비스 3개월, 정식 서비스 6개월',
    notes: '가짜 명품 시장 규모 확대로 수요 증가. 해외 진출 가능성도 높음.'
  },
  {
    id: '6',
    title: '메타버스 교육 플랫폼',
    description: '가상 공간에서 실시간으로 교육을 진행할 수 있는 메타버스 플랫폼. 3D 아바타를 통한 상호작용과 가상 실습실을 제공합니다.',
    category: '에듀테크',
    tags: ['메타버스', '교육', 'VR', '온라인학습', '3D'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-02-05T15:30:00Z',
    targetMarket: '교육기관, 기업 연수, 온라인 학습자',
    potentialRevenue: 'B2B 라이선스 + B2C 구독 모델',
    resources: '3D 개발팀 8명, 교육 콘텐츠팀 5명',
    timeline: '베타 버전 3개월, 정식 출시 6개월',
    notes: '코로나 이후 비대면 교육 수요 지속. 실감나는 실습 환경 제공이 차별점.'
  },
  {
    id: '7',
    title: '친환경 패키징 솔루션',
    description: '생분해 가능한 소재를 활용한 친환경 패키징 개발 및 공급. 기업의 ESG 경영을 지원하는 컨설팅 서비스도 제공합니다.',
    category: '환경',
    tags: ['친환경', 'ESG', '패키징', '지속가능성', '재활용'],
    status: 'completed',
    priority: 'medium',
    createdAt: '2023-11-20T09:15:00Z',
    updatedAt: '2024-01-30T10:20:00Z',
    targetMarket: '이커머스 기업, 식품 제조업체, 화장품 브랜드',
    potentialRevenue: '패키징 공급 + ESG 컨설팅 수수료',
    resources: '소재 연구팀 4명, 생산팀 6명, 영업팀 3명',
    timeline: '이미 상용화 완료, 대량 생산 체제 구축 중',
    notes: 'ESG 규제 강화로 수요 급증. 대기업 파트너십 체결 완료.'
  },
  {
    id: '8',
    title: 'AI 코드 리뷰 자동화 도구',
    description: '개발자의 코드를 자동으로 분석하여 버그, 보안 취약점, 코드 품질 이슈를 찾아내는 AI 기반 도구입니다.',
    category: '개발도구',
    tags: ['AI', '코드리뷰', 'DevOps', '자동화', '품질관리'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-22T14:30:00Z',
    updatedAt: '2024-02-03T09:45:00Z',
    targetMarket: 'IT 기업, 개발팀, 프리랜서 개발자',
    potentialRevenue: '팀 라이선스 월 299,000원, 엔터프라이즈 커스텀 가격',
    resources: 'AI 엔지니어 6명, 풀스택 개발자 4명',
    timeline: 'MVP 2개월, 베타 테스트 2개월, 정식 출시 4개월',
    notes: 'GitHub, GitLab 통합 완료. VS Code 확장 프로그램 개발 중.'
  },
  {
    id: '9',
    title: '원격 의료 상담 플랫폼',
    description: '환자와 의사를 연결하는 비대면 진료 플랫폼. AI 증상 분석과 전자 처방전 발급 기능을 포함합니다.',
    category: '헬스케어',
    tags: ['원격의료', 'AI', '헬스케어', '비대면진료', '처방전'],
    status: 'draft',
    priority: 'high',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
    targetMarket: '만성질환자, 거동불편자, 의료기관',
    potentialRevenue: '진료 수수료 중개 + 프리미엄 서비스',
    resources: '의료진 자문단, 개발팀 10명, 법무팀',
    timeline: '규제 검토 3개월, 파일럿 6개월',
    notes: '의료법 규제 확인 필요. 대형 병원과 MOU 추진 중.'
  },
  {
    id: '10',
    title: '반려동물 건강 관리 앱',
    description: '반려동물의 건강 상태를 체계적으로 관리하고, AI 기반 증상 분석과 병원 예약 서비스를 제공하는 통합 플랫폼입니다.',
    category: '펫테크',
    tags: ['반려동물', 'AI', '건강관리', '펫테크', '예방접종'],
    status: 'completed',
    priority: 'medium',
    createdAt: '2023-12-10T13:20:00Z',
    updatedAt: '2024-01-25T16:30:00Z',
    targetMarket: '반려동물 보호자, 동물병원, 펫보험사',
    potentialRevenue: '프리미엄 구독 월 14,900원, 병원 예약 수수료',
    resources: '수의사 자문 3명, 앱 개발팀 5명',
    timeline: '출시 완료, MAU 50,000명 달성',
    notes: '펫보험사와 제휴 논의 중. 웨어러블 기기 연동 계획.'
  },
  {
    id: '11',
    title: '전기차 충전소 예약 서비스',
    description: '전기차 충전소를 실시간으로 예약하고 결제할 수 있는 통합 플랫폼. 최적 경로 안내와 충전 시간 예측 기능을 제공합니다.',
    category: '모빌리티',
    tags: ['전기차', '충전소', '예약', '그린에너지', '모빌리티'],
    status: 'in-progress',
    priority: 'high',
    createdAt: '2024-01-12T08:45:00Z',
    updatedAt: '2024-02-02T11:20:00Z',
    targetMarket: '전기차 소유자, 충전소 운영업체, 자동차 제조사',
    potentialRevenue: '예약 수수료 + 프리미엄 멤버십',
    resources: '백엔드 개발팀 5명, 모바일 개발팀 4명',
    timeline: '파일럿 서비스 2개월, 전국 확대 6개월',
    notes: '주요 충전소 업체와 API 연동 완료. 테슬라 슈퍼차저 연동 협의 중.'
  },
  {
    id: '12',
    title: '지능형 재고 관리 시스템',
    description: 'AI를 활용한 수요 예측과 자동 발주 시스템. 실시간 재고 추적과 유통기한 관리 기능을 포함합니다.',
    category: '물류',
    tags: ['AI', '재고관리', '자동화', 'SCM', '예측분석'],
    status: 'draft',
    priority: 'medium',
    createdAt: '2024-01-28T15:00:00Z',
    updatedAt: '2024-01-28T15:00:00Z',
    targetMarket: '유통업체, 제조업체, 온라인 쇼핑몰',
    potentialRevenue: 'SaaS 구독 모델, 거래액 기반 수수료',
    resources: 'AI 개발팀 4명, 물류 전문가 2명',
    timeline: 'POC 3개월, 파일럿 3개월',
    notes: '대형 유통사 POC 진행 예정. ERP 시스템 연동 필수.'
  },
  {
    id: '13',
    title: '가상 인플루언서 제작 플랫폼',
    description: 'AI 기반으로 가상 인플루언서를 생성하고 운영할 수 있는 플랫폼. 자동 콘텐츠 생성과 SNS 관리 기능을 제공합니다.',
    category: '마케팅',
    tags: ['AI', '가상인플루언서', 'SNS', '마케팅', '콘텐츠'],
    status: 'in-progress',
    priority: 'low',
    createdAt: '2024-01-05T12:10:00Z',
    updatedAt: '2024-01-20T14:25:00Z',
    targetMarket: '마케팅 에이전시, 브랜드, 엔터테인먼트사',
    potentialRevenue: '제작비 + 운영 대행 수수료',
    resources: '3D 아티스트 5명, AI 개발팀 3명',
    timeline: '프로토타입 4개월, 상용화 8개월',
    notes: '메타버스 플랫폼과 연동 가능. 저작권 이슈 검토 필요.'
  },
  {
    id: '14',
    title: '스마트 주차 솔루션',
    description: 'IoT 센서와 AI를 활용한 실시간 주차 공간 탐색 및 예약 시스템. 자동 결제와 발렛 파킹 서비스도 제공합니다.',
    category: '스마트시티',
    tags: ['IoT', '주차', '스마트시티', 'AI', '자동화'],
    status: 'completed',
    priority: 'high',
    createdAt: '2023-10-15T09:30:00Z',
    updatedAt: '2024-01-15T13:40:00Z',
    targetMarket: '쇼핑몰, 공공기관, 아파트 단지',
    potentialRevenue: '설치비 + 월 운영비 + 주차 수수료',
    resources: '하드웨어팀 6명, 소프트웨어팀 5명',
    timeline: '3개 지역 설치 완료, 전국 확대 중',
    notes: '서울시 스마트시티 프로젝트 선정. 특허 3건 출원.'
  },
  {
    id: '15',
    title: '개인 맞춤형 금융 포트폴리오 AI',
    description: '개인의 재무 상황과 투자 성향을 분석하여 최적의 포트폴리오를 제안하는 로보어드바이저 서비스입니다.',
    category: '핀테크',
    tags: ['AI', '로보어드바이저', '투자', '핀테크', '자산관리'],
    status: 'archived',
    priority: 'medium',
    createdAt: '2023-09-20T11:00:00Z',
    updatedAt: '2023-12-30T09:15:00Z',
    targetMarket: '개인 투자자, 자산관리사, 금융기관',
    potentialRevenue: '운용 수수료 연 0.5%, 프리미엄 자문 서비스',
    resources: '퀀트 개발자 4명, 금융 전문가 3명',
    timeline: '규제 샌드박스 통과, 라이선스 취득 대기',
    notes: '금융위 규제 변경으로 일시 중단. 향후 재추진 예정.'
  }
];

export const storage = {
  getIdeas: (): Idea[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    } else {
      // 처음 방문 시 샘플 데이터 저장
      storage.saveIdeas(sampleIdeas);
      return sampleIdeas;
    }
  },

  saveIdeas: (ideas: Idea[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
  },

  getIdea: (id: string): Idea | null => {
    const ideas = storage.getIdeas();
    return ideas.find(idea => idea.id === id) || null;
  },

  createIdea: (ideaData: IdeaFormData): Idea => {
    const newIdea: Idea = {
      ...ideaData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    storage.addIdea(newIdea);
    return newIdea;
  },

  addIdea: (idea: Idea): void => {
    const ideas = storage.getIdeas();
    ideas.push(idea);
    storage.saveIdeas(ideas);
  },

  updateIdea: (id: string, updatedIdea: Partial<Idea>): void => {
    const ideas = storage.getIdeas();
    const index = ideas.findIndex(idea => idea.id === id);
    if (index !== -1) {
      ideas[index] = { ...ideas[index], ...updatedIdea, updatedAt: new Date().toISOString() };
      storage.saveIdeas(ideas);
    }
  },

  deleteIdea: (id: string): void => {
    const ideas = storage.getIdeas();
    const filteredIdeas = ideas.filter(idea => idea.id !== id);
    storage.saveIdeas(filteredIdeas);
  }
};