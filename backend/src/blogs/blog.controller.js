const Blog = require('./blog.model');

const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        console.error("Error fetching blogs", error);
        res.status(500).json({ message: "Failed to fetch blogs" });
    }
};

const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json(blog);
    } catch (error) {
        console.error("Error fetching blog", error);
        res.status(500).json({ message: "Failed to fetch blog" });
    }
};

const createBlog = async (req, res) => {
    try {
        const { title, description, category, author, coverImage } = req.body;
        const newBlog = new Blog({ title, description, category, author, coverImage });
        const savedBlog = await newBlog.save();
        res.status(201).json({ message: "Blog created successfully", blog: savedBlog });
    } catch (error) {
        console.error("Error creating blog", error);
        res.status(500).json({ message: "Failed to create blog" });
    }
};

const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Blog.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog", error);
        res.status(500).json({ message: "Failed to delete blog" });
    }
};

module.exports = { getAllBlogs, getBlogById, createBlog, deleteBlog };
