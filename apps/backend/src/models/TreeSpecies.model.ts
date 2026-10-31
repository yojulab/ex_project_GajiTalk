import mongoose, { Document, Schema } from 'mongoose';

export interface IPruningRule {
  branchType: string;
  action: string;
  description: string;
}

export interface IStandardPriceGuide {
  smallTreePrice: number;   // 2m 미만
  mediumTreePrice: number;  // 2m ~ 4m
  largeTreePrice: number;   // 4m 이상
  difficultyNote: string;
}

export interface IAiPromptConfig {
  afterPruningPrompt: string;
  growthSimulationPrompt: string;
}

export interface ITreeSpecies extends Document {
  koreanName: string;
  scientificName: string;
  category: 'CONIFER' | 'DECIDUOUS' | 'EVERGREEN' | 'FRUIT';
  pruningSeason: number[]; // 1~12월
  pruningRules: IPruningRule[];
  standardPriceGuide: IStandardPriceGuide;
  aiPromptConfig: IAiPromptConfig;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PruningRuleSchema = new Schema<IPruningRule>({
  branchType: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const StandardPriceGuideSchema = new Schema<IStandardPriceGuide>({
  smallTreePrice: { type: Number, default: 80000 },
  mediumTreePrice: { type: Number, default: 180000 },
  largeTreePrice: { type: Number, default: 350000 },
  difficultyNote: { type: String, default: '' }
}, { _id: false });

const AiPromptConfigSchema = new Schema<IAiPromptConfig>({
  afterPruningPrompt: { type: String, default: '' },
  growthSimulationPrompt: { type: String, default: '' }
}, { _id: false });

const TreeSpeciesSchema = new Schema<ITreeSpecies>({
  koreanName: { type: String, required: true, unique: true },
  scientificName: { type: String, default: '' },
  category: {
    type: String,
    enum: ['CONIFER', 'DECIDUOUS', 'EVERGREEN', 'FRUIT'],
    default: 'CONIFER'
  },
  pruningSeason: [{ type: Number }],
  pruningRules: [PruningRuleSchema],
  standardPriceGuide: { type: StandardPriceGuideSchema, required: true },
  aiPromptConfig: { type: AiPromptConfigSchema, default: () => ({}) },
  imageUrl: { type: String, default: '' }
}, {
  timestamps: true
});

export const TreeSpecies = mongoose.model<ITreeSpecies>('TreeSpecies', TreeSpeciesSchema);

