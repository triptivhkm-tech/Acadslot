import api from "./api";

const notificationService = {
  async getNotifications() {
    const res = await api.get("/notifications");
    return res.data?.data || [];
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data?.data;
  },
};

export default notificationService;
