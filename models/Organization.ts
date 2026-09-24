import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  logoUrl?: string;
  createdAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    logoUrl: {
      type: String,
      default: null,
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

// Prevent model overwrite in hot reload environments
const Organization: Model<IOrganization> =
  mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;
