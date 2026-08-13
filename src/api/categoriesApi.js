import axiosClient from './axiosClient';

export const categoriesApi = {
  getAll: async () => {
    const response = await axiosClient.get('/categories');
    return response.data;
  }
};

