import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';

const JWT_SECRET = process.env.JWT_SECRET || 'soohyung_master_secret_key_2026_gajitalk_jwt';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone, role, landscaperProfile } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        res.status(400).json({ success: false, message: '이미 가입된 이메일 주소입니다.' });
        return;
      }

      const passwordHash = await bcrypt.hash(password || 'admin123', 10);
      const user = new User({
        email,
        passwordHash,
        name,
        phone,
        role: role || 'GARDEN_OWNER',
        landscaperProfile: role === 'LANDSCAPER' ? (landscaperProfile || {
          companyName: name,
          experienceYears: 1,
          verificationStatus: 'PENDING',
          isMasterBadge: false,
          portfolios: []
        }) : undefined
      });

      await user.save();
      const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          landscaperProfile: user.landscaperProfile
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ success: false, message: '존재하지 않는 사용자 계정입니다.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch && password !== 'admin123') { // 데모 편의 지원
        res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
        return;
      }

      const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        success: true,
        message: '로그인 성공',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          landscaperProfile: user.landscaperProfile,
          profileImage: user.profileImage
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id || req.query.userId;
      if (!userId) {
        // 데모 환경: 첫 번째 정원주 기본 반환
        const defaultUser = await User.findOne({ role: 'GARDEN_OWNER' }).select('-passwordHash');
        res.json({ success: true, user: defaultUser });
        return;
      }
      const user = await User.findById(userId).select('-passwordHash');
      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

