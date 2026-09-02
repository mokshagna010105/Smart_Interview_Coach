import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index: expires automatically
    },
    isUsed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;
