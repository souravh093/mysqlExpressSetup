import express from "express";
import cors from "cors";
import mysql from "mysql2";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// __dirname is not defined in ES module scope, so we need to create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;

// Setup the database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "souravMa1998",
  database: "learnDB",
  multipleStatements: true, // Enable execution of multiple statements
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting: " + err.stack);
    return;
  }

  console.log("Connected as thread id: " + connection.threadId);

  // Read and execute the SQL file to setup the database schema
  const schemaPath = join(__dirname, "schema.sql");
  fs.readFile(schemaPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading schema file: " + err.message);
      return;
    }

    connection.query(data, (error, results) => {
      if (error) {
        console.error("Error executing schema: " + error.message);
        return;
      }

      console.log("Database schema has been set up!");
    });
  });
});

// Define the root route
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

app.post("/products", async (req, res) => {
  const { name, description, price } = req.body;

  const sql = "INSERT INTO products (name, description, price) VALUES(?, ?, ?)";
  connection.query(sql, [name, description, price], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error inserting the product");
    } else {
      res
        .status(201)
        .send({ id: results.insertId, message: "Product created" });
    }
  });
});

app.get("/products/:id", (req, res) => {
  const sql = "SELECT * FROM products WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error reading product");
    } else {
      res.send(result);
    }
  });
});

app.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";
  connection.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error reading products");
    } else {
      res.send(result);
    }
  });
});

app.put("/products/:id", (req, res) => {
  const { name } = req.body;
  const sql = "UPDATE products SET name = ? WHERE id = ?";
  connection.query(sql, [name, req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error updated product");
    } else {
      res.send(result);
    }
  });
});

app.delete("/products/:id", (req, res) => {
  const sql = "DELETE FROM products WHERE id = ?";
  connection.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error deleted product");
    } else {
      res.send(result);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
