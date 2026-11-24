
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL: API });

export default function App() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  const {
    data: posts = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const response = await api.get("/blogs");

      if (!Array.isArray(response.data)) {
        throw new Error("Backend did not return a blog posts array");
      }

      return response.data;
    }
  });

  const createPost = useMutation({
    mutationFn: async (post) => {
      return (await api.post("/blogs", post)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setTitle("");
      setContent("");
      setAuthor("");
    }
  });

  const deletePost = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/blogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    }
  });

  function handleSubmit(event) {
    event.preventDefault();

    if (title.trim() && content.trim()) {
      createPost.mutate({
        title: title.trim(),
        content: content.trim(),
        author: author.trim() || "Anonymous"
      });
    }
  }

  return (
    <main className="page">
      <nav className="nav">
        <a className="brand" href="/">
          ink<span>well.</span>
        </a>
        <span className="nav-note">A little space for big ideas</span>
      </nav>

      <section className="hero">
        <p className="eyebrow">THE COMMUNITY JOURNAL</p>
        <h1>Ideas worth<br /><em>sharing.</em></h1>
        <p className="intro">
          Thoughts, stories, and perspectives from curious minds.
        </p>
      </section>

      <section className="content-grid">
        <div className="posts-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LATEST STORIES</p>
              <h2>From the blog</h2>
            </div>
            <span className="post-count">{posts.length} posts</span>
          </div>

          {isLoading && (
            <p className="notice">Loading stories...</p>
          )}

          {isError && (
            <p className="notice error">
              Could not load posts: {error.message}
              <br />
              Check that the backend and MongoDB are running.
            </p>
          )}

          {!isLoading && !isError && posts.length === 0 && (
            <div className="empty">
              <span>✳</span>
              <h3>It starts with a story.</h3>
              <p>Be the first to publish a post using the form.</p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="post-list">
              {posts.map((post) => (
                <article className="post-card" key={post._id}>
                  <div className="post-meta">
                    <span>ARTICLE</span>
                    <span>
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>

                  <h3>{post.title}</h3>
                  <p className="post-content">{post.content}</p>

                  <div className="post-footer">
                    <span>By {post.author || "Anonymous"}</span>
                    <button
                      className="delete"
                      onClick={() => deletePost.mutate(post._id)}
                      disabled={deletePost.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="form-card">
          <p className="eyebrow">YOUR TURN</p>
          <h2>Write a story</h2>
          <p className="form-intro">
            Have something on your mind? Put it into words.
          </p>

          <form onSubmit={handleSubmit}>
            <label>
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your story a title"
                required
              />
            </label>

            <label>
              Your name
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Alex"
              />
            </label>

            <label>
              Story
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing here..."
                rows="7"
                required
              />
            </label>

            <button
              className="publish"
              disabled={createPost.isPending}
            >
              {createPost.isPending ? "Publishing..." : "Publish story ↗"}
            </button>

            {createPost.isError && (
              <p className="error">
                Could not publish: {createPost.error.message}
              </p>
            )}

            {createPost.isSuccess && (
              <p className="success">
                Your story has been published.
              </p>
            )}
          </form>
        </aside>
      </section>

      <footer>
        INKWELL JOURNAL
        <span>Made for sharing ideas.</span>
      </footer>
    </main>
  );
}
