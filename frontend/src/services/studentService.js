import api from "./api";

const studentService = {
  async getFacultyList(query = "") {
    const params = query ? { query } : {};
    const res = await api.get("/student/faculty", { params });
    return res.data?.data || [];
  },

  async getAvailability(teacherId = null) {
    const params = teacherId ? { teacherId } : {};
    const res = await api.get("/student/availability", { params });
    return res.data?.data || [];
  },

  async submitRequest({ availabilityId, requestedStartTime, requestedDuration, reason }) {
    const res = await api.post("/student/requests", {
      availabilityId,
      requestedStartTime,
      requestedDuration: Number(requestedDuration),
      reason,
    });
    return res.data?.data;
  },

  async getMyRequests() {
    const res = await api.get("/student/requests");
    return res.data?.data || [];
  },

  async getMySessions() {
    const res = await api.get("/student/sessions");
    return res.data?.data || [];
  },
};

export default studentService;
