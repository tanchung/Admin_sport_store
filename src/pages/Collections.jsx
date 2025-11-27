import React, { useState, useEffect, useCallback } from "react"; // Thêm useCallback
import { useNavigate } from "react-router-dom";
import { 
    Archive, 
    Edit3, 
    Trash2, 
    Plus, 
    Search, 
    X, 
    Image as ImageIcon,
    ChevronLeft, // Thêm
    ChevronRight // Thêm
} from "lucide-react";
import UserProfileButton from "../components/UserProfileButton";
import axiosClient from "../api/axiosClient";

export default function Collections() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // --- STATE ĐỂ LƯU DỮ LIỆU TỪ API ---
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================== THÊM STATE PHÂN TRANG ==================
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize] = useState(10); // Giữ cố định 10 item mỗi trang
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0); // Tổng số item
  // ==========================================================

  // --- HÀM TẢI DỮ LIỆU TỪ API (Đã sửa) ---
  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Thêm tham số phân trang
    const params = new URLSearchParams({
      page: pageNumber, // Dùng 'page' và 'size' theo Swagger của bạn
      size: pageSize,
    });

    let url;
    if (search) {
      // Nếu tìm kiếm, thêm 'name' vào params
      params.append("name", search);
      url = `/collection/get-collection-by-name?${params.toString()}`;
    } else {
      url = `/collection/get-all?${params.toString()}`;
    }

    try {
      const res = await axiosClient.get(url);
      
      let apiData = [];
      let pages = 1;
      let elements = 0;

      // KIỂM TRA CẤU TRÚC PHÂN TRANG (cho cả /get-all và /search)
      if (res.data.result && Array.isArray(res.data.result.content)) {
        apiData = res.data.result.content;
        pages = res.data.result.page?.totalPages || 1;
        elements = res.data.result.page?.totalElements || 0;
      } 
      // Fallback nếu API tìm kiếm chỉ trả về mảng (không phân trang)
      else if (res.data && Array.isArray(res.data.result)) {
        apiData = res.data.result;
        pages = 1;
        elements = res.data.result.length;
      } 
      else {
         console.error("API response is not an array or expected object:", res.data);
         apiData = []; 
      }
      
      setCollections(apiData);
      setTotalPages(pages);
      setTotalElements(elements);

    } catch (err) {
      console.error("Lỗi khi tải bộ sưu tập:", err);
      if (err.response && err.response.status === 404) {
        setCollections([]); // Xóa danh sách nếu tìm kiếm 404
        setTotalPages(1);
        setTotalElements(0);
      } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        alert("Bạn không có quyền truy cập hoặc phiên đã hết hạn. Vui lòng đăng nhập lại.");
        setError("Bạn không có quyền truy cập.");
      } else {
        setError("Không thể tải bộ sưu tập. Vui lòng thử lại.");
        setCollections([]);
      }
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, search]); // Thêm search vào dependencies

  // --- GỌI API KHI STATE THAY ĐỔI ---
  useEffect(() => {
    fetchCollections(); 
  }, [fetchCollections]); // Chỉ phụ thuộc vào hàm callback

  // --- HÀM XỬ LÝ XÓA ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bộ sưu tập này?")) {
      try {
        await axiosClient.delete(`/collection/delete-collection/${id}`); 
        alert("Xóa bộ sưu tập thành công!");
        // Tải lại trang hiện tại
        fetchCollections(); 
      } catch (err) {
        console.error("Lỗi khi xóa bộ sưu tập:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else {
          alert("Xóa thất bại. Bộ sưu tập có thể đang được sử dụng.");
        }
      }
    }
  };

  // ================== SỬA HÀM TÌM KIẾM ==================
  // --- HÀM XỬ LÝ GỬI TÌM KIẾM ---
  const handleSearchSubmit = (e) => {
    e.preventDefault(); 
    setPageNumber(0); // Reset về trang đầu tiên khi tìm kiếm
    // fetchCollections sẽ tự động chạy vì 'search' state (dependency của nó) đã thay đổi
    // (nhưng chúng ta cần gọi thủ công nếu search state không đổi)
    // Để đảm bảo, chúng ta gọi fetchCollections thủ công
    fetchCollections();
  };

  // --- HÀM XỬ LÝ XÓA TÌM KIẾM ---
  const handleClearSearch = () => {
    setSearch("");
    setPageNumber(0); // Reset về trang đầu tiên
    // fetchCollections sẽ tự động chạy vì 'search' state (dependency của nó) thay đổi
  };
  
  // === THÊM HÀM XỬ LÝ PHÂN TRANG ===
  const handlePrev = () => {
    if (pageNumber > 0) {
      setPageNumber(pageNumber - 1);
    }
  };
  
  const handleNext = () => {
    if (pageNumber < totalPages - 1) {
      setPageNumber(pageNumber + 1);
    }
  };
  // ==========================================================

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6 text-gray-800">
      {/* Header (Giữ nguyên) */}
      <UserProfileButton />
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-5 rounded-2xl mb-6 shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Quản lý Bộ Sưu Tập</h2>
          <p className="text-sm text-blue-100">Quản lý các bộ sưu tập sản phẩm</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-indigo-50 transition-all"
          onClick={() => navigate("/add-collection")}
        >
          <Plus size={16} /> Thêm Bộ Sưu Tập
        </button>
      </div>

      {/* Ô tìm kiếm (Giữ nguyên) */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-4 flex justify-end">
        <form onSubmit={handleSearchSubmit} className="flex items-center border rounded-lg px-3 py-2 w-full max-w-md relative">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ sưu tập theo tên..."
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

      {/* Bảng danh sách */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <th className="p-3 align-middle w-24">Hình ảnh</th>
              <th className="p-3 align-middle">Tên Bộ Sưu Tập</th>
              <th className="p-3 align-middle">Mô tả</th>
              <th className="p-3 w-32 text-right align-middle">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && collections.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  {search 
                    ? `Không tìm thấy bộ sưu tập nào với tên "${search}".`
                    : "Không tìm thấy bộ sưu tập nào."
                  }
                </td>
              </tr>
            )}
            
            {!loading && !error && collections.map((col, index) => (
              <tr
                key={col.id || index} 
                className="border-b hover:bg-gray-50 transition-all"
              >
                {/* HÌNH ẢNH */}
                <td className="p-3 align-middle">
                  {col.imageUrl ? (
                    <img 
                      src={col.imageUrl} 
                      alt={col.name}
                      className="w-16 h-12 object-cover rounded-lg bg-gray-100"
                      onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100/EEE/31343C?text=Lỗi'}
                    />
                  ) : (
                    <div className="w-16 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-gray-400">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </td>

                {/* TÊN BỘ SƯU TẬP */}
                <td className="p-3 flex items-center gap-2 truncate align-middle">
                  <Archive size={16} className="text-blue-500 flex-shrink-0" /> 
                  <span className="truncate font-medium">{col.name}</span>
                </td>

                {/* MÔ TẢ */}
                <td className="p-3 align-middle text-gray-600">
                  <p className="line-clamp-2" title={col.description}>
                    {col.description || 'N/A'}
                  </p>
                </td>
                
                {/* THAO TÁC */}
                <td className="p-3 text-right align-middle">
                  <div className="inline-flex items-center gap-2 justify-end">
                    <button 
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition" 
                      onClick={() => navigate(`/edit-collection/${col.id}`, { state: col })}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition"
                      onClick={() => handleDelete(col.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================== THÊM PHÂN TRANG ================== */}
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 border-t">
          <span>
            Hiển thị {collections.length} trên tổng số {totalElements} bộ sưu tập ( Trang {totalPages === 0 ? 0 : pageNumber + 1} / {totalPages})
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
        {/* ================== KẾT THÚC PHÂN TRANG ================== */}
      </div>
    </div>
  );
}