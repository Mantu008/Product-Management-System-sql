import { error } from "console";
import conn from "./db/config";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from "uuid";

//initilize the express
const app: Express = express();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.json());
app.use(cors());

//create API's

app.get("/", (req, resp) => {
  resp.send("Server is Running Now......");
});

//middleware for JWT

function verifyToken(req: Request, res: Response, next: NextFunction): void {
  let token = req.headers["authorization"];

  // Check if the token exists
  if (token) {
    // Split the token from 'Bearer <token>' to just '<token>'
    token = token.split(" ")[1];

    // Verify the token
    jwt.verify(token, "mantu000" as string, (err, decoded) => {
      if (err) {
        return res.status(401).json({ result: "Invalid token" });
      }

      // Attach decoded data to the request if needed
      // req.user = decoded;

      console.log("token Verifed");

      next();
    });
  } else {
    res.status(403).json({ result: "Token is required" });
  }
}

// Register a new user

export interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  role: string;
}

app.post("/register", async (req: Request, resp: Response) => {
  const { name, username, password, role }: User = req.body;

  if (!name || !username || !password || !role) {
    return resp.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if the username already exists
    conn.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return resp
            .status(500)
            .json({ error: "Database error", details: err });
        }

        if (result.length > 0) {
          return resp.status(409).json({ error: "Username already exists" });
        }

        // Proceed with registration if the username does not exist
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = { name, username, password: hashedPassword, role };

        conn.query("INSERT INTO users SET ?", user, (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return resp
              .status(500)
              .json({ error: "Database error", details: err });
          }

          const respdata = { name, username };

          jwt.sign(
            { data: respdata },
            "mantu000" as string, // Ensure this is set correctly
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
        });
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    resp
      .status(500)
      .json({ error: "Error processing request", details: error });
  }
});

// Login a user

app.post("/login", async (req: Request, res: Response) => {
  const { username, password }: { username: string; password: string } =
    req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    conn.query(
      "SELECT * FROM users WHERE username = ? LIMIT 1",
      [username],
      async (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (result.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const user = result[0] as any;

        // Compare provided password with hashed password in the database
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
          return res.status(400).json({ error: "Invalid password" });
        }

        jwt.sign(
          { id: user.id, username: user.username },
          "mantu000" as string, // Ensure this is set correctly
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
      }
    );
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a product

interface ProductRequest {
  name: string;
  productCode: string;
  hsn: string;
  selesPrice: number;
  purchasePrice: number;
}

app.post("/create-product", async (req: Request, resp: Response) => {
  const {
    username,
    name,
    productCode,
    hsn,
    selesPrice,
    purchasePrice,
  }: {
    username: string;
    name: string;
    productCode: string;
    hsn: string;
    selesPrice: string;
    purchasePrice: string;
  } = req.body;

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
    conn.query(
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
          return resp
            .status(403)
            .json({ error: "Access denied. Only admins can create products" });
        }

        // Check if the product already exists
        conn.query(
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
              return resp.status(409).json({ error: "Product already exists" });
            }

            // Proceed with product creation if the product does not exist
            const id = uuidv4();
            const product = {
              id,
              name,
              productCode,
              hsn,
              selesPrice,
              purchasePrice,
            };

            conn.query("INSERT INTO products SET ?", product, (err, result) => {
              if (err) {
                console.error("Database error:", err);
                return resp
                  .status(500)
                  .json({ error: "Database error", details: err });
              }

              resp
                .status(201)
                .json({ message: "Product created successfully", product });
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
});

// Read all products
app.post("/allproduct", verifyToken, async (req: Request, resp: Response) => {
  const { username }: { username: string } = req.body;

  if (username.length == 0) {
    return resp.status(400).json({ error: "Missing required fields" });
  }

  try {
    //sql query for check the user request is present in db or not

    conn.query(
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

        conn.query("SELECT * FROM products", (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return resp
              .status(500)
              .json({ error: "Database error", details: err });
          }

          resp
            .status(201)
            .json({ message: "All Products Is Getting Sucessfully..", result });
        });
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    resp
      .status(500)
      .json({ error: "Error processing request", details: error });
  }
});

// Read a product by ID
app.post("/product/:id", verifyToken, async (req: Request, resp: Response) => {
  const { username }: { username: string } = req.body;

  if (!username || username.length === 0) {
    return resp.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if the user exists
    conn.query(
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
        conn.query(
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
});

// Update a product by ID
app.put("/update/:id", verifyToken, async (req: Request, resp: Response) => {
  const {
    username,
    name,
    productCode,
    hsn,
    selesPrice,
    purchasePrice,
  }: {
    username: string;
    name: string;
    productCode: string;
    hsn: string;
    selesPrice: string;
    purchasePrice: string;
  } = req.body;

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
    conn.query(
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
          conn.query(
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
              conn.query(
                "UPDATE products SET name = ?, productCode = ?, hsn = ?, selesPrice = ?, purchasePrice = ? WHERE productCode = ?",
                [name, productCode, hsn, selesPrice, purchasePrice, productId],
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
});

// Delete a product by ID
app.delete("/delete/:id", verifyToken, async (req: Request, resp: Response) => {
  const { username }: { username: string } = req.body;

  if (!username) {
    return resp.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if the user exists
    conn.query(
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
        conn.query(
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
            conn.query(
              "DELETE FROM products WHERE productCode = ?",
              [productId],
              (err, result) => {
                if (err) {
                  return resp
                    .status(500)
                    .json({ error: "Database error", details: err });
                }

                if ((result as any).affectedRows == 0) {
                  return resp.status(404).json({
                    error: "Product not found with the given productCode",
                  });
                }
                resp.json({ message: "Product deleted successfully", result });
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
});

app.listen(2000, () => {
  console.log("Server is now running on PORT http://localhost:2000");
});
