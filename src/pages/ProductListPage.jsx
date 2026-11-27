import ProductTable from "../components/ProductTable.jsx";
import sampleProducts from "../data/sample.js";

export default function ProductListPage() {
  return (
    <section className="main-container">
      <div className="page-header">
        <h1>Sản phẩm</h1>
        <button
          type="button"
          className="btn btn-danger add-button"
          data-testid="add-button"
        >
          Thêm sản phẩm
        </button>
      </div>
      <ProductTable products={sampleProducts} />
    </section>
  );
}

