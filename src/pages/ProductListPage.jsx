import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axiosClient.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import ProductTable from "../components/ProductTable.jsx";
import { useToast } from "../context/ToastContext.jsx";
import useProductSearch from "../hooks/useProductSearch.js";

const PAGE_LIMIT = 10;

/** Trang danh sách sản phẩm: tải API, tìm kiếm debounce, lọc, phân trang, đồng bộ URL và xoá. */
export default function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const rawQ = searchParams.get("q") || "";
  const urlQ = rawQ.trim();
  const urlCategory = searchParams.get("category") || "";
  const rawStatus = searchParams.get("status") || "";
  const urlStatus =
    rawStatus === "active" || rawStatus === "inactive" ? rawStatus : "";
  const rawPage = searchParams.get("page");
  const parsedPage = rawPage === null ? 1 : Number(rawPage);
  const isValidPageParam =
    rawPage === null || (Number.isInteger(parsedPage) && parsedPage >= 1);
  const currentPage = isValidPageParam ? parsedPage : 1;

  const [searchText, setSearchText] = useState(urlQ);
  const [categories, setCategories] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const {
    data: products,
    total,
    loading,
    error,
    refetch,
  } = useProductSearch({
    q: urlQ,
    category: urlCategory,
    status: urlStatus,
    page: currentPage,
    limit: PAGE_LIMIT,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  // Tải danh sách danh mục từ API cho bộ lọc và hiển thị tên danh mục.
  useEffect(() => {
    const controller = new AbortController();
    let isCurrent = true;

    async function loadCategories() {
      try {
        const res = await api.get("/categories", { signal: controller.signal });
        if (isCurrent) {
          setCategories(res.data);
        }
      } catch (err) {
        if (
          controller.signal.aborted ||
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }
      }
    }

    loadCategories();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, []);

  // Chuẩn hoá các tham số URL không hợp lệ (ví dụ: từ khoá chỉ có khoảng trắng, page <= 0).
  useEffect(() => {
    if (!isValidPageParam || rawQ !== urlQ || (rawStatus && !urlStatus)) {
      const next = new URLSearchParams(searchParams);
      if (urlQ) next.set("q", urlQ);
      else next.delete("q");
      if (urlStatus) next.set("status", urlStatus);
      else next.delete("status");
      if (rawPage !== null) next.set("page", String(currentPage));
      setSearchParams(next, { replace: true });
    }
  }, [
    isValidPageParam,
    rawQ,
    urlQ,
    rawStatus,
    urlStatus,
    rawPage,
    currentPage,
    searchParams,
    setSearchParams,
  ]);

  // Nếu page trên URL vượt quá tổng số trang thực tế (ví dụ page=999 hoặc vừa xoá hết dòng cuối trang).
  useEffect(() => {
    if (!loading && !error && currentPage > totalPages) {
      const next = new URLSearchParams(searchParams);
      next.set("page", String(totalPages));
      setSearchParams(next, { replace: true });
    }
  }, [
    loading,
    error,
    currentPage,
    totalPages,
    searchParams,
    setSearchParams,
  ]);

  // Đồng bộ ô tìm kiếm khi người dùng điều hướng Back/Forward hoặc mở URL trực tiếp.
  useEffect(() => {
    setSearchText((prev) => (prev.trim() === urlQ ? prev : urlQ));
  }, [urlQ]);

  // Debounce 400ms cho ô tìm kiếm rồi đồng bộ vào URL và đưa về trang 1.
  useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed === urlQ) return undefined;

    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (trimmed) next.set("q", trimmed);
      else next.delete("q");
      next.set("page", "1");
      setSearchParams(next);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText, urlQ, searchParams, setSearchParams]);

  function handleCategoryChange(event) {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    const trimmed = searchText.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    if (value) next.set("category", value);
    else next.delete("category");
    next.set("page", "1");
    setSearchParams(next);
  }

  function handleStatusChange(event) {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    const trimmed = searchText.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    if (value) next.set("status", value);
    else next.delete("status");
    next.set("page", "1");
    setSearchParams(next);
  }

  function handlePageChange(nextPage) {
    const safePage = Math.min(totalPages, Math.max(1, nextPage));
    const next = new URLSearchParams(searchParams);
    next.set("page", String(safePage));
    setSearchParams(next);
  }

  function handleRequestDelete(product) {
    setDeleteError("");
    setProductToDelete(product);
  }

  function handleCancelDelete() {
    if (deleting) return;
    setDeleteError("");
    setProductToDelete(null);
  }

  async function handleConfirmDelete() {
    if (!productToDelete || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/products/${productToDelete.id}`);
      setProductToDelete(null);
      showToast("Đã xoá sản phẩm");
      refetch();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          err.message ||
          "Không thể xoá sản phẩm",
      );
    } finally {
      setDeleting(false);
    }
  }

  const categoryMap = {};
  for (const item of categories) {
    categoryMap[item.id] = item.name;
  }

  return (
    <section className="main-container">
      <div className="page-header">
        <h1>Sản phẩm</h1>
        <button
          type="button"
          className="btn btn-danger add-button"
          data-testid="add-button"
          onClick={() => navigate("/products/new")}
        >
          Thêm sản phẩm
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm theo tên hoặc SKU..."
            aria-label="Tìm kiếm sản phẩm"
            data-testid="search-input"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>
        <div className="filter-select">
          <select
            className="form-select"
            aria-label="Lọc theo danh mục"
            data-testid="category-filter"
            value={urlCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-select">
          <select
            className="form-select"
            aria-label="Lọc theo trạng thái"
            data-testid="status-filter"
            value={urlStatus}
            onChange={handleStatusChange}
          >
            <option value="">Tất cả</option>
            <option value="active">Đang bán</option>
            <option value="inactive">Ngừng bán</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="state-box" data-testid="loading">
          Đang tải danh sách sản phẩm...
        </div>
      )}

      {!loading && error && (
        <div className="state-box state-error">
          <p className="mb-3" data-testid="error-message">
            {error}
          </p>
          <button
            type="button"
            className="btn btn-outline-danger"
            data-testid="retry-button"
            onClick={refetch}
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="state-box" data-testid="empty-state">
          Không có sản phẩm nào phù hợp.
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <ProductTable
            products={products}
            categoryMap={categoryMap}
            onEdit={(product) => navigate(`/products/${product.id}/edit`)}
            onDelete={handleRequestDelete}
          />

          <div className="pagination-bar" data-testid="pagination">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              data-testid="page-prev"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Trước
            </button>
            <span className="pagination-current" data-testid="page-current">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              data-testid="page-next"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Sau
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Xác nhận xoá sản phẩm"
        message={
          productToDelete
            ? `Bạn có chắc chắn muốn xoá sản phẩm "${productToDelete.name}"?`
            : ""
        }
        loading={deleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </section>
  );
}
