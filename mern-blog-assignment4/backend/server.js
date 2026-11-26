const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// Blog Schema
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      default: "Anonymous",
      trim: true,
    },
  },
  { timestamps: true },
);

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

// Home Route
app.get("/", (_req, res) => {
  res.json({ message: "Blog API is running" });
});

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Get All Blogs
app.get("/api/blogs", async (_req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({
      message: "Could not fetch blog posts",
      error: error.message,
    });
  }
});

// Get Single Blog
app.get("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog post not found",
      });
    }

    res.json(blog);
  } catch (error) {
    res.status(400).json({
      message: "Invalid blog post ID",
      error: error.message,
    });
  }
});

// Create Blog
app.post("/api/blogs", async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    const blog = await Blog.create({
      title: title.trim(),
      content: content.trim(),
      author:
        typeof author === "string" && author.trim()
          ? author.trim()
          : "Anonymous",
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({
      message: "Could not create blog post",
      error: error.message,
    });
  }
});

// Update Blog
app.put("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({
        message: "Blog post not found",
      });
    }

    res.json(blog);
  } catch (error) {
    res.status(400).json({
      message: "Could not update blog post",
      error: error.message,
    });
  }
});

// Delete Blog
app.delete("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog post not found",
      });
    }

    res.json({
      message: "Blog post deleted",
    });
  } catch (error) {
    res.status(400).json({
      message: "Could not delete blog post",
      error: error.message,
    });
  }
});

// Start Server
async function start() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI environment variable is missing");
    }
    console.log("MONGO_URI exists:", Boolean(MONGO_URI));
    console.log(
      "MONGO_URI starts with mongodb:",
      MONGO_URI?.trim().startsWith("mongodb://") ||
        MONGO_URI?.trim().startsWith("mongodb+srv://"),
    );

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Atlas connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

start();
