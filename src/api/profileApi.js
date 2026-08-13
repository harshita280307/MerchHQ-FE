import axiosClient from './axiosClient';

export const profileApi = {
  // GET /profile — fetch profile for the current authenticated user
  getProfile: async () => {
    const response = await axiosClient.get('/profile');
    return response.data;
  },

  // PUT /profile — update name and/or avatar info
  updateProfile: async (data) => {
    const response = await axiosClient.put('/profile', data);
    return response.data;
  },
};
