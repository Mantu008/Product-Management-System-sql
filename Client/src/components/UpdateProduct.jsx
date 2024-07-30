import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UpdateProduct = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const getProducts = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch("http://localhost:2000/allproduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: JSON.parse(localStorage.getItem("user")).data.user.username,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.result)) {
        setProducts(data.result);
      } else {
        console.error(
          "Expected an object with a 'result' array but got:",
          data
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);

      // Add this line to log the response text for better debugging
      if (error.response) {
        const responseText = await error.response.text();
        console.error("Response text:", responseText);
      }
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleUpdate = (id) => {
    navigate(`/updateProduct/${id}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 md:ml-[680px] ml-[300px] mt-5">
        Update Products
      </h1>
      <div className="flex flex-wrap gap-6 justify-center">
        {Array.isArray(products) ? (
          products.map((product) => (
            <div
              className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-3"
              key={product.id}
            >
              <div
                className="rounded overflow-hidden shadow-lg bg-slate-400"
                key={product.id}
              >
                <div className="px-6 py-4">
                  <div className="font-bold text-xl mb-2">{product.name}</div>
                  <p className="text-gray-700 text-base">
                    <strong>Product Code:</strong> {product.productCode}
                  </p>
                  <p className="text-gray-700 text-base">
                    <strong>HSN:</strong> {product.hsn}
                  </p>
                  <p className="text-gray-700 text-base">
                    <strong>Sales Price:</strong> ${product.selesPrice}
                  </p>
                  <p className="text-gray-700 text-base">
                    <strong>Purchase Price:</strong> ${product.purchasePrice}
                  </p>
                  <button
                    className="bg-blue-700 p-1.5 rounded-md w-full mt-2 text-md font-semibold"
                    onClick={() => handleUpdate(product.productCode)}
                  >
                    Update Product
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
};

export default UpdateProduct;
