export const seedTreeSpecies = [
  {
    koreanName: '소나무(반송/조형소나무)',
    scientificName: 'Pinus densiflora',
    category: 'CONIFER',
    pruningSeason: [5, 6, 10, 11, 12],
    pruningRules: [
      {
        branchType: '도장지',
        action: '기부 절단',
        description: '수관 상부로 강하게 치솟은 웃자란 가지를 지융부를 다치지 않게 밑동에서 제거합니다.'
      },
      {
        branchType: '촛대순(신초)',
        action: '적심(순집기)',
        description: '5~6월 새순이 촛대처럼 자랄 때 중심순은 2/3, 곁순은 1/2을 손으로 꺾어 마디 사이를 좁힙니다.'
      },
      {
        branchType: '내향지/교차지',
        action: '솎아베기',
        description: '수관 중심부로 파고드는 내향지와 가지끼리 마찰하는 교차지를 솎아 햇빛과 통풍을 확보합니다.'
      },
      {
        branchType: '묵은 잎',
        action: '잎솎기(고엽 제거)',
        description: '가을~초겨울 2~3년 된 묵은 솔잎을 털어내어 부후균과 응애류 월동을 방지합니다.'
      }
    ],
    standardPriceGuide: {
      smallTreePrice: 120000,
      mediumTreePrice: 280000,
      largeTreePrice: 650000,
      difficultyNote: '소나무는 활엽수와 달리 묵은 가지에서 눈이 트지 않으므로 바깥눈 사선 절단과 지융부 보존이 핵심이며, 숙련된 명인 시공 권장'
    },
    aiPromptConfig: {
      afterPruningPrompt: 'Real photo of a pruned Korean red pine tree (Pinus densiflora), elegant cloud-shaped canopy with branches trimmed neatly at branch collars, clean pine needle cushions with improved air and light circulation, professional Japanese garden style.',
      growthSimulationPrompt: 'Real photo of Korean red pine tree 3 years after master pruning, harmonious tiered branch structure, lush green pine pads, mature bark texture.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    koreanName: '단풍나무(청단풍/공작단풍)',
    scientificName: 'Acer palmatum',
    category: 'DECIDUOUS',
    pruningSeason: [11, 12, 1, 2],
    pruningRules: [
      {
        branchType: '도장지',
        action: '솎음전정',
        description: '봄~여름 폭발적으로 자란 수직 도장지를 기부에서 솎아내어 자연스러운 우산형 수형을 유지합니다.'
      },
      {
        branchType: '교차지/평행지',
        action: '외아 위 사선 절단',
        description: '서로 엉킨 가지 중 세력이 약한 가지를 바깥눈 위 0.8cm 지점에서 45도 각도로 절단합니다.'
      },
      {
        branchType: '하향지',
        action: '절단전정',
        description: '땅으로 처져 통행을 방해하거나 지면 습기에 노출되는 가지를 정리합니다.'
      }
    ],
    standardPriceGuide: {
      smallTreePrice: 80000,
      mediumTreePrice: 170000,
      largeTreePrice: 380000,
      difficultyNote: '이른 봄 수액 유동기에 자르면 수액 누출(Bleeding)로 쇠약해지므로 낙엽 직후 휴면기(12~2월) 절단 권장'
    },
    aiPromptConfig: {
      afterPruningPrompt: 'Real photo of a professionally trimmed Japanese maple tree in winter garden, graceful spreading branch structure with thinning cuts, clear space beneath canopy.',
      growthSimulationPrompt: 'Real photo of mature Japanese maple tree in autumn, vibrant red and orange foliage with well-balanced balanced layered crown.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  },
  {
    koreanName: '배롱나무(목백일홍)',
    scientificName: 'Lagerstroemia indica',
    category: 'DECIDUOUS',
    pruningSeason: [2, 3],
    pruningRules: [
      {
        branchType: '묵은 꽃대/잔가지',
        action: '절단전정',
        description: '전년도에 꽃이 피었던 쇠약한 잔가지를 굵은 가지 분기점에서 깨끗하게 잘라냅니다.'
      },
      {
        branchType: '맹아지(뿌리순/흡지)',
        action: '기부 완전 제거',
        description: '지하부나 원줄기 밑동에서 솟아나는 맹아지를 조기에 잘라 수형 매끄러움을 보존합니다.'
      }
    ],
    standardPriceGuide: {
      smallTreePrice: 70000,
      mediumTreePrice: 150000,
      largeTreePrice: 320000,
      difficultyNote: '새로 자라난 당년생 가지 끝에서만 꽃눈이 분화하므로 늦겨울~초봄 강전정이 가능하나 지융부 매끄러운 수피 보호 필수'
    },
    aiPromptConfig: {
      afterPruningPrompt: 'Real photo of a pruned Crape Myrtle tree with smooth sculpted trunk and main scaffolds, deadflower heads removed, prepared for summer blooming.',
      growthSimulationPrompt: 'Real photo of Crape Myrtle tree in full summer bloom with dense magenta pink flowers and balanced canopy.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?auto=format&fit=crop&w=800&q=80'
  },
  {
    koreanName: '정원 유실수(감나무/매실/모과)',
    scientificName: 'Diospyros kaki',
    category: 'FRUIT',
    pruningSeason: [1, 2, 3],
    pruningRules: [
      {
        branchType: '도장지',
        action: '외아 절단 또는 유인',
        description: '채광을 가로막는 수직 도장지는 솎아내고, 공간이 빈 곳은 수평으로 유인하여 결과지로 유도합니다.'
      },
      {
        branchType: '내향지',
        action: '솎음전정',
        description: '나무 속으로 자라 열매 착색을 방해하는 가지를 완전히 제거합니다.'
      }
    ],
    standardPriceGuide: {
      smallTreePrice: 75000,
      mediumTreePrice: 160000,
      largeTreePrice: 340000,
      difficultyNote: '결과모지(꽃눈이 달리는 가지)를 식별하여 보존해야 열매 수확이 가능'
    },
    aiPromptConfig: {
      afterPruningPrompt: 'Real photo of pruned persimmon tree in late winter orchard, open vase shape canopy for maximum sunlight penetration.',
      growthSimulationPrompt: 'Real photo of heavy fruiting persimmon tree in autumn with golden ripe fruits hanging on healthy branches.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
  },
  {
    koreanName: '에메랄드그린/측백류',
    scientificName: 'Thuja occidentalis',
    category: 'EVERGREEN',
    pruningSeason: [4, 5, 8, 9],
    pruningRules: [
      {
        branchType: '웃자란 겉가지',
        action: '외곽선 트리밍',
        description: '원추형(콘 모양) 수형을 벗어난 외곽 가지 끝을 전정가위로 가볍게 다듬습니다.'
      },
      {
        branchType: '고사지(속마름 가지)',
        action: '내부 솎기',
        description: '빛을 받지 못해 안쪽에서 누렇게 마른 고사 가지를 손으로 털어내고 전지하여 통풍을 원활하게 합니다.'
      }
    ],
    standardPriceGuide: {
      smallTreePrice: 50000,
      mediumTreePrice: 110000,
      largeTreePrice: 220000,
      difficultyNote: '목질화된 안쪽 깊은 갈색 부위까지 자르면 맹아가 나오지 않으므로 녹색 잎 부위에서 다듬어야 함'
    },
    aiPromptConfig: {
      afterPruningPrompt: 'Real photo of neatly manicured columnar emerald green arborvitae trees in landscape garden, crisp conical silhouette.',
      growthSimulationPrompt: 'Real photo of lush dense green hedge of Thuja occidentalis flanking a beautiful garden pathway.'
    },
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'
  }
];

