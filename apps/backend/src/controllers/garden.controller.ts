import { Request, Response } from 'express';
import { Garden } from '../models/Garden.model';
import { User } from '../models/User.model';

export class GardenController {
  public static async getMyGarden(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = (req as any).user?.id || req.query.ownerId;
      let garden = null;

      if (ownerId) {
        garden = await Garden.findOne({ ownerId }).populate('ownerId', 'name email');
      }
      if (!garden) {
        garden = await Garden.findOne().populate('ownerId', 'name email');
      }

      res.json({ success: true, garden });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async createGarden(req: Request, res: Response): Promise<void> {
    try {
      const {
        gardenName,
        gardenType,
        address,
        location,
        areaPyeong,
        trees = []
      } = req.body;

      let ownerId = (req as any).user?.id || req.body.ownerId;
      if (!ownerId) {
        const defaultOwner = await User.findOne({ roles: 'member' });
        ownerId = defaultOwner?._id;
      }

      const garden = new Garden({
        ownerId,
        gardenName: gardenName || '내 정원',
        gardenType: gardenType || 'DETACHED_HOUSE',
        address: address || '경기도 양평군 서종면 문호리 520',
        location: location || { type: 'Point', coordinates: [127.4875, 37.4912] },
        areaPyeong: areaPyeong || 100,
        overviewImages: req.body.overviewImages || ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80'],
        trees
      });

      await garden.save();
      res.status(201).json({ success: true, message: '정원이 등록되었습니다.', garden });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async addTree(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { speciesName, nickname, heightMeters, quantity, targetStyle, initialImageUrl } = req.body;

      const garden = await Garden.findById(id);
      if (!garden) {
        res.status(404).json({ success: false, message: '정원을 찾을 수 없습니다.' });
        return;
      }

      garden.trees.push({
        speciesName,
        nickname: nickname || speciesName,
        heightMeters: heightMeters || 2.5,
        quantity: quantity || 1,
        targetStyle: targetStyle || '자연형',
        timelineLogs: initialImageUrl ? [{
          recordedAt: new Date(),
          imageUrl: initialImageUrl,
          memo: '초기 수목 등록 및 상태 기록'
        }] : []
      });

      await garden.save();
      res.status(201).json({ success: true, message: '수목이 정원에 추가되었습니다.', garden });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

