// Import express
const express = require("express");
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello from Node.js + Express backend!");
});

// Example POST route
app.post("/data", (req, res) => {
  const body = req.body;
  res.json({
    message: "Data received successfully",
    data: body
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
