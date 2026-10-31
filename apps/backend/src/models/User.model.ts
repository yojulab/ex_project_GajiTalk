import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'member' | 'admin' | '조경사' | '관리 매니저';

export interface IPortfolio {
  title: string;
  treeSpecies: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  description: string;
  workedAt: Date;
}

export interface ILandscaperProfile {
  companyName: string;
  experienceYears: number;
  certifications: string[];
  specialties: string[];
  serviceAreas: string[];
  baseLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  isMasterBadge: boolean;
  ratingAvg: number;
  reviewCount: number;
  completedJobsCount: number;
  portfolios: IPortfolio[];
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  roles: UserRole[]; // 회원 권한 array 관리 (member, admin, 조경사, 관리 매니저)
  profileImage?: string;
  landscaperProfile?: ILandscaperProfile;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>({
  title: { type: String, required: true },
  treeSpecies: { type: String, required: true },
  beforeImageUrl: { type: String, required: true },
  afterImageUrl: { type: String, required: true },
  description: { type: String, required: true },
  workedAt: { type: Date, default: Date.now }
});

const LandscaperProfileSchema = new Schema<ILandscaperProfile>({
  companyName: { type: String, default: '' },
  experienceYears: { type: Number, default: 0 },
  certifications: [{ type: String }],
  specialties: [{ type: String }],
  serviceAreas: [{ type: String }],
  baseLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [127.4875, 37.4912] } // [lng, lat]
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  },
  isMasterBadge: { type: Boolean, default: false },
  ratingAvg: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  completedJobsCount: { type: Number, default: 0 },
  portfolios: [PortfolioSchema]
});

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  roles: {
    type: [String],
    enum: ['member', 'admin', '조경사', '관리 매니저'],
    default: ['member'],
    index: true
  },
  profileImage: { type: String, default: '' },
  landscaperProfile: { type: LandscaperProfileSchema, default: null }
}, {
  timestamps: true
});

UserSchema.index({ 'landscaperProfile.baseLocation': '2dsphere' });

export const User = mongoose.model<IUser>('User', UserSchema);
