import mongoose, { Document, Schema } from 'mongoose';

export interface ITimelineLog {
  _id?: mongoose.Types.ObjectId;
  simulationId?: mongoose.Types.ObjectId;
  matchingRequestId?: mongoose.Types.ObjectId;
  recordedAt: Date;
  imageUrl: string;
  memo: string;
}

export interface ITree {
  _id?: mongoose.Types.ObjectId;
  speciesName: string;
  nickname: string;
  heightMeters: number;
  quantity: number;
  targetStyle: string;
  timelineLogs: ITimelineLog[];
}

export interface IGarden extends Document {
  ownerId: mongoose.Types.ObjectId;
  gardenName: string;
  gardenType: 'DETACHED_HOUSE' | 'TOWNHOUSE' | 'COMMERCIAL_CAFE' | 'APARTMENT' | 'FARM';
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  areaPyeong: number;
  overviewImages: string[];
  trees: ITree[];
  createdAt: Date;
  updatedAt: Date;
}

const TimelineLogSchema = new Schema<ITimelineLog>({
  simulationId: { type: Schema.Types.ObjectId, ref: 'PruningSimulation' },
  matchingRequestId: { type: Schema.Types.ObjectId, ref: 'MatchingRequest' },
  recordedAt: { type: Date, default: Date.now },
  imageUrl: { type: String, required: true },
  memo: { type: String, default: '' }
});

const TreeSchema = new Schema<ITree>({
  speciesName: { type: String, required: true },
  nickname: { type: String, default: '' },
  heightMeters: { type: Number, default: 2.5 },
  quantity: { type: Number, default: 1 },
  targetStyle: { type: String, default: '자연형' },
  timelineLogs: [TimelineLogSchema]
});

const GardenSchema = new Schema<IGarden>({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gardenName: { type: String, required: true },
  gardenType: {
    type: String,
    enum: ['DETACHED_HOUSE', 'TOWNHOUSE', 'COMMERCIAL_CAFE', 'APARTMENT', 'FARM'],
    default: 'DETACHED_HOUSE'
  },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  areaPyeong: { type: Number, default: 50 },
  overviewImages: [{ type: String }],
  trees: [TreeSchema]
}, {
  timestamps: true
});

GardenSchema.index({ location: '2dsphere' });

export const Garden = mongoose.model<IGarden>('Garden', GardenSchema);

