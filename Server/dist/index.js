"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./db/config"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const uuid_1 = require("uuid");
//initilize the express
const app = (0, express_1.default)();
//middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)());
//create API's
app.get("/", (req, resp) => {
  resp.send("Server is Running Now......");
});
//middleware for JWT
function verifyToken(req, res, next) {
  let token = req.headers["authorization"];
  // Check if the token exists
  if (token) {
    // Split the token from 'Bearer <token>' to just '<token>'
    token = token.split(" ")[1];
    // Verify the token
    jsonwebtoken_1.default.verify(token, "mantu000", (err, decoded) => {
      if (err) {
        return res.status(401).json({ result: "Invalid token" });
      }
      // Attach decoded data to the request if needed
      // req.user = decoded;
      next();
    });
  } else {
    res.status(403).json({ result: "Token is required" });
  }
}
app.post("/register", (req, resp) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password || !role) {
      return resp.status(400).json({ error: "Missing required fields" });
    }
    try {
      // Check if the username already exists
      config_1.default.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, result) =>
          __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
              console.error("Database error:", err);
              return resp
                .status(500)
                .json({ error: "Database error", details: err });
            }
            if (result.length > 0) {
              return resp
                .status(409)
                .json({ error: "Username already exists" });
            }
            // Proceed with registration if the username does not exist
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = { name, username, password: hashedPassword, role };
            config_1.default.query(
              "INSERT INTO users SET ?",
              user,
              (err, result) => {
                if (err) {
                  console.error("Database error:", err);
                  return resp
                    .status(500)
                    .json({ error: "Database error", details: err });
                }
                const respdata = { name, username };
                jsonwebtoken_1.default.sign(
                  { data: respdata },
                  "mantu000", // Ensure this is set correctly
                  { expiresIn: "2h" },
                  (err, token) => {
                    if (err) {
                      return resp
                        .status(500)
                        .json({ message: "Error signing token", err });
                    }
                    resp.json({ user: respdata, auth: token });
                  }
                );
              }
            );
          })
      );
    } catch (error) {
      console.error("Error processing request:", error);
      resp
        .status(500)
        .json({ error: "Error processing request", details: error });
    }
  })
);
// Login a user
app.post("/login", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }
    try {
      config_1.default.query(
        "SELECT * FROM users WHERE username = ? LIMIT 1",
        [username],
        (err, result) =>
          __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({ error: "Database error" });
            }
            if (result.length === 0) {
              return res.status(404).json({ error: "User not found" });
            }
            const user = result[0];
            // Compare provided password with hashed password in the database
            const validPassword = yield bcrypt_1.default.compare(
              password,
              user.password
            );
            if (!validPassword) {
              return res.status(400).json({ error: "Invalid password" });
            }
            jsonwebtoken_1.default.sign(
              { id: user.id, username: user.username },
              "mantu000", // Ensure this is set correctly
              { expiresIn: "2h" },
              (err, token) => {
                if (err) {
                  return res
                    .status(500)
                    .json({ error: "Error signing token", details: err });
                }
                res.json({
                  user: {
                    name: user.name,
                    username: user.username,
                    role: user.role,
                  },
                  auth: token,
                });
              }
            );
          })
      );
    } catch (error) {
      console.error("Internal server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);
app.post("/create-product", (req, resp) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { username, name, productCode, hsn, selesPrice, purchasePrice } =
      req.body;
    if (
      !username ||
      !name ||
      !productCode ||
      !hsn ||
      !selesPrice ||
      !purchasePrice
    ) {
      return resp.status(400).json({ error: "Missing required fields" });
    }
    try {
      // Check if the user exists and is an admin
      config_1.default.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, userResult) => {
          if (err) {
            console.error("Database error:", err);
            return resp
              .status(500)
              .json({ error: "Database error", details: err });
          }
          if (userResult.length === 0) {
            return resp.status(404).json({ error: "User not found" });
          }
          if (userResult[0].role !== "admin") {
            return resp.status(403).json({
              error: "Access denied. Only admins can create products",
            });
          }
          // Check if the product already exists
          config_1.default.query(
            "SELECT * FROM products WHERE productCode = ?",
            [productCode],
            (err, productResult) => {
              if (err) {
                console.error("Database error:", err);
                return resp
                  .status(500)
                  .json({ error: "Database error", details: err });
              }
              if (productResult.length > 0) {
                return resp
                  .status(409)
                  .json({ error: "Product already exists" });
              }
              // Proceed with product creation if the product does not exist
              const id = (0, uuid_1.v4)();
              const product = {
                id,
                name,
                productCode,
                hsn,
                selesPrice,
                purchasePrice,
              };
              config_1.default.query(
                "INSERT INTO products SET ?",
                product,
                (err, result) => {
                  if (err) {
                    console.error("Database error:", err);
                    return resp
                      .status(500)
                      .json({ error: "Database error", details: err });
                  }
                  resp
                    .status(201)
                    .json({ message: "Product created successfully", product });
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      resp
        .status(500)
        .json({ error: "Error processing request", details: error });
    }
  })
);
// Read all products
app.post("/allproduct", verifyToken, (req, resp) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (username.length == 0) {
      return resp.status(400).json({ error: "Missing required fields" });
    }
    try {
      //sql query for check the user request is present in db or not
      config_1.default.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return resp
              .status(500)
              .json({ error: "Database error", details: err });
          }
          if (result.length === 0) {
            return resp.status(409).json({ error: "User Not Exist.." });
          }
          //sql query for getting allproducts
          config_1.default.query("SELECT * FROM products", (err, result) => {
            if (err) {
              console.error("Database error:", err);
              return resp
                .status(500)
                .json({ error: "Database error", details: err });
            }
            resp.status(201).json({
              message: "All Products Is Getting Sucessfully..",
              result,
            });
          });
        }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      resp
        .status(500)
        .json({ error: "Error processing request", details: error });
    }
  })
);
// Read a product by ID
app.post("/product/:id", verifyToken, (req, resp) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!username || username.length === 0) {
      return resp.status(400).json({ error: "Missing required fields" });
    }
    try {
      // Check if the user exists
      config_1.default.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, userResult) => {
          if (err) {
            console.error("Database error:", err);
            return resp
              .status(500)
              .json({ error: "Database error", details: err });
          }
          if (userResult.length === 0) {
            return resp.status(404).json({ error: "User not found" });
          }
          // Get the product with the given id
          const productId = req.params.id;
          config_1.default.query(
            "SELECT * FROM products WHERE productCode = ?",
            [productId],
            (err, productResult) => {
              if (err) {
                console.error("Database error:", err);
                return resp
                  .status(500)
                  .json({ error: "Database error", details: err });
              }
              if (productResult.length === 0) {
                return resp.status(404).json({ error: "Product not found" });
              }
              resp.status(200).json({
                message: "Product retrieved successfully",
                product: productResult[0],
              });
            }
          );
        }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      resp
        .status(500)
        .json({ error: "Error processing request", details: error });
    }
  })
);
// Update a product by ID
app.put("/update/:id", verifyToken, (req, resp) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { username, name, productCode, hsn, selesPrice, purchasePrice } =
      req.body;
    if (
      !username ||
      !name ||
      !productCode ||
      !hsn ||
      !selesPrice ||
      !purchasePrice
    ) {
      return resp.status(400).json({ error: "Missing required fields" });
    }
    try {
      // Check if the user exists
      config_1.default.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, userResult) => {
          if (err) {
            console.error("Database error:", err);
            return resp
              .status(500)
              .json({ error: "Database error", details: err });
          }
          if (userResult.length === 0) {
            return resp.status(404).json({ error: "User not found" });
          }
          if (userResult[0].role === "admin") {
            // Check if the product with the given id exists
            const productId = req.params.id;
            config_1.default.query(
              "SELECT * FROM products WHERE productCode = ?",
              [productId],
              (err, productResult) => {
                if (err) {
                  console.error("Database error:", err);
                  return resp
                    .status(500)
                    .json({ error: "Database error", details: err });
                }
                if (productResult.length === 0) {
                  return resp.status(404).json({
                    error: "Product not found with given productCode",
                  });
                }
                const existingProduct = productResult[0];
                // Check if the new data is the same as the existing data
                if (
                  existingProduct.name === name &&
                  existingProduct.productCode === productCode &&
                  existingProduct.hsn === hsn &&
                  existingProduct.selesPrice === selesPrice &&
                  existingProduct.purchasePrice === purchasePrice
                ) {
                  return resp.status(200).json({
                    message: "No changes detected, product not updated",
                  });
                }
                // Update the product with the new data
                config_1.default.query(
                  "UPDATE products SET name = ?, productCode = ?, hsn = ?, selesPrice = ?, purchasePrice = ? WHERE productCode = ?",
                  [
                    name,
                    productCode,
                    hsn,
                    selesPrice,
                    purchasePrice,
                    productId,
                  ],
                  (err, result) => {
                    if (err) {
                      console.error("Database error:", err);
                      return resp
                        .status(500)
                        .json({ error: "Database error", details: err });
                    }
                    resp
                      .status(200)
                      .json({ message: "Product updated successfully" });
                  }
                );
              }
            );
          } else {
            resp.status(403).json({
              error:
                "You are not authorized to update product data. Only admins can.",
            });
          }
        }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      resp
        .status(500)
        .json({ error: "Error processing request", details: error });
    }
  })
);
// Delete a product by ID
app.delete("/delete/:id", verifyToken, (req, resp) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    if (!username) {
      return resp.status(400).json({ error: "Missing required fields" });
    }
    try {
      // Check if the user exists
      config_1.default.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, userResult) => {
          if (err) {
            console.error("Database error:", err);
            return resp
              .status(500)
              .json({ error: "Database error", details: err });
          }
          if (userResult.length === 0) {
            return resp.status(404).json({ error: "User not found" });
          }
          if (userResult[0].role !== "admin") {
            return resp.status(403).json({
              error:
                "You are not authorized to delete products. Only admins can.",
            });
          }
          // Check if the product with the given id exists
          const productId = req.params.id;
          config_1.default.query(
            "SELECT * FROM products WHERE productCode = ?",
            [productId],
            (err, productResult) => {
              if (err) {
                console.error("Database error:", err);
                return resp
                  .status(500)
                  .json({ error: "Database error", details: err });
              }
              if (productResult.length === 0) {
                return resp
                  .status(404)
                  .json({ error: "Product not found with given productCode" });
              }
              // Delete the product with the productCode
              config_1.default.query(
                "DELETE FROM products WHERE productCode = ?",
                [productId],
                (err, result) => {
                  if (err) {
                    return resp
                      .status(500)
                      .json({ error: "Database error", details: err });
                  }
                  if (result.affectedRows == 0) {
                    return resp.status(404).json({
                      error: "Product not found with the given productCode",
                    });
                  }
                  resp.json({
                    message: "Product deleted successfully",
                    result,
                  });
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error("Error processing request:", error);
      resp
        .status(500)
        .json({ error: "Error processing request", details: error });
    }
  })
);
app.listen(2000, () => {
  console.log("Server is now running on PORT http://localhost:2000");
});
//# sourceMappingURL=index.js.map
