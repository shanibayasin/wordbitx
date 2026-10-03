import mongoose, { Schema, Document, Model } from 'mongoose';

export type LeadStatusType =
  | 'NEW'
  | 'CONTACTED'
  | 'FOLLOW_UP'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'LOST';

export interface ILead extends Document {
  name: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  score: number;
  status: LeadStatusType;
  organizationId: mongoose.Types.ObjectId;
  assignedToId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    source: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'FOLLOW_UP', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CONVERTED', 'LOST'],
      default: 'NEW',
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
  },
  {
    timestamps: true,
  }
);

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
