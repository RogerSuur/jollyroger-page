import express, { json } from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";

const app = express();

const PORT = process.env.PORT || 3000; // use the environment variable or port 3000 as default

const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(cors());
app.use(json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// app.use(express.static(  './index.html' ));
// const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(express.static(path.join(__dirname, "public")));

// Enable CORS
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Define a route for the proxy
app.get("/proxy", async (req, res) => {
  // Make the request to the remote API
  //res.sendFile(path.join(__dirname, 'public', 'index.html'));
  console.log("app.get /proxy route initiated");
  try {
    //gets values from the client
    const authHeader = req.headers.authorization;
    const encodedCredentials = authHeader.split(" ")[1];
    const decodedCredentials = Buffer.from(
      encodedCredentials,
      "base64"
    ).toString();
    const [username, password] = decodedCredentials.split(":");
    // Make the request to the remote API
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Basic " + encodedCredentials,
    };

    const response = await fetch("https://01.kood.tech/api/auth/signin", {
      method: "POST",
      headers,
      // Pass the query parameters as the request body
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the response data and send it back to the client
    const data = await response.json();
    const jwt_token = data;
    res.json({ token: jwt_token });
  } catch (error) {
    console.error(`Error occurred: ${error}`);
    res.status(401).json({ message: "Invalid credentials. Please try again." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
