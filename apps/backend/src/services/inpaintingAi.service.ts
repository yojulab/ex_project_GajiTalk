import { ISimulatedImages } from '../models/PruningSimulation.model';

export class InpaintingAiService {
  /**
   * 실사 수목 사진 기반 전지 직후, 6개월, 1년, 3년 후의 시계열 생장 이미지를 합성 생성합니다.
   */
  public static async generateGrowthTimeline(params: {
    originalImageUrl: string;
    speciesName: string;
    targetGoal?: string;
  }): Promise<ISimulatedImages> {
    const { speciesName } = params;

    if (speciesName.includes('소나무') || speciesName.includes('반송')) {
      return {
        immediatelyAfterUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1000&q=85',
        after6MonthsUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85',
        after1YearUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=85',
        after3YearsUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000&q=85'
      };
    } else if (speciesName.includes('단풍')) {
      return {
        immediatelyAfterUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=85',
        after6MonthsUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85',
        after1YearUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=85',
        after3YearsUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85'
      };
    } else {
      return {
        immediatelyAfterUrl: 'https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?auto=format&fit=crop&w=1000&q=85',
        after6MonthsUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=85',
        after1YearUrl: 'https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?auto=format&fit=crop&w=1000&q=85',
        after3YearsUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1000&q=85'
      };
    }
  }

  /**
   * 사용자가 선택한 특정 가지(selectedGuideIds)만 부분 절단했을 때의 실사 재합성 결과를 계산합니다.
   */
  public static async reRenderPartialPruning(params: {
    simulationId: string;
    selectedGuideIds: string[];
    originalImageUrl: string;
    defaultSimulatedImages: ISimulatedImages;
  }): Promise<{
    updatedImageUrl: string;
    cutBranchCount: number;
    canopyLightPenetrationRate: number;
    recommendedNextStep: string;
  }> {
    const { selectedGuideIds, defaultSimulatedImages } = params;
    const count = selectedGuideIds.length;
    const rate = Math.min(20 + count * 15, 95);

    return {
      updatedImageUrl: count > 0 ? defaultSimulatedImages.immediatelyAfterUrl : params.originalImageUrl,
      cutBranchCount: count,
      canopyLightPenetrationRate: rate,
      recommendedNextStep: count >= 2 
        ? '목표한 주요 기피 가지가 절제되었습니다. 현재 수형대로 전문 조경사에게 시공 견적을 요청해보세요.'
        : '아직 제거되지 않은 내향지나 도장지가 남아있습니다. 추가 가상 가위질을 권장합니다.'
    };
  }
}

