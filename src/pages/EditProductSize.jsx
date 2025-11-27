import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Package } from "lucide-react";
import axiosClient from "../api/axiosClient";
import UserProfileButton from "../components/UserProfileButton";

export default function EditProductSize() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const location = useLocation();
  const productName = location.state?.productName || "Sản phẩm";

  const [productSizes, setProductSizes] = useState([]); // Size hiện có của sản phẩm
  const [allSizes, setAllSizes] = useState([]); // Tất cả size có sẵn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // State cho size mới cần thêm
  const [newSizeEntries, setNewSizeEntries] = useState([]);

  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all sizes
      const allSizesRes = await axiosClient.get("/size/get-all-size", {
        headers: { "x-no-redirect": "1" }
      });

      console.log("📏 All Sizes Response:", allSizesRes.data);

      let aSizes = [];
      if (Array.isArray(allSizesRes.data?.result)) {
        aSizes = allSizesRes.data.result;
      } else if (Array.isArray(allSizesRes.data)) {
        aSizes = allSizesRes.data;
      }
      aSizes.sort((a, b) => a.size - b.size);
      console.log("📏 Processed All Sizes:", aSizes);
      setAllSizes(aSizes);

      // Fetch ALL product-sizes, then filter by productId
      let pSizes = [];
      try {
        const allProductSizesRes = await axiosClient.get(`/product-size/get-all`, {
          headers: { "x-no-redirect": "1" }
        });

        console.log("📏 All Product Sizes Response:", allProductSizesRes.data);

        let allProductSizes = [];
        if (Array.isArray(allProductSizesRes.data?.result)) {
          allProductSizes = allProductSizesRes.data.result;
        } else if (Array.isArray(allProductSizesRes.data)) {
          allProductSizes = allProductSizesRes.data;
        }

        // Filter by current productId and map fields correctly
        pSizes = allProductSizes
          .filter(ps => ps.productId === parseInt(productId))
          .map(ps => ({
            id: ps.id,                    // ID of product-size record
            productId: ps.productId,
            sizeId: ps.sizeId,           // Actual sizeId field
            sizeName: ps.sizeName,       // Size name/number
            quantity: ps.quantity,
            productSizeId: ps.id         // Same as id, for consistency
          }))
          .filter(ps => ps.quantity > 0);

      } catch (psErr) {
        console.log("📏 Error fetching product sizes:", psErr);
        pSizes = [];
      }

      console.log("📏 Processed Product Sizes:", pSizes);
      setProductSizes(pSizes);

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.");
      } else {
        setError("Không thể tải dữ liệu size. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Thay đổi quantity của size hiện có
  const handleExistingQuantityChange = (index, newQuantity) => {
    const updated = [...productSizes];
    updated[index].quantity = parseInt(newQuantity) || 0;
    setProductSizes(updated);
  };

  // Xóa size hiện có
  const handleDeleteExistingSize = async (productSizeRecord) => {
    const sizeInfo = allSizes.find(s => s.id === productSizeRecord.sizeId);
    const sizeName = sizeInfo?.size || productSizeRecord.sizeName;
    
    if (!window.confirm(`Bạn có chắc muốn xóa Size ${sizeName}?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/product-size/delete/${productSizeRecord.id}`, {
        headers: { "x-no-redirect": "1" }
      });
      
      setProductSizes(prev => prev.filter(ps => ps.id !== productSizeRecord.id));
      alert(`✅ Đã xóa Size ${sizeName} thành công!`);
    } catch (err) {
      console.error("Lỗi khi xóa size:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.");
      } else {
        alert(`❌ Xóa Size ${sizeName} thất bại: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Thêm dòng size mới
  const handleAddNewSizeRow = () => {
    setNewSizeEntries([...newSizeEntries, { sizeId: "", quantity: 1 }]);
  };

  // Xóa dòng size mới
  const handleRemoveNewSizeRow = (index) => {
    setNewSizeEntries(newSizeEntries.filter((_, i) => i !== index));
  };

  // Thay đổi size mới
  const handleNewSizeChange = (index, field, value) => {
    const updated = [...newSizeEntries];
    updated[index][field] = field === 'quantity' ? parseInt(value) || 0 : value;
    setNewSizeEntries(updated);
  };

  // Lưu thay đổi
  const handleSave = async () => {
    const newSizeIds = newSizeEntries.map(e => e.sizeId).filter(id => id);
    const hasDuplicate = newSizeIds.length !== new Set(newSizeIds).size;
    
    if (hasDuplicate) {
      setError("Không thể thêm cùng một size nhiều lần!");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const promises = [];

      // 1. Update các size hiện có
      productSizes.forEach(ps => {
        if (ps.productSizeId) {
          promises.push(
            axiosClient.put(`/product-size/update/${ps.productSizeId}`, {
              productId: parseInt(productId),
              sizeId: ps.sizeId,
              quantity: ps.quantity
            }, {
              headers: { "x-no-redirect": "1" }
            })
          );
        }
      });

      // 2. Tạo size mới
      newSizeEntries.forEach(entry => {
        if (entry.sizeId && entry.quantity > 0) {
          promises.push(
            axiosClient.post("/product-size/create", {
              productId: parseInt(productId),
              sizeId: parseInt(entry.sizeId),
              quantity: entry.quantity
            }, {
              headers: { "x-no-redirect": "1" }
            })
          );
        }
      });

      await Promise.all(promises);
      alert("Cập nhật size sản phẩm thành công!");
      navigate("/products");

    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      console.error("Chi tiết lỗi:", err.response?.data);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.");
      } else if (err.response?.data?.message?.includes("existed")) {
        setError("Size này đã tồn tại cho sản phẩm. Vui lòng chọn size khác hoặc cập nhật size hiện có.");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.");
      } else {
        setError(`Lưu thất bại: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  // Lấy danh sách size chưa được sử dụng
  const getAvailableSizes = () => {
    // Lấy các sizeId đã được sử dụng
    const usedSizeIds = productSizes.map(ps => {
      // ps có thể có sizeId hoặc size.id
      return ps.sizeId || ps.size?.id || null;
    }).filter(id => id !== null);

    // Filter ra các size chưa dùng
    const availableSizes = allSizes.filter(s => !usedSizeIds.includes(s.id));
    console.log("📏 Available Sizes:", availableSizes);
    return availableSizes;
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6 flex items-center justify-center">
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen p-6 text-gray-800">
      <UserProfileButton />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 rounded-2xl mb-6 shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Quản lý Size Sản phẩm</h2>
          <p className="text-sm text-purple-100">{productName}</p>
        </div>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
          {error}
        </div>
      )}

      {/* Card chính */}
      <div className="bg-white p-6 rounded-2xl shadow-md max-w-4xl mx-auto">
        {/* Size hiện có */}
        <div className="mb-8">
          <h3 className="text-md font-semibold mb-4 text-gray-700">
            Size hiện có ({productSizes.length})
          </h3>

          {productSizes.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có size nào cho sản phẩm này.</p>
          ) : (
            <div className="space-y-3">
              {productSizes.map((ps, index) => {
                const sizeInfo = allSizes.find(s => s.id === ps.sizeId);
                return (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <Package size={16} className="text-purple-600" />
                      <span className="font-medium">Size: {sizeInfo?.size || ps.sizeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Số lượng:</label>
                      <input
                        type="number"
                        min="0"
                        value={ps.quantity}
                        onChange={(e) => handleExistingQuantityChange(index, e.target.value)}
                        className="w-20 px-2 py-1 border rounded-lg text-center"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteExistingSize(ps)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Xóa size"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Thêm size mới */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-semibold text-gray-700">Thêm Size mới</h3>
            <button
              onClick={handleAddNewSizeRow}
              className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition"
            >
              <Plus size={16} /> Thêm Size
            </button>
          </div>

          {newSizeEntries.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có size mới nào. Nhấn "Thêm Size" để bắt đầu.</p>
          ) : (
            <div className="space-y-3">
              {newSizeEntries.map((entry, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <select
                    value={entry.sizeId}
                    onChange={(e) => handleNewSizeChange(index, 'sizeId', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">-- Chọn size --</option>
                    {getAvailableSizes().map(s => (
                      <option key={s.id} value={s.id}>Size {s.size}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Số lượng:</label>
                    <input
                      type="number"
                      min="1"
                      value={entry.quantity}
                      onChange={(e) => handleNewSizeChange(index, 'quantity', e.target.value)}
                      className="w-20 px-2 py-1 border rounded-lg text-center"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveNewSizeRow(index)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút lưu */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
