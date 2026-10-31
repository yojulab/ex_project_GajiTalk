import { User } from '../models/User.model';
import { Garden } from '../models/Garden.model';
import { MatchingRequest } from '../models/MatchingRequest.model';
import mongoose from 'mongoose';

export class MatchingService {
  /**
   * 정원의 위치(GeoJSON Point)를 기준으로 반경 maxDistanceKm 이내의 조경사를 검색합니다.
   */
  public static async findNearbyLandscapers(coords: [number, number], maxDistanceKm = 30) {
    const [lng, lat] = coords;
    try {
      const landscapers = await User.find({
        role: 'LANDSCAPER',
        'landscaperProfile.verificationStatus': 'VERIFIED',
        'landscaperProfile.baseLocation': {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: maxDistanceKm * 1000 // meters
          }
        }
      }).select('-passwordHash');
      return landscapers;
    } catch (err) {
      // 2dsphere 인덱스 쿼리 폴백 (전체 검증된 조경사 반환)
      return await User.find({
        role: 'LANDSCAPER',
        'landscaperProfile.verificationStatus': 'VERIFIED'
      }).select('-passwordHash');
    }
  }

  /**
   * 시공 완료 보고서 승인 시 해당 정원의 수목 timelineLogs에 자동 기록합니다.
   */
  public static async recordCompletionToGardenTimeline(params: {
    gardenId: string;
    matchingRequestId: string;
    afterImageUrl: string;
    workSummary: string;
  }) {
    const { gardenId, matchingRequestId, afterImageUrl, workSummary } = params;
    const garden = await Garden.findById(gardenId);
    if (!garden) return;

    if (garden.trees && garden.trees.length > 0) {
      garden.trees[0].timelineLogs.push({
        matchingRequestId: new mongoose.Types.ObjectId(matchingRequestId),
        recordedAt: new Date(),
        imageUrl: afterImageUrl,
        memo: `[시공 완료] ${workSummary}`
      });
      await garden.save();
    }
  }
}

