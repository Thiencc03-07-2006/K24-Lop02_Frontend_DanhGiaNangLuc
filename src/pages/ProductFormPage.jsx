import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";

const SKU_REGEX = /^[A-Z]{3}-\d{4}$/;

const INITIAL_FORM = {
  name: "",
  sku: "",
  category: "",
  price: "",
  stock: "",
  status: "active",
};

/** Form dùng chung cho Thêm sản phẩm (/products/new) và Sửa sản phẩm (/products/:id/edit). */
export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Tải danh sách danh mục từ API.
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

  // Nếu đang ở chế độ sửa, tải dữ liệu sản phẩm theo id.
  useEffect(() => {
    if (!isEdit) {
      setLoadingProduct(false);
      setLoadError("");
      setForm(INITIAL_FORM);
      return undefined;
    }

    const controller = new AbortController();
    let isCurrent = true;

    async function loadProduct() {
      setLoadingProduct(true);
      setLoadError("");
      try {
        const res = await api.get(`/products/${id}`, {
          signal: controller.signal,
        });
        if (!isCurrent) return;
        const p = res.data;
        setForm({
          name: p.name ?? "",
          sku: p.sku ?? "",
          category: p.category ?? "",
          price: p.price !== undefined && p.price !== null ? String(p.price) : "",
          stock: p.stock !== undefined && p.stock !== null ? String(p.stock) : "",
          status: p.status === "inactive" ? "inactive" : "active",
        });
      } catch (err) {
        if (
          controller.signal.aborted ||
          err.code === "ERR_CANCELED" ||
          err.name === "CanceledError"
        ) {
          return;
        }
        if (!isCurrent) return;
        setLoadError(
          err.response?.data?.message || "Không tìm thấy sản phẩm",
        );
      } finally {
        if (isCurrent && !controller.signal.aborted) {
          setLoadingProduct(false);
        }
      }
    }

    loadProduct();

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [id, isEdit]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (formError) {
      setFormError("");
    }
  }

  function validateForm() {
    const errors = {};
    const trimmedName = form.name.trim();

    if (trimmedName.length < 3 || trimmedName.length > 100) {
      errors.name = "Tên sản phẩm phải từ 3 đến 100 ký tự";
    }

    if (!SKU_REGEX.test(form.sku)) {
      errors.sku = "SKU phải đúng định dạng ABC-1234";
    }

    if (!form.category) {
      errors.category = "Vui lòng chọn danh mục";
    }

    const priceValue = Number(form.price);
    if (
      form.price === "" ||
      !Number.isFinite(priceValue) ||
      priceValue <= 0
    ) {
      errors.price = "Giá phải là số lớn hơn 0";
    }

    const stockValue = Number(form.stock);
    if (
      form.stock === "" ||
      !Number.isInteger(stockValue) ||
      stockValue < 0
    ) {
      errors.stock = "Tồn kho phải là số nguyên không âm";
    }

    if (!["active", "inactive"].includes(form.status)) {
      errors.status = "Trạng thái phải là active hoặc inactive";
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormError("");
    setFieldErrors({});

    const payload = {
      name: form.name.trim(),
      sku: form.sku,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      status: form.status,
    };

    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        showToast("Đã cập nhật sản phẩm");
      } else {
        await api.post("/products", payload);
        showToast("Đã thêm sản phẩm");
      }
      navigate("/products");
    } catch (err) {
      const serverData = err.response?.data;
      if (err.response?.status === 409) {
        setFieldErrors({
          sku: serverData?.message || "SKU đã tồn tại",
        });
      } else if (serverData?.field) {
        setFieldErrors({
          [serverData.field]: serverData.message || "Dữ liệu không hợp lệ",
        });
      } else {
        setFormError(
          serverData?.message || err.message || "Không thể lưu sản phẩm",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="main-container">
      <div className="page-header">
        <h1>{isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h1>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/products")}
          disabled={submitting}
        >
          Quay lại
        </button>
      </div>

      {loadingProduct && (
        <div className="state-box" data-testid="loading">
          Đang tải thông tin sản phẩm...
        </div>
      )}

      {!loadingProduct && loadError && (
        <div className="state-box state-error">
          <p className="mb-3" data-testid="error-message">
            {loadError}
          </p>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/products")}
          >
            Quay lại danh sách
          </button>
        </div>
      )}

      {!loadingProduct && !loadError && (
        <div className="form-card">
          <form data-testid="product-form" onSubmit={handleSubmit} noValidate>
            {formError && (
              <div
                className="alert alert-danger"
                data-testid="error-message"
                role="alert"
              >
                {formError}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="product-name" className="form-label">
                Tên sản phẩm
              </label>
              <input
                id="product-name"
                name="name"
                type="text"
                className={`form-control ${fieldErrors.name ? "is-invalid" : ""}`}
                value={form.name}
                onChange={handleChange}
                placeholder="Ví dụ: Bàn phím cơ K87"
              />
              {fieldErrors.name && (
                <div
                  className="invalid-feedback d-block"
                  data-testid="field-error-name"
                >
                  {fieldErrors.name}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="product-sku" className="form-label">
                SKU
              </label>
              <input
                id="product-sku"
                name="sku"
                type="text"
                className={`form-control ${fieldErrors.sku ? "is-invalid" : ""}`}
                value={form.sku}
                onChange={handleChange}
                placeholder="Ví dụ: KEY-0001"
              />
              {fieldErrors.sku && (
                <div
                  className="invalid-feedback d-block"
                  data-testid="field-error-sku"
                >
                  {fieldErrors.sku}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="product-category" className="form-label">
                Danh mục
              </label>
              <select
                id="product-category"
                name="category"
                className={`form-select ${fieldErrors.category ? "is-invalid" : ""}`}
                value={form.category}
                onChange={handleChange}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <div
                  className="invalid-feedback d-block"
                  data-testid="field-error-category"
                >
                  {fieldErrors.category}
                </div>
              )}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label htmlFor="product-price" className="form-label">
                  Giá (VNĐ)
                </label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="1"
                  className={`form-control ${fieldErrors.price ? "is-invalid" : ""}`}
                  value={form.price}
                  onChange={handleChange}
                />
                {fieldErrors.price && (
                  <div
                    className="invalid-feedback d-block"
                    data-testid="field-error-price"
                  >
                    {fieldErrors.price}
                  </div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="product-stock" className="form-label">
                  Tồn kho
                </label>
                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  className={`form-control ${fieldErrors.stock ? "is-invalid" : ""}`}
                  value={form.stock}
                  onChange={handleChange}
                />
                {fieldErrors.stock && (
                  <div
                    className="invalid-feedback d-block"
                    data-testid="field-error-stock"
                  >
                    {fieldErrors.stock}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="product-status" className="form-label">
                Trạng thái
              </label>
              <select
                id="product-status"
                name="status"
                className={`form-select ${fieldErrors.status ? "is-invalid" : ""}`}
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Đang bán</option>
                <option value="inactive">Ngừng bán</option>
              </select>
              {fieldErrors.status && (
                <div
                  className="invalid-feedback d-block"
                  data-testid="field-error-status"
                >
                  {fieldErrors.status}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/products")}
                disabled={submitting}
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="btn btn-danger add-button"
                data-testid="submit-button"
                disabled={submitting}
              >
                {submitting ? "Đang lưu..." : "Lưu sản phẩm"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

