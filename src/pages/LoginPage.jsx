import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { Loader2 } from "lucide-react"; // Thêm icon loading cho nút

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axiosClient.post("/auth/login", {
        username,
        password,
      });

      // Accept token in several possible shapes returned by backend
      const token =
        res?.data?.result?.access_token ||
        res?.data?.result?.token ||
        res?.data?.access_token ||
        res?.data?.token;

      const refreshToken =
        res?.data?.result?.refreshToken ||
        res?.data?.refreshToken;

      if (!token) {
        setMessage("❌ Đăng nhập thất bại: Không nhận được token từ server.");
        return;
      }

      // Save tokens
      localStorage.setItem("access_token", token);
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Fetch profile (may require adjusting endpoint to match your backend)
      const profileRes = await axiosClient.get("/user/getUser");
      const user = profileRes?.data?.result || profileRes?.data;

      if (user && (user.roles || user.role)) {
        localStorage.setItem("user", JSON.stringify(user));
        setMessage("✅ Đăng nhập thành công!");
        setTimeout(() => {
          window.location.href = "/home";
        }, 800);
      } else {
        console.error("API Profile không trả về đủ thông tin:", profileRes?.data);
        setMessage("❌ Lỗi: Không thể lấy thông tin profile người dùng.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Login Error:", error);
      let errMsg = "Sai tên đăng nhập hoặc mật khẩu.";
      if (error.response) {
        if (error.response.status === 401) {
          errMsg = error.response.data?.message || "Sai tên đăng nhập hoặc mật khẩu.";
        } else if (error.response.status === 404) {
          errMsg = "Lỗi: Không tìm thấy API endpoint. Vui lòng kiểm tra lại.";
        } else if (error.response.data?.message) {
          errMsg = error.response.data.message;
        }
      }
      setMessage(`❌ Lỗi: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Welcome Admin 👋
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition duration-200 flex items-center justify-center ${
              loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "Login"
            )}
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-4 text-sm ${
              message.includes("✅")
                ? "text-green-600"
                : message.includes("❌")
                ? "text-red-600"
                : "text-gray-700"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;