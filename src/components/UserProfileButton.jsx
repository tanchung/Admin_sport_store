import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { ChevronDown } from "lucide-react"; // Icon cho đẹp
import { motion, AnimatePresence } from "framer-motion"; // Thêm AnimatePresence

// Component của bạn
const UserProfileButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null); // Dùng để xử lý "click outside"

  // ================== CẬP NHẬT (BẮT ĐẦU) ==================
  // State để lưu thông tin user
  const [displayName, setDisplayName] = useState("User");
  const [initials, setInitials] = useState("U");
  const [roleName, setRoleName] = useState("Guest"); // 'Admin', 'Staff', hoặc 'Guest'

  // Đọc thông tin user từ localStorage khi component tải
  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);

        // 1. Lấy Tên (dùng username làm tên hiển thị)
        const name = user.username || "User";
        setDisplayName(name);

        // 2. Lấy 2 chữ cái đầu
        const initial = name.substring(0, 2).toUpperCase();
        setInitials(initial);

        // 3. Lấy Vai trò (Role)
        let role = "Guest";
        // Logic kiểm tra linh hoạt (giống file AdminManagement)
        if (user.roles && user.roles.length > 0) {
          if (user.roles.some((r) => r.name === "ROLE_ADMIN")) {
            role = "Admin";
          } else if (user.roles.some((r) => r.name === "ROLE_STAFF")) {
            role = "Staff";
          }
        } else if (user.role) { // Dự phòng nếu API chỉ trả về user.role
          if (user.role === "ROLE_ADMIN") role = "Admin";
          if (user.role === "ROLE_STAFF") role = "Staff";
        }
        setRoleName(role);
      } else {
        // Nếu không có user, quay về login
        navigate("/login");
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // Nếu lỗi (localStorage hỏng), bắt người dùng đăng nhập lại
      handleLogout();
    }
    // Chúng ta chỉ muốn chạy cái này 1 lần khi component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Hàm xử lý khi nhấn logout (Cập nhật để xóa localStorage)
  const handleLogout = () => {
    setIsMenuOpen(false);
    
    // Xóa thông tin đăng nhập
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    console.log("Đã đăng xuất, chuyển về trang login...");
    navigate("/login"); // 5. Chuyển đến trang login
  };
  // ================== CẬP NHẬT (KẾT THÚC) ==================

  // Hiệu ứng để đóng menu khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    // 3. Đổi thành flex justify-center để căn giữa
    <div className="flex justify-center items-center mb-4">
      {/* 4. Thêm position relative và gán ref */}
      <div className="relative" ref={menuRef}>
        {/* 4. Chuyển thành button và thêm onClick */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle menu
          className="flex items-center p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <span className="text-gray-700 font-medium">Welcome,</span>
          
          {/* ================== THAY ĐỔI DYNAMIC ================== */}
          <span
            className={`font-bold ml-1 mr-2 ${
              roleName === "Admin" ? "text-blue-600" : "text-green-600"
            }`}
          >
            {roleName}
          </span>
          <div
            className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold ${
              roleName === "Admin" ? "bg-blue-500" : "bg-green-500"
            }`}
          >
            {initials}
          </div>

          <ChevronDown
            size={16}
            className={`ml-2 text-gray-500 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* 5. Menu Logout (hiện/ẩn dựa trên state) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden"
            >
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserProfileButton;