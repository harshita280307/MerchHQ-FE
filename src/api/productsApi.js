import axiosClient from './axiosClient';

export const productsApi = {
  // GET /products
  getAll: async (params = {}) => {
    const response = await axiosClient.get('/products', { params });
    return response.data;
  },

  // GET /products/{id}
  getById: async (id) => {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data;
  },

  // POST /products
  create: async (productData) => {
    const response = await axiosClient.post('/products', productData);
    return response.data;
  },

  // POST /products/{id}/adjust-stock
  adjustStock: async (id, payload) => {
    const response = await axiosClient.post(`/products/${id}/adjust-stock`, payload);
    return response.data;
  },

  // PUT /products/{id}
  update: async (id, productData) => {
    const response = await axiosClient.put(`/products/${id}`, productData);
    return response.data;
  },

  // DELETE /products/{id}
  delete: async (id) => {
    const response = await axiosClient.delete(`/products/${id}`);
    return response.data;
  },

  // POST /upload — uploads file to Cloudinary via backend and returns { url, publicId }
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000, // longer timeout for file uploads
    });
    return response.data; // { url, publicId }
  },
};
