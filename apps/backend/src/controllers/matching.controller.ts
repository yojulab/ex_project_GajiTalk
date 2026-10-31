import { Request, Response } from 'express';
import { MatchingRequest } from '../models/MatchingRequest.model';
import { User } from '../models/User.model';
import { MatchingService } from '../services/matching.service';
import mongoose from 'mongoose';

export class MatchingController {
  // 조경사 목록 조회 (지역, 전문분야, 명인배지 필터)
  public static async getLandscapers(req: Request, res: Response): Promise<void> {
    try {
      const { specialty, isMaster, area } = req.query;
      const query: any = {
        roles: '조경사',
        'landscaperProfile.verificationStatus': 'VERIFIED'
      };

      if (isMaster === 'true') {
        query['landscaperProfile.isMasterBadge'] = true;
      }
      if (specialty) {
        query['landscaperProfile.specialties'] = { $in: [String(specialty)] };
      }
      if (area) {
        query['landscaperProfile.serviceAreas'] = { $regex: String(area), $options: 'i' };
      }

      const landscapers = await User.find(query).select('-passwordHash').sort({ 'landscaperProfile.ratingAvg': -1 });
      res.json({ success: true, count: landscapers.length, landscapers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 조경사 상세 조회
  public static async getLandscaperById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const landscaper = await User.findOne({ _id: id, roles: '조경사' }).select('-passwordHash');
      if (!landscaper) {
        res.status(404).json({ success: false, message: '조경사를 찾을 수 없습니다.' });
        return;
      }
      res.json({ success: true, landscaper });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // AI 시뮬레이션 첨부 견적 요청서 등록
  public static async createRequest(req: Request, res: Response): Promise<void> {
    try {
      const {
        gardenId,
        simulationIds = [],
        requestType = 'ONSITE_PRUNING',
        title,
        description,
        preferredDates = [],
        budgetRange = { min: 300000, max: 700000 },
        targetLandscaperId,
        gardenOwnerId: customOwnerId
      } = req.body;

      let gardenOwnerId = customOwnerId || (req as any).user?.id;
      if (!gardenOwnerId) {
        const defaultOwner = await User.findOne({ roles: 'member' });
        gardenOwnerId = defaultOwner?._id;
      }

      const matchingRequest = new MatchingRequest({
        gardenOwnerId,
        gardenId: gardenId || null,
        simulationIds: simulationIds.map((id: string) => new mongoose.Types.ObjectId(id)),
        requestType,
        title: title || '조경 및 수목 전지 시공 요청',
        description: description || 'AI 시뮬레이션 목표 수형 기반 견적 요청',
        preferredDates: preferredDates.length > 0 ? preferredDates.map((d: string) => new Date(d)) : [new Date(Date.now() + 86400000 * 7)],
        budgetRange,
        targetLandscaperId: targetLandscaperId ? new mongoose.Types.ObjectId(targetLandscaperId) : undefined,
        status: 'OPEN',
        quotes: []
      });

      await matchingRequest.save();

      res.status(201).json({
        success: true,
        message: '견적 요청이 성공적으로 등록되었습니다.',
        matchingRequest
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 견적 요청 목록 조회 (정원주: 내 요청 / 조경사: 주변 요청)
  public static async getRequests(req: Request, res: Response): Promise<void> {
    try {
      const { status, role, userId } = req.query;
      const query: any = {};

      if (status) query.status = status;
      if (role === 'GARDEN_OWNER' && userId) {
        query.gardenOwnerId = userId;
      }

      const requests = await MatchingRequest.find(query)
        .populate('gardenOwnerId', 'name email phone profileImage')
        .populate('gardenId')
        .populate('simulationIds')
        .populate('quotes.landscaperId', 'name email landscaperProfile profileImage')
        .populate('matchedLandscaperId', 'name email landscaperProfile profileImage')
        .sort({ createdAt: -1 });

      res.json({ success: true, count: requests.length, requests });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 특정 견적 요청 상세 조회
  public static async getRequestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const request = await MatchingRequest.findById(id)
        .populate('gardenOwnerId', 'name email phone profileImage')
        .populate('gardenId')
        .populate('simulationIds')
        .populate('quotes.landscaperId', 'name email landscaperProfile profileImage')
        .populate('matchedLandscaperId', 'name email landscaperProfile profileImage');

      if (!request) {
        res.status(404).json({ success: false, message: '요청서를 찾을 수 없습니다.' });
        return;
      }
      res.json({ success: true, request });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // [조경사용] 견적서 및 전문가 보정 라인 입찰 제출
  public static async submitQuote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        landscaperId: customLandscaperId,
        price,
        priceBreakdown,
        availableDate,
        expertComment,
        customCuttingGuides = []
      } = req.body;

      const request = await MatchingRequest.findById(id);
      if (!request) {
        res.status(404).json({ success: false, message: '요청서를 찾을 수 없습니다.' });
        return;
      }

      let landscaperId = customLandscaperId;
      if (!landscaperId) {
        const defaultLandscaper = await User.findOne({ roles: '조경사', 'landscaperProfile.isMasterBadge': true });
        landscaperId = defaultLandscaper?._id;
      }

      const quote = {
        _id: new mongoose.Types.ObjectId(),
        landscaperId: new mongoose.Types.ObjectId(landscaperId),
        price: Number(price) || 500000,
        priceBreakdown: priceBreakdown || {
          laborCost: Math.round(Number(price) * 0.7) || 350000,
          equipmentCost: Math.round(Number(price) * 0.15) || 75000,
          wasteDisposalCost: Math.round(Number(price) * 0.15) || 75000
        },
        availableDate: availableDate ? new Date(availableDate) : new Date(Date.now() + 86400000 * 5),
        expertComment: expertComment || '고객님이 첨부하신 AI 목표 수형을 존중하여 지융부를 보존하고 외아 위 사선 절단으로 완벽히 시공하겠습니다.',
        customCuttingGuides,
        status: 'SUBMITTED' as const,
        submittedAt: new Date()
      };

      request.quotes.push(quote);
      request.status = 'QUOTING';
      await request.save();

      res.status(201).json({
        success: true,
        message: '조경사 견적서가 성공적으로 제출되었습니다.',
        quote,
        request
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // [정원주용] 조경사 견적 채택 및 시공 예약 확정
  public static async acceptQuote(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quoteId } = req.body;

      const request = await MatchingRequest.findById(id);
      if (!request) {
        res.status(404).json({ success: false, message: '요청서를 찾을 수 없습니다.' });
        return;
      }

      const selectedQuote = request.quotes.find(q => q._id?.toString() === quoteId || q.quoteId?.toString() === quoteId) || request.quotes[0];
      if (!selectedQuote) {
        res.status(404).json({ success: false, message: '채택할 견적서를 찾을 수 없습니다.' });
        return;
      }

      // 상태 변경
      selectedQuote.status = 'ACCEPTED';
      request.matchedQuoteId = selectedQuote._id;
      request.matchedLandscaperId = selectedQuote.landscaperId;
      request.status = 'MATCHED';

      await request.save();

      res.json({
        success: true,
        message: '견적이 채택되었으며 시공 예약이 확정되었습니다.',
        matchedLandscaperId: selectedQuote.landscaperId,
        request
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // [조경사용] 현장 시공 완료 보고서 제출
  public static async completeJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { beforeImages = [], afterImages = [], workSummary } = req.body;

      const request = await MatchingRequest.findById(id);
      if (!request) {
        res.status(404).json({ success: false, message: '요청서를 찾을 수 없습니다.' });
        return;
      }

      const defaultAfterImages = afterImages.length > 0 ? afterImages : [
        'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
      ];
      const summary = workSummary || '도장지 및 내향지 지융부 보존 전정 완료. 상처 부위 유합제 도포 및 고엽 털기 마감.';

      request.completionReport = {
        beforeImages: beforeImages.length > 0 ? beforeImages : ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80'],
        afterImages: defaultAfterImages,
        workSummary: summary,
        completedAt: new Date()
      };
      request.status = 'COMPLETED';

      await request.save();

      // 내 정원 타임라인 자동 연동
      if (request.gardenId) {
        await MatchingService.recordCompletionToGardenTimeline({
          gardenId: request.gardenId.toString(),
          matchingRequestId: request._id.toString(),
          afterImageUrl: defaultAfterImages[0],
          workSummary: summary
        });
      }

      // 조경사 실적 갱신
      if (request.matchedLandscaperId) {
        await User.findByIdAndUpdate(request.matchedLandscaperId, {
          $inc: { 'landscaperProfile.completedJobsCount': 1 }
        });
      }

      res.json({
        success: true,
        message: '시공 완료 보고서가 제출되었으며 정원 타임라인에 자동 아카이빙되었습니다.',
        request
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // [정원주용] 별점 및 리뷰 등록
  public static async reviewJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rating = 5, comment = '완벽한 시공이었습니다.' } = req.body;

      const request = await MatchingRequest.findById(id);
      if (!request) {
        res.status(404).json({ success: false, message: '요청서를 찾을 수 없습니다.' });
        return;
      }

      request.review = {
        rating: Number(rating),
        comment,
        createdAt: new Date()
      };
      await request.save();

      // 조경사 평점 및 리뷰 수 재계산
      if (request.matchedLandscaperId) {
        const completedReviews = await MatchingRequest.find({
          matchedLandscaperId: request.matchedLandscaperId,
          'review.rating': { $exists: true }
        });

        const totalRating = completedReviews.reduce((sum, item) => sum + (item.review?.rating || 5), 0);
        const avg = totalRating / completedReviews.length;

        await User.findByIdAndUpdate(request.matchedLandscaperId, {
          $set: {
            'landscaperProfile.ratingAvg': Math.round(avg * 100) / 100,
            'landscaperProfile.reviewCount': completedReviews.length
          }
        });
      }

      res.json({
        success: true,
        message: '소중한 후기와 별점이 성공적으로 등록되었습니다.',
        review: request.review
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

