import Profile from '../models/Profile.js';
import User from '../models/User.js';

class ProfileService {
  /**
   * Get user profile by userId
   */
  async getProfile(userId) {
    let profile = await Profile.findOne({ userId }).populate('userId', 'email role isEmailVerified createdAt');
    if (!profile) {
      // Create a default profile if one does not exist yet
      const user = await User.findById(userId);
      if (!user) {
        const error = new Error('User not found');
        error.code = 'NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }
      profile = await Profile.create({
        userId,
        fullName: user.email.split('@')[0]
      });
    }
    return profile;
  }

  /**
   * Update user profile fields
   */
  async updateProfile(userId, updateData) {
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    ).populate('userId', 'email role isEmailVerified');

    if (!profile) {
      const error = new Error('Profile not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    return profile;
  }
}

export const profileService = new ProfileService();
export default profileService;
