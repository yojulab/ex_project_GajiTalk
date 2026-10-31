import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceBreakdown {
  laborCost: number;
  equipmentCost: number;
  wasteDisposalCost: number;
}

export interface IQuote {
  _id?: mongoose.Types.ObjectId;
  quoteId?: mongoose.Types.ObjectId;
  landscaperId: mongoose.Types.ObjectId;
  price: number;
  priceBreakdown: IPriceBreakdown;
  availableDate: Date;
  expertComment: string;
  customCuttingGuides?: any[];
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  submittedAt: Date;
}

export interface ICompletionReport {
  beforeImages: string[];
  afterImages: string[];
  workSummary: string;
  completedAt: Date;
}

export interface IReview {
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IMatchingRequest extends Document {
  gardenOwnerId: mongoose.Types.ObjectId;
  gardenId?: mongoose.Types.ObjectId;
  simulationIds: mongoose.Types.ObjectId[];
  requestType: 'ONSITE_PRUNING' | 'REGULAR_CARE' | 'REMOTE_COACHING' | 'LANDSCAPE_DESIGN';
  title: string;
  description: string;
  preferredDates: Date[];
  budgetRange: { min: number; max: number };
  targetLandscaperId?: mongoose.Types.ObjectId;
  status: 'OPEN' | 'QUOTING' | 'MATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  quotes: IQuote[];
  matchedQuoteId?: mongoose.Types.ObjectId;
  matchedLandscaperId?: mongoose.Types.ObjectId;
  completionReport?: ICompletionReport;
  review?: IReview;
  createdAt: Date;
  updatedAt: Date;
}

const PriceBreakdownSchema = new Schema<IPriceBreakdown>({
  laborCost: { type: Number, default: 0 },
  equipmentCost: { type: Number, default: 0 },
  wasteDisposalCost: { type: Number, default: 0 }
}, { _id: false });

const QuoteSchema = new Schema<IQuote>({
  landscaperId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  priceBreakdown: { type: PriceBreakdownSchema, required: true },
  availableDate: { type: Date, required: true },
  expertComment: { type: String, default: '' },
  customCuttingGuides: { type: Array, default: [] },
  status: {
    type: String,
    enum: ['SUBMITTED', 'ACCEPTED', 'REJECTED'],
    default: 'SUBMITTED'
  },
  submittedAt: { type: Date, default: Date.now }
});

const CompletionReportSchema = new Schema<ICompletionReport>({
  beforeImages: [{ type: String }],
  afterImages: [{ type: String }],
  workSummary: { type: String, required: true },
  completedAt: { type: Date, default: Date.now }
}, { _id: false });

const ReviewSchema = new Schema<IReview>({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const MatchingRequestSchema = new Schema<IMatchingRequest>({
  gardenOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gardenId: { type: Schema.Types.ObjectId, ref: 'Garden' },
  simulationIds: [{ type: Schema.Types.ObjectId, ref: 'PruningSimulation' }],
  requestType: {
    type: String,
    enum: ['ONSITE_PRUNING', 'REGULAR_CARE', 'REMOTE_COACHING', 'LANDSCAPE_DESIGN'],
    default: 'ONSITE_PRUNING'
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  preferredDates: [{ type: Date }],
  budgetRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  targetLandscaperId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['OPEN', 'QUOTING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'OPEN',
    index: true
  },
  quotes: [QuoteSchema],
  matchedQuoteId: { type: Schema.Types.ObjectId },
  matchedLandscaperId: { type: Schema.Types.ObjectId, ref: 'User' },
  completionReport: { type: CompletionReportSchema, default: null },
  review: { type: ReviewSchema, default: null }
}, {
  timestamps: true
});

export const MatchingRequest = mongoose.model<IMatchingRequest>('MatchingRequest', MatchingRequestSchema);

