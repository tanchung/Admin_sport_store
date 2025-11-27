import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Edit3,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Search,
  Plus,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient";

// ================== HÀM HỖ TRỢ (Giữ nguyên) ==================

// Hàm định dạng vai trò (lấy vai trò cao nhất)
const formatRole = (roles) => {
  if (!roles || roles.length === 0) return "N/A";
  
  // Ưu tiên "ADMIN" nếu có
  const isAdmin = roles.some(r => r.name === "ROLE_ADMIN");
  if (isAdmin) return "Admin";

  const isStaff = roles.some(r => r.name === "ROLE_STAFF");
  if (isStaff) return "Staff";
  
  // Lấy vai trò đầu tiên nếu không phải 2 vai trò trên
  return roles[0].name.replace("ROLE_", ""); 
};

// Hàm định dạng class cho vai trò
const getRoleClass = (roleName) => {
  if (roleName === "Admin") {
    return "bg-pink-100 text-pink-700";
  }
  if (roleName === "Staff") {
    return "bg-sky-100 text-sky-700";
  }
  return "bg-gray-100 text-gray-700";
};

// Hàm định dạng ngày
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    // API trả về "01/01/1990", cần chuyển sang "1990-01-01" để Date() hiểu
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      return new Date(isoDate).toLocaleDateString("vi-VN");
    }
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch (error) { // Đổi 'e' thành 'error' và sử dụng nó
    console.error("Lỗi định dạng ngày:", error); // Thêm log lỗi
    return "N/A";
  }
};

// ================== COMPONENT CHÍNH ==================

export default function AdminManagement() {
  const navigate = useNavigate();

  // --- STATE CHO DỮ LIỆU TỪ API ---
  const [admins, setAdmins] = useState([]); // Dữ liệu gốc từ API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE CHO PHÂN TRANG & SẮP XẾP (SERVER-SIDE) ---
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  
  // --- STATE CHO BỘ LỌC (CLIENT-SIDE) ---
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tất cả vai trò");
  
  // --- STATE QUYỀN ADMIN ---
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // ================== USEEFFECT KIỂM TRA QUYỀN (Giữ nguyên) ==================
  useEffect(() => {
    try {
      const userString = localStorage.getItem("user"); 
      if (userString) {
        const user = JSON.parse(userString);
        
        // --- LOGIC KIỂM TRA LINH HOẠT ---
        let isAdmin = user.roles?.some(role => role.name === "ROLE_ADMIN");
        if (!isAdmin) {
          isAdmin = (user.role === "ROLE_ADMIN" || user.role === "ADMIN");
        }
        
        setIsSuperAdmin(isAdmin);

        if (!isAdmin) {
            console.warn("User trong localStorage không có quyền Admin:", user);
        }
        
      } else {
         setIsSuperAdmin(false);
      }
    } catch (error) { 
      console.error("Failed to parse user from localStorage", error);
      setIsSuperAdmin(false); 
    }
  }, []); 
  // =======================================================================


  // --- HÀM GỌI API (Giữ nguyên) ---
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        pageNumber,
        pageSize,
        sortBy,
        sortDir,
      });

      const res = await axiosClient.get(`/user/get-managers?${params.toString()}`);
      
      const content = res.data?.result?.content || [];
      const totalPagesData = res.data?.result?.page?.totalPages || 1;

      setAdmins(content);
      setTotalPages(totalPagesData || 1);

    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách quản lý:", err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError("Bạn không có quyền xem danh sách này. Vui lòng liên hệ quản trị viên.");
      } else {
        setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, sortBy, sortDir]);

  // --- GỌI API KHI STATE THAY ĐỔI ---
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]); 

  // --- HÀM XỬ LÝ SẮP XẾP ---
  const handleSort = (columnName) => {
    if (sortBy === columnName) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(columnName);
      setSortDir("asc");
    }
    setPageNumber(0); 
  };

  // --- HÀM XỬ LÝ PHÂN TRANG ---
  const handlePrev = () => pageNumber > 0 && setPageNumber(pageNumber - 1);
  const handleNext = () =>
    pageNumber < totalPages - 1 && setPageNumber(pageNumber + 1);

  // ================== THAY ĐỔI 1: THÊM KIỂM TRA QUYỀN TRONG HÀM XÓA ==================
  const handleDelete = async (id) => {
      // Thêm lớp bảo vệ: chỉ Super Admin mới được gọi hàm này
      if (!isSuperAdmin) {
        alert("Bạn không có quyền thực hiện hành động này.");
        return;
      }
      
      if (!window.confirm("Bạn có chắc muốn xoá người dùng này?")) return;
      
      try {
        await axiosClient.delete(`/user/delete/${id}`);
        alert("Đã xoá người dùng thành công!");
        fetchAdmins(); // Tải lại danh sách
      } catch (err) {
        console.error("❌ Lỗi khi xoá:", err);
        alert("Không thể xoá người dùng!");
      }
  };
  // ================== KẾT THÚC THAY ĐỔI 1 ==================

  // --- HÀM XỬ LÝ BỘ LỌC (Giữ nguyên) ---
  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const role = formatRole(a.roles);
      const searchLower = search.toLowerCase();
      
      const roleMatch = (roleFilter === "Tất cả vai trò" || role === roleFilter);
      const searchMatch = 
        (a.username?.toLowerCase().includes(searchLower)) ||
        (a.email?.toLowerCase().includes(searchLower));

      return roleMatch && searchMatch;
    });
  }, [admins, search, roleFilter]);

  return (
    <div className="flex-1 p-6 bg-[#F5F7FB] text-gray-800 min-h-screen">
      {/* Header (Giữ nguyên) */}
      <UserProfileButton />
      <div className="bg-white shadow-md rounded-2xl p-5 mb-6">
        {/* Tiêu đề và các nút (Giữ nguyên) */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700">
              Quản lý Admin & Nhân viên
            </h2>
            <p className="text-sm text-gray-500">
              Theo dõi và quản lý tài khoản quản trị hệ thống
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/add-admin", { state: { role: "STAFF" } })} 
              disabled={!isSuperAdmin} 
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isSuperAdmin ? "Chỉ Admin mới có quyền tạo Staff" : "Tạo tài khoản Staff mới"}
            >
              <Plus size={16} /> Tạo Staff
            </button>
            <button
              onClick={() => navigate("/add-admin", { state: { role: "ADMIN" } })} 
              disabled={!isSuperAdmin} 
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isSuperAdmin ? "Chỉ Admin mới có quyền tạo Admin" : "Tạo tài khoản Admin mới"}
            >
              <Plus size={16} /> Tạo Admin
            </button>
          </div>
        </div>

        {/* Bộ lọc (Giữ nguyên) */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring focus:ring-blue-300"
          >
            <option>Tất cả vai trò</option>
            <option>Admin</option>
            <option>Staff</option>
          </select>
          <div className="flex items-center border rounded-lg overflow-hidden px-3 py-2 w-full max-w-xs shadow-sm">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Tìm kiếm username, email..."
              className="text-sm outline-none w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading (Giữ nguyên) */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 size={48} className="animate-spin text-blue-500" />
          <p className="ml-4 text-xl text-gray-600">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Lỗi (Giữ nguyên) */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center mt-20">
          <div className="p-6 bg-red-100 text-red-800 rounded-lg shadow-md max-w-lg text-center">
            <div className="flex justify-center mb-3">
              <AlertCircle size={48} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Đã xảy ra lỗi</h2>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Bảng admin (Chỉ hiện khi không loading và không lỗi) */}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-2xl p-4 overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="p-3 cursor-pointer hover:bg-blue-700" onClick={() => handleSort("id")}>
                  <div className="flex items-center gap-1">
                    ID
                    {sortBy === "id" && (sortDir === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:bg-blue-700" onClick={() => handleSort("username")}>
                   <div className="flex items-center gap-1">
                    Tên đăng nhập
                    {sortBy === "username" && (sortDir === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:bg-blue-700" onClick={() => handleSort("email")}>
                   <div className="flex items-center gap-1">
                    Email
                    {sortBy === "email" && (sortDir === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                  </div>
                </th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Ngày sinh</th>
                <th className="p-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    {admins.length === 0 ? "Không có dữ liệu." : "Không tìm thấy kết quả phù hợp."}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((a) => {
                  const roleName = formatRole(a.roles);
                  return (
                    <tr
                      key={a.id}
                      className="border-b hover:bg-gray-50 transition-all"
                    >
                      <td className="p-3 text-gray-600">#{a.id}</td>
                      <td className="p-3 font-medium text-gray-800">{a.username}</td>
                      <td className="p-3">{a.email}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleClass(roleName)}`}
                        >
                          {roleName}
                        </span>
                      </td>
                      <td className="p-3">
                        {a.nonLocked ? (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <CheckCircle size={14} /> Hoạt động
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-500 font-medium">
                            <XCircle size={14} /> Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="p-3">{formatDate(a.dateOfBirth)}</td> 
                      
                      {/* ================== THAY ĐỔI 2: CẬP NHẬT NÚT XÓA ================== */}
                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-2 justify-end">
                            {/* Nút Sửa (Giữ nguyên) */}
                            <button 
                              className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600" 
                              onClick={() => navigate("/admin-detail", { state: a })}
                            >
                              <Edit3 size={16} />
                            </button>
                            
                            {/* Nút Xóa (Đã cập nhật) */}
                            <button
                              className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleDelete(a.id)}
                              disabled={!isSuperAdmin} // Vô hiệu hóa nếu không phải Admin
                              title={!isSuperAdmin ? "Chỉ Admin mới có quyền xóa" : "Xóa người dùng"}
                            >
                              <Trash2 size={16} />
                            </button>
                        </div>
                      </td>
                      {/* ================== KẾT THÚC THAY ĐỔI 2 ================== */}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Phân trang (Giữ nguyên) */}
          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 border-t">
            <span>
              Trang {totalPages === 0 ? 0 : pageNumber + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={pageNumber === 0 || loading}
                className="px-3 py-1 border rounded-lg flex items-center gap-1 disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Trước
              </button>
              <button
                onClick={handleNext}
                disabled={pageNumber >= totalPages - 1 || loading}
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