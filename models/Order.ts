import mongoose, { Model, Schema } from 'mongoose';

const ItemSchema = new Schema({
  id: { type: String, required: true },
  productId: { type: String, default: null },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 0.01 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  tax: { type: Number, default: 0, min: 0, max: 100 },
}, { _id: false });

const NoteSchema = new Schema({ id: String, content: String, author: String, createdAt: { type: Date, default: Date.now } }, { _id: false });
const ActivitySchema = new Schema({ id: String, type: String, description: String, user: String, createdAt: { type: Date, default: Date.now } }, { _id: false });
const InvoiceReferenceSchema = new Schema({ id: String, amount: Number, status: { type: String, enum: ['DRAFT'], default: 'DRAFT' }, createdAt: { type: Date, default: Date.now } }, { _id: false });
const PaymentReferenceSchema = new Schema({ id: String, amount: Number, method: String, transactionId: String, status: { type: String, enum: ['RECORDED', 'PENDING', 'REFUNDED'], default: 'RECORDED' }, paidAt: { type: Date, default: Date.now } }, { _id: false });

export interface IOrder extends mongoose.Document {
  organizationId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  company?: string | null;
  dealId?: mongoose.Types.ObjectId | null;
  sourceDealHandoffId?: string | null;
  salespersonId?: mongoose.Types.ObjectId | null;
  orderDate: Date;
  expectedDelivery?: Date | null;
  paymentDueDate?: Date | null;
  priority: string;
  status: string;
  paymentStatus: string;
  items: any[];
  subtotal: number;
  discount: number;
  tax: number;
  additionalCharges: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  deliveryStatus: string;
  deliveryDate?: Date | null;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
  deliveryAddress?: string | null;
  deliveryNotes?: string | null;
  notes: any[];
  activities: any[];
  invoiceReferences: any[];
  paymentReferences: any[];
  cancellationReason?: string | null;
  cancellationNotes?: string | null;
  refundAmount: number;
  refundDate?: Date | null;
  refundReason?: string | null;
  refundStatus: string;
  lastPaymentDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

const OrderSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  company: { type: String, trim: true, default: null },
  dealId: { type: Schema.Types.ObjectId, ref: 'Deal', default: null, index: true },
  sourceDealHandoffId: { type: String, default: null },
  salespersonId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  orderDate: { type: Date, required: true, default: Date.now },
  expectedDelivery: { type: Date, default: null },
  paymentDueDate: { type: Date, default: null },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  status: { type: String, enum: ['DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED', 'REFUNDED'], default: 'DRAFT', index: true },
  paymentStatus: { type: String, enum: ['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE', 'REFUNDED'], default: 'UNPAID', index: true },
  items: { type: [ItemSchema], default: [] },
  subtotal: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  additionalCharges: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  remainingAmount: { type: Number, default: 0, min: 0 },
  deliveryStatus: { type: String, enum: ['NOT_STARTED', 'PROCESSING', 'READY', 'SHIPPED', 'DELIVERED', 'FAILED'], default: 'NOT_STARTED' },
  deliveryDate: { type: Date, default: null },
  shippingMethod: { type: String, default: null },
  trackingNumber: { type: String, default: null },
  deliveryAddress: { type: String, default: null },
  deliveryNotes: { type: String, default: null },
  notes: { type: [NoteSchema], default: [] },
  activities: { type: [ActivitySchema], default: [] },
  invoiceReferences: { type: [InvoiceReferenceSchema], default: [] },
  paymentReferences: { type: [PaymentReferenceSchema], default: [] },
  cancellationReason: { type: String, default: null },
  cancellationNotes: { type: String, default: null },
  refundAmount: { type: Number, default: 0, min: 0 },
  refundDate: { type: Date, default: null },
  refundReason: { type: String, default: null },
  refundStatus: { type: String, enum: ['NONE', 'PENDING', 'COMPLETED'], default: 'NONE' },
  lastPaymentDate: { type: Date, default: null },
  lastActivityAt: { type: Date, default: Date.now },
} as any, { timestamps: true });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
