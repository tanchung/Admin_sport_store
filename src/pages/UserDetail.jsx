import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Lock,
  Unlock,
} from "lucide-react";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient";

export default function UserDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useParams();
  const userState = location.state;

  const [formData, setFormData] = useState(
    userState || {
      id: "",
      username: "",
      firstName: "",
      lastName: "",
      phone: "",
      permanentAddress: "",
      gender: "",
      dateOfBirth: "",
      avatar: "",
      email: "",
      nonLocked: true,
    }
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userState && userId) {
      fetchUserById(userId);
    }
  }, [userId]);

  const fetchUserById = async (id) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/user/getUser/${id}`);
      if (res.data?.result) {
        const data = res.data.result;
        setFormData({
          id: data.id,
          username: data.username || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          permanentAddress: data.permanentAddress || "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth
            ? data.dateOfBirth.split("T")[0]
            : "",
          avatar: data.avatar || "",
          email: data.email || "",
          nonLocked: data.nonLocked,
        });
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải thông tin người dùng:", err);
      alert("Không thể tải thông tin người dùng!");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Gọi API khóa/mở khóa
  const handleToggleLock = async () => {
    try {
      setLoading(true);
      await axiosClient.put(`/user/lock/${formData.id}`);
      alert(
        formData.nonLocked
          ? "🔒 Người dùng đã bị khóa!"
          : "🔓 Người dùng đã được mở khóa!"
      );
      fetchUserById(formData.id); // refresh lại thông tin
    } catch (err) {
      console.error("❌ Lỗi khi khóa/mở khóa người dùng:", err);
      alert("Không thể thay đổi trạng thái người dùng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#F5F7FB] min-h-screen text-gray-800">
      <UserProfileButton />

      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4 rounded-xl mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Chi tiết người dùng</h2>
          <p className="text-sm opacity-90">
            Xem thông tin và khóa/mở khóa tài khoản
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white text-green-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Đang tải dữ liệu người dùng...
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* CỘT TRÁI */}
          <div className="col-span-1 bg-white rounded-2xl shadow p-6 text-center">
            <div className="flex flex-col items-center">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="avatar"
                  className="w-24 h-24 rounded-full mb-3 object-cover border"
                />
              ) : (
                <div className="bg-green-100 p-4 rounded-full mb-3">
                  <UserCircle size={70} className="text-green-600" />
                </div>
              )}

              <h2 className="text-lg font-semibold mt-4">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-gray-500 text-sm">{formData.email}</p>
            </div>

            <div className="mt-6 border-t pt-4 text-sm space-y-2 text-left">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-green-500" />
                <span>{formData.email || "Chưa có email"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-green-500" />
                <span>{formData.phone || "Chưa có số điện thoại"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-green-500" />
                <span>{formData.permanentAddress || "Chưa có địa chỉ"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-green-500" />
                <span>
                  {formData.dateOfBirth
                    ? new Date(formData.dateOfBirth).toLocaleDateString("vi-VN")
                    : "Chưa có ngày sinh"}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleLock}
              className={`flex items-center justify-center gap-2 w-full mt-6 px-4 py-2 rounded-lg text-white ${
                formData.nonLocked
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {formData.nonLocked ? (
                <>
                  <Lock size={16} /> Khóa người dùng
                </>
              ) : (
                <>
                  <Unlock size={16} /> Mở khóa người dùng
                </>
              )}
            </button>
          </div>

          {/* CỘT PHẢI */}
          <div className="col-span-2 bg-white rounded-2xl shadow p-6">
            <h3 className="text-md font-semibold mb-4 text-green-600">
              Thông tin cá nhân
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-1">Tên đăng nhập</label>
                <input
                  name="username"
                  value={formData.username}
                  disabled
                  className="w-full border rounded-lg p-2 text-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full border rounded-lg p-2 text-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Họ</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  disabled
                  className="w-full border rounded-lg p-2 text-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Tên</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  disabled
                  className="w-full border rounded-lg p-2 text-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Số điện thoại</label>
                <input
                  name="phone"
                  value={formData.phone}
                  disabled
                  className="w-full border rounded-lg p-2 text-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Giới tính</label>
                <input
                  name="gender"
                  value={formData.gender}
                  disabled
                  className="w-full border rounded-lg p-2 text-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Ngày sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ""}
                  disabled
                  className="w-full border rounded-lg p-2 text-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Địa chỉ</label>
                <input
                  name="permanentAddress"
                  value={formData.permanentAddress || ""}
                  disabled
                  className="w-full border rounded-lg p-2 text-sm bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
