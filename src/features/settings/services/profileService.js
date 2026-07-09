import api from '@/api/axios'

export const profileService = {
  /**
   * Upload or replace the authenticated user's profile avatar.
   *
   * @param {File} file
   * @returns {Promise} Axios response.
   */
  uploadAvatar(file) {
    // Create FormData for file upload
    const formData = new FormData()

    // Append the selected image file
    formData.append('avatar', file)

    // Send a POST request to upload the avatar
    return api.post('/auth/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Remove the authenticated user's current profile avatar.
   *
   * @returns {Promise} Axios response.
   */
  removeAvatar() {
   
    return api.delete('/auth/profile/avatar')
  },
}