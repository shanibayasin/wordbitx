import mongoose, { Schema, Document, Model } from 'mongoose';

export type DealStageType = 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

const StageHistorySchema = new Schema({
  id: String,
  fromStage: { type: String, enum: ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'], default: null },
  toStage: { type: String, enum: ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'], required: true },
  changedBy: String,
  changedAt: { type: Date, default: Date.now },
  timeInPreviousStageMs: { type: Number, default: 0 },
  lossReason: String,
  lossNotes: String,
}, { _id: false });

const ActivitySchema = new Schema({
  id: String,
  type: String,
  description: String,
  user: String,
  relatedEntity: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const NoteSchema = new Schema({
  id: String,
  content: String,
  author: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const CallSchema = new Schema({
  id: String,
  date: { type: Date, default: Date.now },
  agent: String,
  type: { type: String, enum: ['Incoming', 'Outgoing', 'Missed', 'Callback'] },
  duration: String,
  outcome: String,
  notes: String,
}, { _id: false });

const DealTaskSchema = new Schema({
  id: String,
  title: String,
  assignedToId: String,
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  dueDate: Date,
  completed: { type: Boolean, default: false },
  notes: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const OrderHandoffSchema = new Schema({
  id: String,
  customerId: String,
  amount: Number,
  currency: String,
  status: { type: String, enum: ['DRAFT'], default: 'DRAFT' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

export interface IDeal extends Document {
  title: string;
  value: number;
  currency?: string;
  company?: string | null;
  pipeline?: string;
  stage: DealStageType;
  probability: number;
  priority?: string;
  status?: string;
  assignedTeam?: string | null;
  source?: string | null;
  expectedCloseDate?: Date | null;
  nextFollowUp?: Date | null;
  stageEnteredAt?: Date | null;
  lastActivityAt?: Date | null;
  tags?: string[];
  notes?: string | null;
  lossReason?: string | null;
  lossNotes?: string | null;
  stageHistory?: mongoose.Types.DocumentArray<any>;
  activities?: mongoose.Types.DocumentArray<any>;
  dealNotes?: mongoose.Types.DocumentArray<any>;
  calls?: mongoose.Types.DocumentArray<any>;
  tasks?: mongoose.Types.DocumentArray<any>;
  orderHandoff?: any;
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
      enum: ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'],
      default: 'NEW',
    },
    probability: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    currency: { type: String, enum: ['USD', 'CAD', 'EUR', 'GBP'], default: 'USD' },
    company: { type: String, trim: true, default: null },
    pipeline: { type: String, default: 'Sales Pipeline' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    status: { type: String, enum: ['OPEN', 'WON', 'LOST'], default: 'OPEN' },
    assignedTeam: { type: String, trim: true, default: null },
    source: { type: String, trim: true, default: null },
    expectedCloseDate: { type: Date, default: null },
    nextFollowUp: { type: Date, default: null },
    stageEnteredAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
    notes: { type: String, default: null },
    lossReason: { type: String, default: null },
    lossNotes: { type: String, default: null },
    stageHistory: { type: [StageHistorySchema], default: [] },
    activities: { type: [ActivitySchema], default: [] },
    dealNotes: { type: [NoteSchema], default: [] },
    calls: { type: [CallSchema], default: [] },
    tasks: { type: [DealTaskSchema], default: [] },
    orderHandoff: { type: OrderHandoffSchema, default: null },
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
