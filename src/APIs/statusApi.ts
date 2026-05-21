import axiosInstance from "@/lib/axiosInstance";

export type NewStatusPayload = {
  text?: string;
  files?: File[];
  style?: {
    background?: string;
    mediaScale?: number;
    mediaRotation?: number;
    mediaX?: number;
    mediaY?: number;
    textSize?: number;
    textAlign?: string;
    textWeight?: string;
    textItalic?: boolean;
  };
};

export const getStatuses = async () => {
  const response = await axiosInstance.get("/api/status");
  return response.data.statuses;
};

export const createStatus = async ({ text = "", files = [], style }: NewStatusPayload) => {
  const formData = new FormData();
  formData.append("text", text);
  if (style) formData.append("style", JSON.stringify(style));
  files.forEach((file) => formData.append("files", file));

  const response = await axiosInstance.post("/api/status", formData);
  return response.data.status;
};

export const deleteStatus = async (statusId: string) => {
  const response = await axiosInstance.delete(`/api/status/${statusId}`);
  return response.data;
};

export const markStatusViewed = async (statusId: string) => {
  const response = await axiosInstance.patch(`/api/status/${statusId}/view`);
  return response.data.status;
};
