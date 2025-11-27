import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUp,  // Icon sắp xếp
  ArrowDown, // Icon sắp xếp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient";

// (Đã xóa component SortableHeader để đơn giản hóa)

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tất cả");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE SẮP XẾP ĐÃ CẬP NHẬT ---
  const [sortBy, setSortBy] = useState("id"); // Cột mặc định để sắp xếp
  const [sortDir, setSortDir] = useState("asc"); // Hướng mặc định

  // --- STATE PHÂN TRANG ---
  const [pageNumber, setPageNumber] = useState(0);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = "/user/getAll";
      const params = new URLSearchParams({
        pageNumber: pageNumber,
        pageSize: pageSize,
      });

      if (search) {
        endpoint = "/user/search";
        params.append("keyword", search);
        // Khi tìm kiếm, API có thể không hỗ trợ sắp xếp, nên ta không thêm
      } else {
        // Chỉ thêm sắp xếp khi không tìm kiếm
        params.append("sortBy", sortBy); // Dùng state sortBy
        params.append("sortDir", sortDir); // Dùng state sortDir
      }

      const res = await axiosClient.get(`${endpoint}?${params.toString()}`);
      console.log("API Response:", res.data);

      const usersData = res.data?.result?.content;
      const totalPagesData = res.data?.result?.page?.totalPages;

      if (usersData) {
        setUsers(usersData);
        setTotalPages(totalPagesData || 1);
        setError("");
      } else {
        setUsers([]);
        setTotalPages(1);
        setError("Không có dữ liệu người dùng!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách người dùng:", err);
      setError("Không thể tải danh sách người dùng!");
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, sortDir, sortBy, search]); // Thêm sortBy vào dependencies

  useEffect(() => {
    if (pageNumber !== 0) setPageNumber(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortDir, sortBy]); // Thêm sortBy

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Lọc client-side theo nonLocked
  const filteredUsers = useMemo(() => {
    if (status === "Tất cả") return users;
    const isActive = status === "Tài khoản hoạt động";
    return users.filter((u) => u.nonLocked === isActive);
  }, [users, status]);

  // --- HÀM SẮP XẾP MỚI ---
  const handleSort = (columnName) => {
    // Nếu bấm vào cột đang được sắp xếp -> đảo chiều
    if (sortBy === columnName) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Nếu bấm vào cột mới -> sắp xếp theo cột đó và mặc định là 'asc'
      setSortBy(columnName);
      setSortDir("asc");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá người dùng này?")) return;
    try {
      await axiosClient.delete(`/user/delete/${id}`);
      alert("Đã xoá người dùng thành công!");
      fetchUsers();
    } catch (err) {
      console.error("❌ Lỗi khi xoá:", err);
      alert("Không thể xoá người dùng!");
    }
  };

  const handlePrev = () => pageNumber > 0 && setPageNumber(pageNumber - 1);
  const handleNext = () =>
    pageNumber < totalPages - 1 && setPageNumber(pageNumber + 1);

  return (
    <div className="flex-1 p-6 bg-[#F5F7FB] min-h-screen text-gray-800">
      <UserProfileButton />

      <div className="bg-white shadow-md rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Quản lý người dùng
              </h2>
              <p className="text-sm text-gray-500">
                Theo dõi và quản lý tài khoản người dùng
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/create-user")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
          >
            <Plus size={16} /> Tạo tài khoản mới
          </button>
        </div>

        <div className="flex flex-wrap gap-3 items-center mt-3">
          <select
            className="border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-300"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Tất cả</option>
            <option>Tài khoản hoạt động</option>
            <option>Không hoạt động</option>
          </select>

          <input
            type="text"
            className="border rounded-lg px-3 py-2 text-sm w-64 outline-none"
            placeholder="Tìm kiếm theo username hoặc email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">
          Đang tải dữ liệu...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              {/* ================== TIÊU ĐỀ BẢNG ĐÃ CẬP NHẬT ================== */}
              <tr className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-sm">
                
                {/* ID Column */}
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center gap-1">
                    ID
                    {/* Hiển thị icon nếu đang sort cột này */}
                    {sortBy === "id" &&
                      (sortDir === "asc" ? (
                        <ArrowUp size={16} />
                      ) : (
                        <ArrowDown size={16} />
                      ))}
                  </div>
                </th>

                {/* Username Column */}
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center gap-1">
                    Username
                    {sortBy === "username" &&
                      (sortDir === "asc" ? (
                        <ArrowUp size={16} />
                      ) : (
                        <ArrowDown size={16} />
                      ))}
                  </div>
                </th>

                {/* Email Column */}
                <th
                  className="py-3 px-4 text-left cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center gap-1">
                    Email
                    {sortBy === "email" &&
                      (sortDir === "asc" ? (
                        <ArrowUp size={16} />
                      ) : (
                        <ArrowDown size={16} />
                      ))}
                  </div>
                </th>

                {/* Cột không sắp xếp */}
                <th className="py-3 px-4 text-left">Ngày sinh</th>
                <th className="py-3 px-4 text-left">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
              {/* ==================================================================== */}
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{u.id}</td>
                    <td className="py-3 px-4">{u.username || "—"}</td>
                    <td className="py-3 px-4">{u.email || "—"}</td>
                    <td className="py-3 px-4">
                      {u.dateOfBirth
                        ? new Date(u.dateOfBirth).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          u.nonLocked
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.nonLocked ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center space-x-3">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          navigate(`/user-detail/${u.id}`, { state: u })
                        }
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-gray-500">
                    Không có người dùng nào phù hợp với tiêu chí
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 border-t">
            <span>
              Trang {totalPages === 0 ? 0 : pageNumber + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={pageNumber === 0}
                className="px-3 py-1 border rounded-lg flex items-center gap-1 disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Trước
              </button>
              <button
                onClick={handleNext}
                disabled={pageNumber >= totalPages - 1}
                className="px-3 py-1 border rounded-lg flex items-center gap-1 disabled:opacity-50"
              >
                Sau <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}