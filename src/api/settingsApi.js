import axiosClient from './axiosClient';

export const settingsApi = {
  // GET /settings — fetch store settings for the authenticated user
  getSettings: async () => {
    const response = await axiosClient.get('/settings');
    return response.data;
  },

  // PUT /settings — update store settings
  updateSettings: async (settingsData) => {
    const response = await axiosClient.put('/settings', settingsData);
    return response.data;
  },
};
