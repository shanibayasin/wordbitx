import mongoose, { Schema, Document, Model } from 'mongoose';

export type DealStageType = 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface IDeal extends Document {
  title: string;
  value: number;
  stage: DealStageType;
  probability: number;
  organizationId: mongoose.Types.ObjectId;
  assignedToId?: mongoose.Types.ObjectId | null;
  customerId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    title: {
      type: String,
      required: [true, 'Deal title is required'],
      trim: true,
    },
    value: {
      type: Number,
      required: [true, 'Deal value is required'],
      default: 0,
    },
    stage: {
      type: String,
      enum: ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'],
      default: 'QUALIFIED',
    },
    probability: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Deal: Model<IDeal> = mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);

export default Deal;
