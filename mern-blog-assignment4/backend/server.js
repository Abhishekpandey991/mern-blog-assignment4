const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017/blogdb";

app.use(cors());
app.use(express.json());

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    author: { type: String, default: "Anonymous", trim: true },
  },
  { timestamps: true },
);

const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);

app.get("/", (_req, res) => res.json({ message: "Blog API is running" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/blogs", async (_req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Could not fetch blog posts", error: error.message });
  }
});

app.get("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog post not found" });
    res.json(blog);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid blog post ID", error: error.message });
  }
});

app.post("/api/blogs", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }
    const blog = await Blog.create({ title, content, author });
    res.status(201).json(blog);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Could not create blog post", error: error.message });
  }
});

app.put("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!blog) return res.status(404).json({ message: "Blog post not found" });
    res.json(blog);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Could not update blog post", error: error.message });
  }
});

app.delete("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog post not found" });
    res.json({ message: "Blog post deleted" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Could not delete blog post", error: error.message });
  }
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Backend running on port ${PORT}`),
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
start();
