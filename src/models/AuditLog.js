import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

