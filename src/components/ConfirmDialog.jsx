/** Hộp thoại xác nhận tuỳ biến thay thế window.confirm khi xoá sản phẩm. */
export default function ConfirmDialog({
  open,
  title = "Xác nhận xoá",
  message,
  loading = false,
  error = "",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="confirm-backdrop" role="dialog" aria-modal="true">
      <div className="confirm-card" data-testid="confirm-dialog">
        <h2 className="confirm-title">{title}</h2>
        <p className="confirm-message">{message}</p>
        {error && (
          <div className="alert alert-danger py-2 px-3 mb-3" role="alert">
            {error}
          </div>
        )}
        <div className="confirm-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            data-testid="confirm-no"
            onClick={onCancel}
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            type="button"
            className="btn btn-danger"
            data-testid="confirm-yes"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang xoá..." : "Xoá"}
          </button>
        </div>
      </div>
    </div>
  );
}

