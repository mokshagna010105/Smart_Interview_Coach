import profileService from '../services/profileService.js';
import { sendSuccess } from '../utils/apiResponse.js';

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const profile = await profileService.getProfile(req.user.userId);
      return sendSuccess(res, profile, 'Profile retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const updatedProfile = await profileService.updateProfile(req.user.userId, req.body);
      return sendSuccess(res, updatedProfile, 'Profile updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
export default profileController;
