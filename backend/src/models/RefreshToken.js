import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
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
      index: { expires: 0 } // MongoDB TTL index: document deletes automatically when expiresAt is reached
    },
    isRevoked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
