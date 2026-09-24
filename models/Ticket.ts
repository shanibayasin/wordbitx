import mongoose, { Schema, Document, Model } from 'mongoose';

export type TicketStatusType = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED';
export type TicketPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ITicket extends Document {
  subject: string;
  description: string;
  status: TicketStatusType;
  priority: TicketPriorityType;
  organizationId: mongoose.Types.ObjectId;
  assignedToId?: mongoose.Types.ObjectId | null;
  customerId?: mongoose.Types.ObjectId | null;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED'],
      default: 'OPEN',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
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
    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
