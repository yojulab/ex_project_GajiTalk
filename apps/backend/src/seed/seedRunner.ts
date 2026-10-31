import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User.model';
import { Garden } from '../models/Garden.model';
import { PruningSimulation } from '../models/PruningSimulation.model';
import { MatchingRequest } from '../models/MatchingRequest.model';
import { TreeSpecies } from '../models/TreeSpecies.model';
import { seedTreeSpecies } from './seedData';

export const runSeed = async () => {
  await connectDB();
  console.log('[Seed] Starting database seeding...');

  // 1. 기존 컬렉션 초기화
  await Promise.all([
    User.deleteMany({}),
    Garden.deleteMany({}),
    PruningSimulation.deleteMany({}),
    MatchingRequest.deleteMany({}),
    TreeSpecies.deleteMany({})
  ]);
  console.log('[Seed] Cleared existing collections.');

  // 2. 수종 도감 삽입
  const insertedSpecies = await TreeSpecies.insertMany(seedTreeSpecies);
  console.log(`[Seed] Inserted ${insertedSpecies.length} tree species.`);

  // 3. 비밀번호 공통 해싱
  const defaultPasswordHash = await bcrypt.hash('admin123', 10);

  // 4. 회원 데이터 생성 (정원주 3명, 조경사 4명, 관리자 1명)
  const users = await User.insertMany([
    // [관리자]
    {
      email: 'admin@soohyung.kr',
      passwordHash: defaultPasswordHash,
      name: '통합 총괄관리자',
      phone: '010-1234-5678',
      role: 'ADMIN',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    // [정원주 1: 양평 전원주택 김정원]
    {
      email: 'garden1@soohyung.kr',
      passwordHash: defaultPasswordHash,
      name: '김정원(양평)',
      phone: '010-9876-5432',
      role: 'GARDEN_OWNER',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    },
    // [정원주 2: 파주 카페 이가든]
    {
      email: 'garden2@soohyung.kr',
      passwordHash: defaultPasswordHash,
      name: '이가든(파주 카페)',
      phone: '010-2222-3333',
      role: 'GARDEN_OWNER',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
    },
    // [정원주 3: 성북동 박자연]
    {
      email: 'garden3@soohyung.kr',
      passwordHash: defaultPasswordHash,
      name: '박자연(성북동)',
      phone: '010-3333-4444',
      role: 'GARDEN_OWNER',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
    },
    // [조경사 1: 최송석 소나무 명인 (인증 명인)]
    {
      email: 'master_choi@soohyung.kr',
      passwordHash: defaultPasswordHash,
      name: '최송석 명인',
      phone: '010-8888-1111',
      role: 'LANDSCAPER',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      landscaperProfile: {
        companyName: '송석 조경 명인 연구소',
        experienceYears: 35,
        certifications: ['조경기술사', '문화재수리기술자(조경)', '소나무전정명인'],
        specialties: ['소나무전지', '구름형수형교정', '노거수수세회복', '명품정원설계'],
        serviceAreas: ['경기 양평군', '경기 가평군', '서울 강남구', '서울 종로구'],
        baseLocation: {
          type: 'Point',
          coordinates: [127.4875, 37.4912] // 양평 기준
        },
        verificationStatus: 'VERIFIED',
        isMasterBadge: true,
        ratingAvg: 4.98,
        reviewCount: 142,
        completedJobsCount: 230,
        portfolios: [
          {
            title: '양평 서종면 80년생 조형 적송 구름형 전지',
            treeSpecies: '소나무(적송)',
            beforeImageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80',
            afterImageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
            description: '내향지와 도장지 12개를 솎아내고 지융부를 보존하여 3단 운두 수형 완성',
            workedAt: new Date('2026-05-18')
          },
          {
            title: '성북동 대저택 반송 순집기 및 잎솎기',
            treeSpecies: '소나무(반송)',
            beforeImageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
            afterImageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
            description: '5월 촛대순 2/3 적심 및 고엽 털기 완료, 부후균 방지 유합제 도포',
            workedAt: new Date('2026-06-02')
          }
        ]
      }
    },
    // [조경사 2: 한수목 나무의사 (인증 명인)]
    {
      email: 'tree_doc_han@soohyung.kr',
      passwordHash: defaultPasswordHash,
      name: '한수목 원장',
      phone: '010-7777-2222',
      role: 'LANDSCAPER',
      profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      landscaperProfile: {
        companyName: '수목보호 나무병원',
        experienceYears: 18,
        certifications: ['나무의사(산림청)', '식물보호기사', '조경기사'],
        specialties: ['병충해방제', '정원수외과수술', '단풍나무전지', '토양수세개선'],
        serviceAreas: ['경기 고양시', '경기 파주시', '서울 마포구', '서울 은평구'],
        baseLocation: {
          type: 'Point',
          coordinates: [126.7698, 37.7599] // 파주 기준
        },
        verificationStatus: 'VERIFIED',
        isMasterBadge: true,
        ratingAvg: 4.94,
        reviewCount: 96,
        completedJobsCount: 158,
        portfolios: [
          {
            title: '파주 출판단지 청단풍나무 궤양병 부위 외과수술 및 가지치기',
            treeSpecies: '단풍나무',
            beforeImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
            afterImageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80',
            description: '병든 가지 절단 소독 및 외아 45도 절단으로 통풍율 40% 개선',
            workedAt: new Date('2026-04-10')
          }
        ]
      }
    },
    // [조경사 3: 정푸름 조경가 (인증 파트너)]
    {
      email: 'green_jung@soohyung.kr',
      passwordHash: defaultPasswordHash,
      name: '정푸름 대표',
      phone: '010-5555-3333',
      role: 'LANDSCAPER',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      landscaperProfile: {
        companyName: '푸름 가든 스튜디오',
        experienceYears: 12,
        certifications: ['조경기사', '분재관리사 1급'],
        specialties: ['정원디자인', '배롱나무전지', '유실수전지', '사계절정기관리'],
        serviceAreas: ['서울 서초구', '서울 강남구', '경기 성남시', '경기 용인시'],
        baseLocation: {
          type: 'Point',
          coordinates: [127.0276, 37.4979] // 강남 기준
        },
        verificationStatus: 'VERIFIED',
        isMasterBadge: false,
        ratingAvg: 4.88,
        reviewCount: 64,
        completedJobsCount: 112,
        portfolios: [
          {
            title: '판교 타운하우스 배롱나무 & 에메랄드그린 사계절 전지',
            treeSpecies: '배롱나무/에메랄드그린',
            beforeImageUrl: 'https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?auto=format&fit=crop&w=600&q=80',
            afterImageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
            description: '배롱나무 묵은 가지 정리 및 에메랄드그린 원추형 트리밍',
            workedAt: new Date('2026-03-22')
          }
        ]
      }
    },
    // [조경사 4: 박새순 조경사 (자격 심사 대기 PENDING)]
    {
      email: 'new_park@soohyung.kr',
      passwordHash: defaultPasswordHash,
      name: '박새순',
      phone: '010-4444-6666',
      role: 'LANDSCAPER',
      profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      landscaperProfile: {
        companyName: '새순 조경디자인',
        experienceYears: 4,
        certifications: ['조경기능사'],
        specialties: ['정원정리', '잔디관리', '소형목전지'],
        serviceAreas: ['경기 남양주시', '경기 구리시', '서울 노원구'],
        baseLocation: {
          type: 'Point',
          coordinates: [127.2165, 37.6360] // 남양주
        },
        verificationStatus: 'PENDING',
        isMasterBadge: false,
        ratingAvg: 0,
        reviewCount: 0,
        completedJobsCount: 0,
        portfolios: []
      }
    }
  ]);
  console.log(`[Seed] Inserted ${users.length} users.`);

  const adminUser = users.find(u => u.role === 'ADMIN')!;
  const ownerKim = users.find(u => u.email === 'garden1@soohyung.kr')!;
  const ownerLee = users.find(u => u.email === 'garden2@soohyung.kr')!;
  const ownerPark = users.find(u => u.email === 'garden3@soohyung.kr')!;
  const landscaperChoi = users.find(u => u.email === 'master_choi@soohyung.kr')!;
  const landscaperHan = users.find(u => u.email === 'tree_doc_han@soohyung.kr')!;
  const landscaperJung = users.find(u => u.email === 'green_jung@soohyung.kr')!;

  // 5. 정원 데이터 삽입 (양평 120평, 파주 200평, 성북동 65평)
  const gardens = await Garden.insertMany([
    {
      ownerId: ownerKim._id,
      gardenName: '양평 서종면 북한강 힐링정원',
      gardenType: 'DETACHED_HOUSE',
      address: '경기도 양평군 서종면 문호리 520',
      location: {
        type: 'Point',
        coordinates: [127.4875, 37.4912]
      },
      areaPyeong: 120,
      overviewImages: [
        'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
      ],
      trees: [
        {
          speciesName: '소나무(반송)',
          nickname: '마당 입구 반송',
          heightMeters: 3.2,
          quantity: 2,
          targetStyle: '구름형(운두)',
          timelineLogs: [
            {
              recordedAt: new Date('2026-04-15'),
              imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80',
              memo: '봄철 새순 적심 전 원형 촬영, 도장지 3개 확인'
            }
          ]
        },
        {
          speciesName: '단풍나무(청단풍)',
          nickname: '거실 창 앞 단풍',
          heightMeters: 2.8,
          quantity: 1,
          targetStyle: '자연 우산형',
          timelineLogs: []
        },
        {
          speciesName: '배롱나무',
          nickname: '석축 옆 목백일홍',
          heightMeters: 2.0,
          quantity: 1,
          targetStyle: '개방형 수관',
          timelineLogs: []
        }
      ]
    },
    {
      ownerId: ownerLee._id,
      gardenName: '파주 헤이리 포레스트 카페 정원',
      gardenType: 'COMMERCIAL_CAFE',
      address: '경기도 파주시 탄현면 헤이리마을길 75',
      location: {
        type: 'Point',
        coordinates: [126.7698, 37.7599]
      },
      areaPyeong: 200,
      overviewImages: [
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'
      ],
      trees: [
        {
          speciesName: '소나무(적송)',
          nickname: '테라스 중앙 노송',
          heightMeters: 5.5,
          quantity: 1,
          targetStyle: '고품격 풍취목',
          timelineLogs: []
        },
        {
          speciesName: '에메랄드그린',
          nickname: '외곽 차폐 생울타리',
          heightMeters: 2.2,
          quantity: 15,
          targetStyle: '원추형 울타리',
          timelineLogs: []
        }
      ]
    },
    {
      ownerId: ownerPark._id,
      gardenName: '성북동 고택 정원',
      gardenType: 'DETACHED_HOUSE',
      address: '서울특별시 성북구 성북로 125',
      location: {
        type: 'Point',
        coordinates: [126.9996, 37.5956]
      },
      areaPyeong: 65,
      overviewImages: [
        'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80'
      ],
      trees: [
        {
          speciesName: '소나무(반송)',
          nickname: '안채 마당 반송',
          heightMeters: 2.5,
          quantity: 1,
          targetStyle: '반구형 정원수',
          timelineLogs: []
        }
      ]
    }
  ]);
  console.log(`[Seed] Inserted ${gardens.length} gardens.`);

  // 6. 실사 전지 & 생장 시뮬레이션 데이터셋 생성 (소나무 1건, 단풍나무 1건, 배롱나무 1건)
  const simulations = await PruningSimulation.insertMany([
    // [시뮬레이션 1: 양평 김정원님의 소나무(반송)]
    {
      userId: ownerKim._id,
      gardenId: gardens[0]._id,
      speciesName: '소나무(반송/조형소나무)',
      targetGoal: '구름형(운두) 다듬기 및 통풍 개선',
      originalImageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000&q=85',
      cuttingGuides: [
        {
          guideId: 'GUIDE-PINE-01',
          branchType: '도장지',
          priority: 'HIGH',
          cutLineCoords: [{ x: 38.5, y: 31.0 }, { x: 42.0, y: 28.5 }],
          branchPolygon: [
            { x: 38.5, y: 31.0 }, { x: 40.0, y: 22.0 }, { x: 44.0, y: 14.0 },
            { x: 46.0, y: 15.0 }, { x: 42.0, y: 28.5 }
          ],
          reason: '수관 상부로 뻗어 수형 균형을 깨고 영양분을 독점하는 웃자란 도장지입니다.',
          expectedEffect: '지융부를 보존하여 기부에서 절단 시 하부 주지로 에너지가 분산되어 풍성한 운두가 형성됩니다.'
        },
        {
          guideId: 'GUIDE-PINE-02',
          branchType: '내향지',
          priority: 'HIGH',
          cutLineCoords: [{ x: 55.0, y: 44.0 }, { x: 57.5, y: 42.0 }],
          branchPolygon: [
            { x: 55.0, y: 44.0 }, { x: 51.0, y: 46.0 }, { x: 47.0, y: 49.0 },
            { x: 48.0, y: 51.0 }, { x: 57.5, y: 42.0 }
          ],
          reason: '줄기 중심부로 파고들어 내부 솔잎 채광과 바람길을 가로막는 내향지입니다.',
          expectedEffect: '절단 시 수관 중심부로 햇빛이 투과되어 속잎 마름병과 깍지벌레 번식을 방지합니다.'
        },
        {
          guideId: 'GUIDE-PINE-03',
          branchType: '교차지',
          priority: 'MEDIUM',
          cutLineCoords: [{ x: 62.0, y: 52.0 }, { x: 65.0, y: 50.0 }],
          branchPolygon: [
            { x: 62.0, y: 52.0 }, { x: 67.0, y: 48.0 }, { x: 72.0, y: 45.0 },
            { x: 73.0, y: 47.0 }, { x: 65.0, y: 50.0 }
          ],
          reason: '인접한 주요 주지와 겹쳐 바람이 불 때마다 수피 마찰 상처를 유발하는 교차지입니다.',
          expectedEffect: '세력이 약한 교차지를 솎아내어 인접 주지의 생육 공간을 확보합니다.'
        },
        {
          guideId: 'GUIDE-PINE-04',
          branchType: '하향지',
          priority: 'LOW',
          cutLineCoords: [{ x: 28.0, y: 62.0 }, { x: 31.0, y: 64.0 }],
          branchPolygon: [
            { x: 28.0, y: 62.0 }, { x: 24.0, y: 72.0 }, { x: 22.0, y: 78.0 },
            { x: 25.0, y: 79.0 }, { x: 31.0, y: 64.0 }
          ],
          reason: '지면을 향해 급격히 처져 활력이 떨어지고 잔디 통행을 방해하는 하향지입니다.',
          expectedEffect: '상향 수평 가지를 살려 단정한 3단 수형 라인을 완성합니다.'
        },
        {
          guideId: 'GUIDE-PINE-05',
          branchType: '병충해가지',
          priority: 'HIGH',
          cutLineCoords: [{ x: 70.0, y: 35.0 }, { x: 73.0, y: 33.5 }],
          branchPolygon: [
            { x: 70.0, y: 35.0 }, { x: 78.0, y: 31.0 }, { x: 84.0, y: 28.0 },
            { x: 85.0, y: 30.0 }, { x: 73.0, y: 33.5 }
          ],
          reason: '솔잎혹파리 피해로 잎이 누렇게 갈변하고 가지가 메마른 병충해 가지입니다.',
          expectedEffect: '건전한 부위까지 완전히 잘라내고 상처 부위에 유합제를 도포하여 병원균 전파를 차단합니다.'
        }
      ],
      simulatedImages: {
        immediatelyAfterUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1000&q=85',
        after6MonthsUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85',
        after1YearUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=85',
        after3YearsUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000&q=85'
      },
      isReviewedByAdmin: true,
      adminReviewNote: '도장지와 내향지 지융부 보존 절단선 좌표 검수 완료 (10대 골든 룰 100% 충족)'
    },
    // [시뮬레이션 2: 단풍나무 수형 전지]
    {
      userId: ownerKim._id,
      gardenId: gardens[0]._id,
      speciesName: '단풍나무(청단풍/공작단풍)',
      targetGoal: '자연 우산형 수형 유지 및 채광 개선',
      originalImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85',
      cuttingGuides: [
        {
          guideId: 'GUIDE-MAPLE-01',
          branchType: '도장지',
          priority: 'HIGH',
          cutLineCoords: [{ x: 45.0, y: 35.0 }, { x: 48.0, y: 33.0 }],
          branchPolygon: [{ x: 45.0, y: 35.0 }, { x: 47.0, y: 20.0 }, { x: 48.0, y: 33.0 }],
          reason: '우산형 수형 밖으로 1m 이상 치솟은 도장지입니다.',
          expectedEffect: '외아 사선 절단으로 완만한 수관 층위를 복원합니다.'
        },
        {
          guideId: 'GUIDE-MAPLE-02',
          branchType: '내향지',
          priority: 'MEDIUM',
          cutLineCoords: [{ x: 52.0, y: 48.0 }, { x: 55.0, y: 46.0 }],
          branchPolygon: [{ x: 52.0, y: 48.0 }, { x: 48.0, y: 55.0 }, { x: 55.0, y: 46.0 }],
          reason: '주간 안쪽을 향해 뻗어 하부 채광을 막는 내향지입니다.',
          expectedEffect: '가을 단풍 착색율을 높이고 수관 내부 통풍을 원활하게 합니다.'
        }
      ],
      simulatedImages: {
        immediatelyAfterUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=85',
        after6MonthsUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85',
        after1YearUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=85',
        after3YearsUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85'
      },
      isReviewedByAdmin: false
    }
  ]);
  console.log(`[Seed] Inserted ${simulations.length} pruning simulations.`);

  // 7. 정원주-조경사 매칭 요청 데이터셋 삽입
  const matchingRequests = await MatchingRequest.insertMany([
    // [매칭 건 1: QUOTING (입찰 진행중) - 양평 김정원님 소나무+단풍나무 전지]
    {
      gardenOwnerId: ownerKim._id,
      gardenId: gardens[0]._id,
      simulationIds: [simulations[0]._id, simulations[1]._id],
      requestType: 'ONSITE_PRUNING',
      title: '양평 서종면 마당 반송 2그루 및 청단풍 1그루 가을 전지 요청합니다',
      description: 'AI 시뮬레이션으로 확인한 3단 구름형 수형대로 깔끔하게 전지해주실 전문 조경사님을 모십니다. 사다리 진입 가능하며 가지 폐기물 일괄 수거 포함 요청드립니다.',
      preferredDates: [new Date('2026-11-10'), new Date('2026-11-15')],
      budgetRange: { min: 400000, max: 700000 },
      status: 'QUOTING',
      quotes: [
        {
          landscaperId: landscaperChoi._id,
          price: 580000,
          priceBreakdown: {
            laborCost: 400000, // 기술 인건비 (명인 1인)
            equipmentCost: 80000, // 전정 고소사다리 및 소독 장비
            wasteDisposalCost: 100000 // 나뭇가지 폐기물 트럭 수거
          },
          availableDate: new Date('2026-11-12'),
          expertComment: '소나무 전정 35년 경력으로 지융부를 완벽히 보존하고 외아 위 사선 절단으로 3년 후까지 흐트러짐 없는 명품 구름형 수형을 만들어 드리겠습니다. 유합제 도포 포함.',
          customCuttingGuides: [
            { x: 38.5, y: 31.0, note: '도장지 기부 45도 절단' },
            { x: 55.0, y: 44.0, note: '내향지 완전 절단' }
          ],
          status: 'SUBMITTED',
          submittedAt: new Date('2026-10-30T10:30:00Z')
        },
        {
          landscaperId: landscaperJung._id,
          price: 490000,
          priceBreakdown: {
            laborCost: 350000,
            equipmentCost: 60000,
            wasteDisposalCost: 80000
          },
          availableDate: new Date('2026-11-14'),
          expertComment: '단풍나무 자연 우산형과 반송 수형의 조화를 고려하여 꼼꼼하게 시공해 드리겠습니다. 시공 후 1년간 사계절 관리 팁 제공.',
          status: 'SUBMITTED',
          submittedAt: new Date('2026-10-30T14:15:00Z')
        }
      ]
    },
    // [매칭 건 2: MATCHED (예약 확정) - 파주 카페 에메랄드그린 트리밍 및 정기 관리]
    {
      gardenOwnerId: ownerLee._id,
      gardenId: gardens[1]._id,
      simulationIds: [],
      requestType: 'REGULAR_CARE',
      title: '헤이리 카페 에메랄드그린 15그루 트리밍 및 테라스 소나무 정기관리지도',
      description: '카페 방문객 시야를 확보하고 겨울철 설해 대비 수형 트리밍 및 월 1회 사계절 정기 관리 요청',
      preferredDates: [new Date('2026-11-05')],
      budgetRange: { min: 800000, max: 1200000 },
      status: 'MATCHED',
      quotes: [
        {
          landscaperId: landscaperHan._id,
          price: 950000,
          priceBreakdown: {
            laborCost: 700000,
            equipmentCost: 100000,
            wasteDisposalCost: 150000
          },
          availableDate: new Date('2026-11-05'),
          expertComment: '나무의사 직접 방문 진단 및 에메랄드그린 원추형 트리밍 + 동절기 소나무 응애 예방 방제 실시',
          status: 'ACCEPTED',
          submittedAt: new Date('2026-10-28T09:00:00Z')
        }
      ],
      matchedQuoteId: new mongoose.Types.ObjectId(),
      matchedLandscaperId: landscaperHan._id
    },
    // [매칭 건 3: COMPLETED (시공 완료 및 리뷰 등록) - 성북동 반송 시공]
    {
      gardenOwnerId: ownerPark._id,
      gardenId: gardens[2]._id,
      simulationIds: [simulations[0]._id],
      requestType: 'ONSITE_PRUNING',
      title: '성북동 안채 마당 40년생 반송 정밀 전정 및 수형 교정',
      description: '오래된 반송의 지융부 보호 및 3단 운두 수형 복원 의뢰',
      preferredDates: [new Date('2026-10-20')],
      budgetRange: { min: 500000, max: 700000 },
      status: 'COMPLETED',
      quotes: [
        {
          landscaperId: landscaperChoi._id,
          price: 600000,
          priceBreakdown: {
            laborCost: 450000,
            equipmentCost: 50000,
            wasteDisposalCost: 100000
          },
          availableDate: new Date('2026-10-20'),
          expertComment: '최고의 품격으로 반송의 숨결을 살려내겠습니다.',
          status: 'ACCEPTED',
          submittedAt: new Date('2026-10-18T11:00:00Z')
        }
      ],
      matchedQuoteId: new mongoose.Types.ObjectId(),
      matchedLandscaperId: landscaperChoi._id,
      completionReport: {
        beforeImages: [
          'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80'
        ],
        afterImages: [
          'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
        ],
        workSummary: '도장지 8본 및 내향지 14본을 지융부 손상 없이 기부 절단 완료. 상처면 전체 바실러스 유합제 도포 및 묵은 고엽 털기 작업 마감. 향후 2주간 주 1회 아침 관수 당부.',
        completedAt: new Date('2026-10-20T17:30:00Z')
      },
      review: {
        rating: 5,
        comment: 'AI 시뮬레이션에서 보았던 미래 모습 그대로 나무가 너무 단정하고 아름다워졌습니다. 최송석 명인님의 전문성에 감탄했습니다!',
        createdAt: new Date('2026-10-21T09:12:00Z')
      }
    }
  ]);
  console.log(`[Seed] Inserted ${matchingRequests.length} matching requests.`);

  console.log('[Seed] Database seeding completed successfully! 🎉');
  process.exit(0);
};

if (require.main === module) {
  runSeed().catch(err => {
    console.error('[Seed] Seeding failed:', err);
    process.exit(1);
  });
}

