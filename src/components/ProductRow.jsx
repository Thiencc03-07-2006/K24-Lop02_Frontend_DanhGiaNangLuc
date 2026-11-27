import { categoryNames } from "../data/sample.js";

/** Hiển thị một dòng (hoặc thẻ trên mobile) cho từng sản phẩm. */
export default function ProductRow({ product, categoryMap, onEdit, onDelete }) {
  const categoryName =
    categoryMap?.[product.category] ||
    categoryNames[product.category] ||
    product.category;
  const isActive = product.status === "active";
  const statusLabel = isActive ? "Đang bán" : "Ngừng bán";
  const isOutOfStock = Number(product.stock) === 0;

  return (
    <tr className="product-row" data-testid="product-row">
      <td data-label="Tên" className="cell-name">
        {product.name}
      </td>
      <td data-label="SKU">{product.sku}</td>
      <td data-label="Danh mục">{categoryName}</td>
      <td data-label="Giá">
        {Number(product.price).toLocaleString("vi-VN")} ₫
      </td>
      <td data-label="Tồn kho">
        {isOutOfStock ? (
          <span className="stock-out">Hết hàng</span>
        ) : (
          product.stock
        )}
      </td>
      <td data-label="Trạng thái">
        <span
          data-testid="product-status"
          className={`status-badge ${isActive ? "status-active" : "status-inactive"}`}
        >
          {statusLabel}
        </span>
      </td>
      <td data-label="Thao tác">
        <div className="d-inline-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            type="button"
            data-testid="edit-button"
            onClick={() => onEdit && onEdit(product)}
          >
            Sửa
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            type="button"
            data-testid="delete-button"
            onClick={() => onDelete && onDelete(product)}
          >
            Xoá
          </button>
        </div>
      </td>
    </tr>
  );
}
