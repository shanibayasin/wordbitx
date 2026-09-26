import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  industry?: string | null;
  companySize?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  customerType?: string;
  status?: string;
  source?: string | null;
  assignedToId?: string | null;
  assignedTeam?: string | null;
  assignedDealer?: string | null;
  tags?: string[];
  notes?: string | null;
  customerNotes?: { id: string; content: string; author: string; createdAt: Date }[];
  calls?: { id: string; date: Date; agent: string; type: string; duration: string; outcome: string; notes: string }[];
  avatarUrl?: string | null;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date | null;
}

const CustomerNoteSchema = new Schema({
  id: String,
  content: String,
  author: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const CustomerCallSchema = new Schema({
  id: String,
  date: { type: Date, default: Date.now },
  agent: String,
  type: { type: String, enum: ['Incoming', 'Outgoing', 'Missed', 'Callback'] },
  duration: String,
  outcome: String,
  notes: String,
}, { _id: false });

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
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
    alternatePhone: { type: String, trim: true, default: null },
    company: {
      type: String,
      trim: true,
      default: null,
    },
    jobTitle: { type: String, trim: true, default: null },
    industry: { type: String, trim: true, default: null },
    companySize: { type: String, trim: true, default: null },
    website: { type: String, trim: true, default: null },
    address: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    state: { type: String, trim: true, default: null },
    country: { type: String, trim: true, default: null },
    postalCode: { type: String, trim: true, default: null },
    customerType: { type: String, enum: ['INDIVIDUAL', 'SMB', 'MID_MARKET', 'ENTERPRISE', 'STRATEGIC'], default: 'ENTERPRISE' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'PROSPECT', 'VIP', 'AT_RISK', 'ARCHIVED'], default: 'ACTIVE' },
    source: { type: String, trim: true, default: null },
    assignedToId: { type: String, default: null },
    assignedTeam: { type: String, trim: true, default: null },
    assignedDealer: { type: String, trim: true, default: null },
    tags: { type: [String], default: [] },
    notes: { type: String, default: null },
    customerNotes: { type: [CustomerNoteSchema], default: [] },
    calls: { type: [CustomerCallSchema], default: [] },
    lastActivityAt: { type: Date, default: null },
    avatarUrl: {
      type: String,
      default: null,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
