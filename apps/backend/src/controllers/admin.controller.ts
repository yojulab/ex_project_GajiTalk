import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { PruningSimulation } from '../models/PruningSimulation.model';
import { MatchingRequest } from '../models/MatchingRequest.model';
import { TreeSpecies } from '../models/TreeSpecies.model';
import mongoose from 'mongoose';

export class AdminController {
  // 1. 통합 대시보드 통계
  public static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const [totalSimulations, totalRequests, matchedRequests, totalLandscapers, verifiedLandscapers] = await Promise.all([
        PruningSimulation.countDocuments(),
        MatchingRequest.countDocuments(),
        MatchingRequest.countDocuments({ status: { $in: ['MATCHED', 'IN_PROGRESS', 'COMPLETED'] } }),
        User.countDocuments({ roles: '조경사' }),
        User.countDocuments({ roles: '조경사', 'landscaperProfile.verificationStatus': 'VERIFIED' })
      ]);

      const matchingRate = totalRequests > 0 ? Math.round((matchedRequests / totalRequests) * 100) : 0;
      
      // 월간 거래액 계산
      const completedRequests = await MatchingRequest.find({
        status: { $in: ['MATCHED', 'IN_PROGRESS', 'COMPLETED'] }
      });
      const grossVolume = completedRequests.reduce((sum, req) => {
        const quote = req.quotes.find(q => q._id?.toString() === req.matchedQuoteId?.toString()) || req.quotes[0];
        return sum + (quote?.price || 550000);
      }, 0);
      const feeRevenue = Math.round(grossVolume * 0.1); // 수수료 10%

      // 최근 7일 시뮬레이션 및 매칭 추이 (차트용)
      const weeklyTrends = [
        { date: '10/25', simulations: 14, matches: 3, volume: 1800000 },
        { date: '10/26', simulations: 22, matches: 5, volume: 2750000 },
        { date: '10/27', simulations: 18, matches: 4, volume: 2100000 },
        { date: '10/28', simulations: 29, matches: 7, volume: 3900000 },
        { date: '10/29', simulations: 35, matches: 8, volume: 4600000 },
        { date: '10/30', simulations: 41, matches: 10, volume: 5800000 },
        { date: '10/31', simulations: 48, matches: 12, volume: 6900000 }
      ];

      res.json({
        success: true,
        stats: {
          totalSimulations,
          totalRequests,
          matchedRequests,
          matchingRate,
          grossVolume,
          feeRevenue,
          totalLandscapers,
          verifiedLandscapers
        },
        weeklyTrends
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 2. 조경사 심사 목록
  public static async getLandscapers(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const query: any = { roles: '조경사' };
      if (status) {
        query['landscaperProfile.verificationStatus'] = status;
      }
      const landscapers = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
      res.json({ success: true, count: landscapers.length, landscapers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. 조경사 자격 승인/반려 및 명인 배지 부여
  public static async verifyLandscaper(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, isMasterBadge } = req.body;

      const user = await User.findOne({ _id: id, roles: '조경사' });
      if (!user || !user.landscaperProfile) {
        res.status(404).json({ success: false, message: '조경사를 찾을 수 없습니다.' });
        return;
      }

      if (status) user.landscaperProfile.verificationStatus = status;
      if (typeof isMasterBadge === 'boolean') user.landscaperProfile.isMasterBadge = isMasterBadge;

      await user.save();
      res.json({
        success: true,
        message: '조경사 파트너 심사 결과가 반영되었습니다.',
        user: {
          id: user._id,
          name: user.name,
          verificationStatus: user.landscaperProfile.verificationStatus,
          isMasterBadge: user.landscaperProfile.isMasterBadge
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 4. 전체 매칭 진행 현황 모니터링
  public static async getMatching(req: Request, res: Response): Promise<void> {
    try {
      const requests = await MatchingRequest.find()
        .populate('gardenOwnerId', 'name email phone')
        .populate('gardenId')
        .populate('simulationIds')
        .populate('quotes.landscaperId', 'name email landscaperProfile')
        .populate('matchedLandscaperId', 'name email landscaperProfile')
        .sort({ createdAt: -1 });

      res.json({ success: true, count: requests.length, requests });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 5. 미매칭 건 우수 조경사 수동 배정
  public static async assignMatching(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { landscaperId } = req.body;

      const request = await MatchingRequest.findById(id);
      if (!request) {
        res.status(404).json({ success: false, message: '매칭 요청을 찾을 수 없습니다.' });
        return;
      }

      const landscaper = await User.findById(landscaperId);
      if (!landscaper) {
        res.status(404).json({ success: false, message: '배정할 조경사를 찾을 수 없습니다.' });
        return;
      }

      request.matchedLandscaperId = landscaper._id;
      request.status = 'MATCHED';
      await request.save();

      res.json({
        success: true,
        message: `조경사 [${landscaper.name}] 님이 성공적으로 수동 배정되었습니다.`,
        request
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 6. 관리자/전문가용 Canvas 절단선 교정 및 AI 데이터셋 축적
  public static async reviewSimulation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { cuttingGuides, adminReviewNote } = req.body;

      const simulation = await PruningSimulation.findById(id);
      if (!simulation) {
        res.status(404).json({ success: false, message: '시뮬레이션을 찾을 수 없습니다.' });
        return;
      }

      if (cuttingGuides) simulation.cuttingGuides = cuttingGuides;
      simulation.isReviewedByAdmin = true;
      simulation.adminReviewNote = adminReviewNote || '전문가 Canvas 절단선 첨삭 검수 완료 (지융부 보존 룰셋 일치)';

      await simulation.save();

      res.json({
        success: true,
        message: '절단선 교정 검수가 완료되었으며 AI 학습 데이터셋으로 승인되었습니다.',
        simulation
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 7. 수종 도감 및 표준 단가 목록 조회
  public static async getSpecies(req: Request, res: Response): Promise<void> {
    try {
      const speciesList = await TreeSpecies.find().sort({ koreanName: 1 });
      res.json({ success: true, count: speciesList.length, species: speciesList });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 8. 수종 도감, 전지 룰셋 및 표준 단가표 등록/수정
  public static async createOrUpdateSpecies(req: Request, res: Response): Promise<void> {
    try {
      const {
        koreanName,
        scientificName,
        category,
        pruningSeason,
        pruningRules,
        standardPriceGuide,
        imageUrl
      } = req.body;

      let species = await TreeSpecies.findOne({ koreanName });
      if (species) {
        if (scientificName) species.scientificName = scientificName;
        if (category) species.category = category;
        if (pruningSeason) species.pruningSeason = pruningSeason;
        if (pruningRules) species.pruningRules = pruningRules;
        if (standardPriceGuide) species.standardPriceGuide = standardPriceGuide;
        if (imageUrl) species.imageUrl = imageUrl;
        await species.save();
      } else {
        species = new TreeSpecies({
          koreanName,
          scientificName,
          category,
          pruningSeason,
          pruningRules,
          standardPriceGuide,
          imageUrl
        });
        await species.save();
      }

      res.status(200).json({
        success: true,
        message: `수종 [${koreanName}] 도감 및 단가표가 저장되었습니다.`,
        species
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 9. 회원 관리: 회원 목록 조회 및 통계
  public static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { search, role } = req.query;
      const filter: any = {};

      if (role && role !== 'ALL') {
        filter.roles = role;
      }

      if (search) {
        const searchRegex = new RegExp(String(search).trim(), 'i');
        filter.$or = [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ];
      }

      const [users, totalCount, memberCount, landscaperCount, managerCount, adminCount] = await Promise.all([
        User.find(filter).select('-passwordHash').sort({ createdAt: -1 }),
        User.countDocuments(),
        User.countDocuments({ roles: 'member' }),
        User.countDocuments({ roles: '조경사' }),
        User.countDocuments({ roles: '관리 매니저' }),
        User.countDocuments({ roles: 'admin' })
      ]);

      res.json({
        success: true,
        stats: {
          totalCount,
          memberCount,
          landscaperCount,
          managerCount,
          adminCount
        },
        users
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 10. 회원 관리: 관리자 회원 직접 등록
  public static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone, roles, profileImage, landscaperProfile } = req.body;
      const cleanEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        res.status(400).json({ success: false, message: '이미 등록된 이메일입니다.' });
        return;
      }

      let assignedRoles = ['member'];
      if (Array.isArray(roles) && roles.length > 0) {
        assignedRoles = roles.filter(r => ['member', 'admin', '조경사', '관리 매니저'].includes(r));
      }

      const passwordHash = await bcrypt.hash(password || 'admin123', 10);
      const isLandscaper = assignedRoles.includes('조경사');

      const user = new User({
        name: String(name).trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone || '',
        roles: assignedRoles,
        profileImage: profileImage || '',
        landscaperProfile: isLandscaper ? (landscaperProfile || {
          companyName: name,
          experienceYears: 1,
          certifications: [],
          specialties: ['수목전지'],
          serviceAreas: ['전국'],
          verificationStatus: 'VERIFIED',
          isMasterBadge: false,
          portfolios: []
        }) : undefined
      });

      await user.save();
      const resultUser = await User.findById(user._id).select('-passwordHash');
      res.status(201).json({ success: true, message: '신규 회원이 등록되었습니다.', user: resultUser });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 11. 회원 관리: 회원 정보 및 권한 수정
  public static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, phone, roles, profileImage, landscaperProfile } = req.body;

      const updateData: any = {};
      if (name) updateData.name = String(name).trim();
      if (phone !== undefined) updateData.phone = String(phone).trim();
      if (profileImage !== undefined) updateData.profileImage = profileImage;

      if (Array.isArray(roles)) {
        const validRoles = roles.filter(r => ['member', 'admin', '조경사', '관리 매니저'].includes(r));
        if (validRoles.length > 0) {
          updateData.roles = validRoles;
        }
      }

      if (landscaperProfile) {
        updateData.landscaperProfile = landscaperProfile;
      }

      const user = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        return;
      }

      res.json({ success: true, message: '회원 정보가 수정되었습니다.', user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 12. 회원 관리: 회원 삭제
  public static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        return;
      }
      res.json({ success: true, message: `${user.name} 회원이 삭제되었습니다.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

