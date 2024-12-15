import axiosInstance from "./axiosInstance";

// Đăng nhập
export const postLogin = async (data) => {
  //console.log("var: ",data);
  try {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Đăng ký
export const postRegister = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Xác minh đăng nhập
export const postAutoLogin = async (token) => {
  try {
    const response = await axiosInstance.post(
      "/auth/check-token",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


// Lấy danh sách phần cứng
export const getHardwares = async (data) => {
  try {
    const response = await axiosInstance.post("/user/get-user-hardware", data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Lấy danh sách camera from hardware
export const getCameras = async (id) => {
  try {
    const response = await axiosInstance.get(`/user/get-hardware/with-camera-by/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Lấy danh sách timer from hardware
export const getTimers = async (data) => {
  try {
    const response = await axiosInstance.post(`/user/get-hardware/param/byId`,data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Xóa timer from hardware
export const deleteTimer = async (id) => {
  try {
    const response = await axiosInstance.delete(`/user/delete/param/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Tình trạng phần cứng
export const getHardwareStatus = async (id) => {
  try {
    const response = await axiosInstance.get(`/user/get-hardware-status/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Hồ sơ hoạt động của phần cứng
export const getHardwareProfile = async (id,data) => {
  try {
    const response = await axiosInstance.post(`/user/get-hardware/log-activity/${id}`,data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Lấy log của phần cứng
export const getHardwareLog = async (id) => {
  try {
    const response = await axiosInstance.get(`/user/get-hardware/log/message/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Cài trạng thái phần cứng
export const postHardwareStatus = async (data) => {
  try {
    const response = await axiosInstance.post("/user/set-hardware-status", data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Tạo param cho phần cứng
export const postHardwareParam = async (data) => {
  try {
    const response = await axiosInstance.post("/user/set-param", data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Cập nhật param cho phần cứng
export const putHardwareParam = async (id,data) => {
  try {
    const response = await axiosInstance.put(`/user/hardware/update-param/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Gửi trực tiếp command xuống cho phần cứng
export const sendCommand = async (req) => {
  try {
    const response = await axiosInstance.post(`/user/send-command/${req.id}`, {message: req.command});
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
