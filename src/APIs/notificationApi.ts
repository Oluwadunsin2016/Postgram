import axiosInstance from "@/lib/axiosInstance";

export const getNotifications = async () => {
  const response = await axiosInstance.get("/api/notifications");
  return response.data;
};

export const getNotificationUnreadCount = async () => {
  const response = await axiosInstance.get("/api/notifications/unread-count");
  return response.data.unreadCount;
};

export const markNotificationRead = async (notificationId: string) => {
  const response = await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
  return response.data.notification;
};

export const markAllNotificationsRead = async () => {
  const response = await axiosInstance.patch("/api/notifications/mark-all/read");
  return response.data;
};
