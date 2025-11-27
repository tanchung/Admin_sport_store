import axios from "axios";

// ✅ Tạo instance axios dùng chung
const axiosClient = axios.create({
  baseURL: "https://unrealistic-elton-denunciable.ngrok-free.dev/api",
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor request — tự thêm token
axiosClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token") || localStorage.getItem("token"); // 🔑 Đảm bảo cùng key khi login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Biến flag để tránh gọi refresh nhiều lần đồng thời
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ✅ Interceptor response — xử lý token hết hạn và auto-refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const skipRedirect = originalRequest.headers?.["x-no-redirect"];

    // Nếu lỗi 401 và chưa retry
    if (status === 401 && !originalRequest._retry) {
      // Nếu đang refresh, đưa request vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        // Không có refresh token, logout
        if (!skipRedirect) {
          localStorage.clear();
          console.warn("⚠️ No refresh token. Redirecting to login...");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh
        const res = await axios.post(
          "https://unrealistic-elton-denunciable.ngrok-free.dev/api/auth/refresh",
          {},
          {
            headers: {
              RefreshToken: refreshToken,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        const newAccessToken = res.data?.result?.token || res.data?.token;
        const newRefreshToken =
          res.data?.result?.refreshToken || res.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error("No new access token received");
        }

        // Lưu token mới
        localStorage.setItem("access_token", newAccessToken);
        localStorage.setItem("token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("refresh_token", newRefreshToken);
        }

        // Update header cho request ban đầu
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        // Process queue
        processQueue(null, newAccessToken);
        isRefreshing = false;

        console.log("✅ Token refreshed successfully");

        // Retry request gốc
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh token failed:", refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;

        if (!skipRedirect) {
          localStorage.clear();
          console.warn("⚠️ Refresh failed. Redirecting to login...");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Xử lý 403 hoặc lỗi khác
    if (status === 403 && !skipRedirect) {
      localStorage.clear();
      console.warn("⚠️ Forbidden. Redirecting to login...");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
