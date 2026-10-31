import mongoose, { Document, Schema } from 'mongoose';

export interface ICoord {
  x: number;
  y: number;
}

export interface ICuttingGuide {
  guideId: string;
  branchType: string; // 도장지, 교차지, 내향지, 하향지, 병충해가지 등
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  cutLineCoords: ICoord[];
  branchPolygon: ICoord[];
  reason: string;
  expectedEffect: string;
}

export interface ISimulatedImages {
  immediatelyAfterUrl: string;
  after6MonthsUrl: string;
  after1YearUrl: string;
  after3YearsUrl: string;
}

export interface IPruningSimulation extends Document {
  userId: mongoose.Types.ObjectId;
  gardenId?: mongoose.Types.ObjectId;
  speciesName: string;
  targetGoal: string;
  originalImageUrl: string;
  cuttingGuides: ICuttingGuide[];
  simulatedImages: ISimulatedImages;
  isReviewedByAdmin: boolean;
  adminReviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CoordSchema = new Schema<ICoord>({
  x: { type: Number, required: true },
  y: { type: Number, required: true }
}, { _id: false });

const CuttingGuideSchema = new Schema<ICuttingGuide>({
  guideId: { type: String, required: true },
  branchType: { type: String, required: true },
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' },
  cutLineCoords: [CoordSchema],
  branchPolygon: [CoordSchema],
  reason: { type: String, required: true },
  expectedEffect: { type: String, required: true }
}, { _id: false });

const SimulatedImagesSchema = new Schema<ISimulatedImages>({
  immediatelyAfterUrl: { type: String, required: true },
  after6MonthsUrl: { type: String, required: true },
  after1YearUrl: { type: String, required: true },
  after3YearsUrl: { type: String, required: true }
}, { _id: false });

const PruningSimulationSchema = new Schema<IPruningSimulation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gardenId: { type: Schema.Types.ObjectId, ref: 'Garden' },
  speciesName: { type: String, required: true },
  targetGoal: { type: String, default: '통풍 개선 및 수형 교정' },
  originalImageUrl: { type: String, required: true },
  cuttingGuides: [CuttingGuideSchema],
  simulatedImages: { type: SimulatedImagesSchema, required: true },
  isReviewedByAdmin: { type: Boolean, default: false },
  adminReviewNote: { type: String, default: '' }
}, {
  timestamps: true
});

export const PruningSimulation = mongoose.model<IPruningSimulation>('PruningSimulation', PruningSimulationSchema);

