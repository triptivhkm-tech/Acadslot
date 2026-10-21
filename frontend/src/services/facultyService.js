import api from "./api";

const facultyService = {
  async getProfile() {
    const res = await api.get("/teacher/profile");
    return res.data?.data;
  },

  async getMyAvailability() {
    const res = await api.get("/teacher/availability");
    return res.data?.data || [];
  },

  async createAvailability(data) {
    const res = await api.post("/teacher/availability", data);
    return res.data?.data;
  },

  async deleteAvailability(id) {
    const res = await api.delete(`/teacher/availability/${id}`);
    return res.data;
  },

  async getMyRequests() {
    const res = await api.get("/teacher/requests");
    return res.data?.data || [];
  },

  async approveRequest(id, venue = null) {
    const payload = venue ? { venue } : {};
    const res = await api.patch(`/teacher/requests/${id}/approve`, payload);
    return res.data?.data;
  },

  async rejectRequest(id) {
    const res = await api.patch(`/teacher/requests/${id}/reject`);
    return res.data?.data;
  },

  async getMyAppointments() {
    const res = await api.get("/teacher/appointments");
    return res.data?.data || [];
  },

  async completeAppointment(id) {
    const res = await api.patch(`/teacher/appointments/${id}/complete`);
    return res.data?.data;
  },

  async cancelAppointment(id, reason) {
    const res = await api.patch(`/teacher/appointments/${id}/cancel`, { reason });
    return res.data?.data;
  },
};

export default facultyService;
