import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, Edit3, Trash2, Plus, Search, X, Loader2, AlertCircle } from "lucide-react"; // Thêm Loader2, AlertCircle
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient"; 

export default function Categorys() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- HÀM TẢI DỮ LIỆU TỪ API (Hỗ trợ tìm kiếm) ---
  const fetchCategories = async (searchTerm = null) => {
    setLoading(true);
    setError(null);
    
    // ================== THAY ĐỔI 1: SỬA API ENDPOINT ==================
    // Chọn API endpoint: getall hoặc tìm kiếm theo tên
    const url = searchTerm
      ? `/category/get-by-name/${searchTerm}` // Sửa từ getcategory
      : "/category/getall";
    // ================================================================

    try {
      const res = await axiosClient.get(url, {
        headers: { "x-no-redirect": "1" }
      });
      
      let apiData = [];
      // --- Xử lý các định dạng response khác nhau ---
      if (res.data && Array.isArray(res.data.result)) {
        // 1. Response có { result: [...] } (cho getall)
        apiData = res.data.result;
      } else if (Array.isArray(res.data)) {
        // 2. Response là [...] (Dự phòng)
        apiData = res.data;
      // ================== THAY ĐỔI 2: SỬA CẤU TRÚC RESPONSE ==================
      } else if (res.data && typeof res.data.result === 'object' && res.data.result.id) {
         // 3. Response là { result: { id: ... } } (cho get-by-name)
         apiData = [res.data.result]; // Lấy từ res.data.result
      // =====================================================================
      } else if (res.data && typeof res.data === 'object' && res.data.id) {
         // 4. Response là { id: ... } (Dự phòng cho API cũ)
         apiData = [res.data];
      } else {
         console.error("API response is not an array or expected object:", res.data);
         apiData = []; // Đặt là mảng rỗng nếu API trả về không đúng
      }
      setCategories(apiData);

    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
      // Nếu tìm kiếm không thấy (404) thì chỉ set mảng rỗng, không báo lỗi
      if (err.response && err.response.status === 404) {
        setCategories([]);
      } 
      // ================== THAY ĐỔI 3: XỬ LÝ LỖI 401/403 ==================
      else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        // Giờ đây sẽ hiển thị lỗi thay vì văng ra (nếu axiosClient.js đã được sửa)
        setError("Bạn không có quyền truy cập hoặc phiên đã hết hạn.");
        setCategories([]);
      } 
      // =================================================================
      else {
        setError("Không thể tải danh mục. Vui lòng thử lại.");
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- GỌI API KHI COMPONENT ĐƯỢC TẢI ---
  useEffect(() => {
    fetchCategories(); // Tải tất cả danh mục khi mới vào trang
  }, []);

  // --- HÀM XỬ LÝ XÓA ---
  const handleDelete = async (id) => {
    // Xác nhận trước khi xóa
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await axiosClient.delete(`/category/delete/${id}`, {
          headers: { "x-no-redirect": "1" }
        }); 
        alert("Xóa danh mục thành công!");
        // Tải lại danh sách (nếu đang tìm kiếm thì tải lại kết quả tìm kiếm)
        fetchCategories(search ? search : null);
      } catch (err) {
        console.error("Lỗi khi xóa danh mục:", err);
        // ================== THAY ĐỔI 4: XỬ LÝ LỖI KHI XÓA ==================
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          // Hiển thị lỗi, không văng ra
          setError("Bạn không có quyền xóa danh mục này.");
        } else {
          alert("Xóa thất bại. Danh mục có thể đang được sử dụng.");
        }
        // =================================================================
      }
    }
  };

  // --- HÀM XỬ LÝ GỬI TÌM KIẾM ---
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Ngăn form reload trang
    fetchCategories(search); // Gọi API với từ khóa tìm kiếm
  };

  // --- HÀM XỬ LÝ XÓA TÌM KIẾM ---
  const handleClearSearch = () => {
    setSearch("");
    fetchCategories(null); // Tải lại toàn bộ danh sách
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6 text-gray-800">
      {/* Header */}
      <UserProfileButton />
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Quản lý Danh mục</h2>
          <p className="text-sm text-blue-100">Quản lý danh mục sản phẩm</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-indigo-50 transition-all"
          onClick={() => navigate("/add-category")}
        >
          <Plus size={16} /> Thêm Danh mục
        </button>
      </div>

      
      <div className="bg-white p-4 rounded-xl shadow-md mb-4 flex justify-end">
        <form onSubmit={handleSearchSubmit} className="flex items-center border rounded-lg px-3 py-2 w-full max-w-md relative">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục theo tên..."
            className="flex-1 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="ml-2 bg-indigo-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-indigo-700 transition-all"
          >
            Tìm
          </button>
        </form>
      </div>
      
      {/* ================== THAY ĐỔI 5: GIAO DIỆN LOADING/LỖI ================== */}
      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 size={48} className="animate-spin text-blue-500" />
          <p className="ml-4 text-xl text-gray-600">Đang tải danh mục...</p>
        </div>
      )}

      {/* Lỗi */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center mt-10">
          <div className="p-6 bg-red-100 text-red-800 rounded-lg shadow-md max-w-lg text-center">
            <div className="flex justify-center mb-3">
              <AlertCircle size={48} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Đã xảy ra lỗi</h2>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Bảng danh mục (Chỉ hiện khi không loading và không có lỗi) */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <th className="p-3 align-middle">Mã DM</th>
                <th className="p-3 align-middle">Tên Danh mục</th>
                <th className="p-3 w-40 text-right align-middle">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-500">
                    {search 
                      ? `Không tìm thấy danh mục nào với tên "${search}".`
                      : "Không tìm thấy danh mục nào."
                    }
                  </td>
                </tr>
              )}
              
              {categories.map((cat, index) => (
                <tr
                  key={cat.id || index} 
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  {/* === CỘT 1: ID  */}
                  <td className="p-3 text-indigo-600 font-medium truncate align-middle">
                    #{cat.id}
                  </td>
                  
                  {/* === CỘT 2: TÊN DANH MỤC  */}
                  <td className="p-3 flex items-center gap-2 truncate align-middle">
                    <Folder size={16} className="text-blue-500 flex-shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </td>
                  
                  {/* === CỘT 3: THAO TÁC  */}
                  <td className="p-3 text-right align-middle">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <button 
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition" 
                        onClick={() => navigate(`/edit-category/${cat.id}`, { state: cat })}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-sm text-gray-500 mt-3 px-5 py-3">
            Hiển thị {categories.length} danh mục
          </div>
        </div>
      )}
      {/* ===================================================================== */}
    </div>
  );
}