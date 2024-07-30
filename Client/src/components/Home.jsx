import { useEffect, useState } from "react";

const Home = () => {
  const [products, setProducts] = useState([]);

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

      // Check if data has the expected structure
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
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 md:ml-[680px] ml-[300px] mt-5">
        All Products
      </h1>
      <div className="flex flex-wrap gap-6 justify-center">
        {products.length > 0 ? (
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

export default Home;
