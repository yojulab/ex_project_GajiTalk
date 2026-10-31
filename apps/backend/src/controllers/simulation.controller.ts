import { Request, Response } from 'express';
import { PruningSimulation } from '../models/PruningSimulation.model';
import { VisionAiService } from '../services/visionAi.service';
import { InpaintingAiService } from '../services/inpaintingAi.service';
import { User } from '../models/User.model';

export class SimulationController {
  public static async analyze(req: Request, res: Response): Promise<void> {
    try {
      const {
        imageUrl,
        speciesName = '소나무(반송/조형소나무)',
        targetGoal = '구름형(운두) 다듬기 및 통풍 개선',
        gardenId,
        userId: customUserId
      } = req.body;

      // 사용자 결정
      let targetUser = null;
      if (customUserId) {
        targetUser = await User.findById(customUserId);
      }
      if (!targetUser) {
        targetUser = await User.findOne({ roles: 'member' });
      }

      const activeImageUrl = imageUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000&q=85';

      // 1. Vision AI 절단선 도출
      const visionResult = await VisionAiService.analyzeTreeStructure({
        imageUrl: activeImageUrl,
        speciesName,
        targetGoal
      });

      // 2. Inpainting AI 4단계 생장 예측 이미지 생성
      const simulatedImages = await InpaintingAiService.generateGrowthTimeline({
        originalImageUrl: activeImageUrl,
        speciesName,
        targetGoal
      });

      // 3. DB 저장
      const simulation = new PruningSimulation({
        userId: targetUser ? targetUser._id : null,
        gardenId: gardenId || null,
        speciesName: visionResult.detectedSpecies,
        targetGoal,
        originalImageUrl: activeImageUrl,
        cuttingGuides: visionResult.cuttingGuides,
        simulatedImages
      });

      await simulation.save();

      res.status(201).json({
        success: true,
        message: '실사 수목 전지 분석 및 미래 생장 시뮬레이션이 성공적으로 생성되었습니다.',
        simulation,
        analysisSummary: {
          crownHealthScore: visionResult.crownHealthScore,
          estimatedPruningRatio: visionResult.estimatedPruningRatio,
          commentary: visionResult.commentary
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async list(req: Request, res: Response): Promise<void> {
    try {
      const simulations = await PruningSimulation.find().sort({ createdAt: -1 });
      res.json({ success: true, count: simulations.length, simulations });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const simulation = await PruningSimulation.findById(id).populate('userId', 'name email role');
      if (!simulation) {
        res.status(404).json({ success: false, message: '시뮬레이션 결과를 찾을 수 없습니다.' });
        return;
      }
      res.json({ success: true, simulation });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async reRender(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { selectedGuideIds = [] } = req.body;

      const simulation = await PruningSimulation.findById(id);
      if (!simulation) {
        res.status(404).json({ success: false, message: '시뮬레이션을 찾을 수 없습니다.' });
        return;
      }

      const reRenderResult = await InpaintingAiService.reRenderPartialPruning({
        simulationId: id,
        selectedGuideIds,
        originalImageUrl: simulation.originalImageUrl,
        defaultSimulatedImages: simulation.simulatedImages
      });

      res.json({
        success: true,
        message: '선택 가지 가상 가위질 후 실사 재합성 완료',
        ...reRenderResult
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

