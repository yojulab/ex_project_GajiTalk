import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.model';

const JWT_SECRET = process.env.JWT_SECRET || 'soohyung_master_secret_key_2026_gajitalk_jwt';

export class AuthController {
  // 회원가입
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone, roles, profileImage, landscaperProfile } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        res.status(400).json({ success: false, message: '이미 가입된 이메일 주소입니다.' });
        return;
      }

      // roles는 array로 관리: ['member', 'admin', '조경사', '관리 매니저']
      let assignedRoles: UserRole[] = ['member'];
      if (Array.isArray(roles) && roles.length > 0) {
        assignedRoles = roles.filter(r => ['member', 'admin', '조경사', '관리 매니저'].includes(r));
      } else if (typeof roles === 'string') {
        if (roles === 'LANDSCAPER' || roles === '조경사') assignedRoles = ['조경사', 'member'];
        else if (roles === 'ADMIN' || roles === 'admin') assignedRoles = ['admin', '관리 매니저'];
        else if (roles === '관리 매니저') assignedRoles = ['관리 매니저'];
        else assignedRoles = ['member'];
      }

      const passwordHash = await bcrypt.hash(password || 'admin123', 10);
      const isLandscaper = assignedRoles.includes('조경사');

      const user = new User({
        email,
        passwordHash,
        name,
        phone,
        roles: assignedRoles,
        profileImage: profileImage || '',
        landscaperProfile: isLandscaper ? (landscaperProfile || {
          companyName: name,
          experienceYears: 1,
          certifications: [],
          specialties: ['수목전지'],
          serviceAreas: ['전국'],
          verificationStatus: 'PENDING',
          isMasterBadge: false,
          portfolios: []
        }) : undefined
      });

      await user.save();
      const token = jwt.sign({ id: user._id, roles: user.roles, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          landscaperProfile: user.landscaperProfile,
          profileImage: user.profileImage
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 로그인
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: '이메일을 입력해주세요.' });
        return;
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPassword = String(password || '').trim();

      // 대소문자 무시 및 정규화 이메일로 사용자 조회
      const user = await User.findOne({
        $or: [
          { email: cleanEmail },
          { email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
        ]
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: `등록되지 않은 계정입니다: ${cleanEmail}`
        });
        return;
      }

      let isMatch = false;
      if (user.passwordHash) {
        isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
      }

      // 데모 환경 호환성: admin123, 1234, 또는 평문 일치 시 허용
      if (!isMatch && (cleanPassword === 'admin123' || cleanPassword === '1234' || cleanPassword === user.passwordHash)) {
        isMatch = true;
      }

      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: '비밀번호가 일치하지 않습니다. (데모 비밀번호: admin123)'
        });
        return;
      }

      const token = jwt.sign({ id: user._id, roles: user.roles, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        success: true,
        message: '로그인 성공',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          landscaperProfile: user.landscaperProfile,
          profileImage: user.profileImage
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, message: '서버 내부 오류가 발생했습니다.' });
    }
  }

  // 로그아웃
  public static async logout(req: Request, res: Response): Promise<void> {
    // JWT 기반 무상태 인증이므로 클라이언트측 토큰 삭제 및 성공 응답
    res.json({
      success: true,
      message: '로그아웃 되었습니다.'
    });
  }

  // 현재 사용자 정보 조회
  public static async me(req: Request, res: Response): Promise<void> {
    try {
      let userId = (req as any).user?.id || req.query.userId;
      
      // Authorization 헤더가 있으면 JWT 토큰 파싱
      const authHeader = req.headers.authorization;
      if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          userId = decoded.id;
        } catch (jwtErr) {
          // 토큰 만료 또는 유효하지 않음
        }
      }

      if (!userId) {
        // 데모 환경: 첫 번째 member 계정 기본 반환
        const defaultUser = await User.findOne({ roles: 'member' }).select('-passwordHash');
        res.json({ success: true, user: defaultUser });
        return;
      }
      const user = await User.findById(userId).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        return;
      }
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 데모 계정 목록 조회 (원클릭 전환용)
  public static async getDemoUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find().select('-passwordHash').sort({ createdAt: 1 });
      res.json({ success: true, users });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // 권한 갱신 (관리자용)
  public static async updateUserRoles(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { roles } = req.body;
      if (!Array.isArray(roles)) {
        res.status(400).json({ success: false, message: 'roles는 배열이어야 합니다.' });
        return;
      }
      const validRoles = roles.filter(r => ['member', 'admin', '조경사', '관리 매니저'].includes(r));
      const user = await User.findByIdAndUpdate(id, { $set: { roles: validRoles } }, { new: true }).select('-passwordHash');
      res.json({ success: true, message: '회원 권한이 갱신되었습니다.', user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
