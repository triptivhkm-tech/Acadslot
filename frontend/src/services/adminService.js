import api from "./api";

const adminService = {
  async getStats() {
    const res = await api.get("/admin/dashboard");
    return res.data?.data;
  },

  async getFaculty() {
    const res = await api.get("/admin/faculty");
    return res.data?.data || [];
  },

  async addFaculty(data) {
    const res = await api.post("/admin/faculty", data);
    return res.data?.data;
  },

  async updateFaculty(id, data) {
    const res = await api.put(`/admin/faculty/${id}`, data);
    return res.data?.data;
  },

  async getStudents() {
    const res = await api.get("/admin/students");
    return res.data?.data || [];
  },

  async toggleUserStatus(id) {
    const res = await api.patch(`/admin/users/${id}/status`);
    return res.data?.data;
  },

  async getVenues() {
    const res = await api.get("/admin/venues");
    return res.data?.data || [];
  },

  async addVenue(data) {
    const res = await api.post("/admin/venues", data);
    return res.data?.data;
  },

  async deleteVenue(id) {
    const res = await api.delete(`/admin/venues/${id}`);
    return res.data?.data;
  },

  async getBookings() {
    const res = await api.get("/admin/bookings");
    return res.data?.data || [];
  },

  async getRequests() {
    const res = await api.get("/admin/requests");
    return res.data?.data || [];
  },
};

export default adminService;
