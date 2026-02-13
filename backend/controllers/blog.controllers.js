import client from "../prisma.js";

import cloudinary from "../utils/cloudinary.js";

export const addBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      authorName,
      metaTitle,
      metaDescription,
    } = req.body;

    // Validation
    if (!title || !content || !authorName) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and author name are required",
      });
    }

    // Handle cover image upload
    const coverImageFile = req.files?.find(f => f.fieldname === 'coverImage');
    let coverImage = null;

    if (coverImageFile) {
      const result = await cloudinary.uploader.upload(
        `data:${coverImageFile.mimetype};base64,${coverImageFile.buffer.toString('base64')}`,
        { folder: "blog_images", resource_type: "auto" }
      );
      coverImage = result.secure_url;
    }

    const newBlog = await client.blogpost.create({
      data: {
        title,
        coverImage,
        content,
        excerpt,
        authorName,
        metaTitle: metaTitle || title, // Default to title if not provided
        metaDescription: metaDescription || excerpt,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: newBlog,
    });
  } catch (e) {
    console.error("Error in addBlog:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to create blog post",
      error: e.message,
    });
  }
};

export const editBlog = async (req, res) => {
  try {
    const { id } = req.body;
    const {
      title,
      content,
      excerpt,
      authorName,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required",
      });
    }

    // Check if blog exists
    const existingBlog = await client.blogpost.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Handle image upload if provided
    let coverImage = existingBlog.coverImage;
    const coverImageFile = req.files?.find(f => f.fieldname === 'coverImage');

    if (coverImageFile) {
      // Delete old image from cloudinary if exists
      if (existingBlog.coverImage) {
        try {
          const publicId = existingBlog.coverImage.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`blog_images/${publicId}`);
        } catch (error) {
          console.log("Error deleting old image:", error);
        }
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(
        `data:${coverImageFile.mimetype};base64,${coverImageFile.buffer.toString('base64')}`,
        { folder: "blog_images", resource_type: "auto" }
      );
      coverImage = result.secure_url;
    }

    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (authorName) updateData.authorName = authorName;
    if (metaTitle) updateData.metaTitle = metaTitle;
    if (metaDescription) updateData.metaDescription = metaDescription;
    if (coverImage) updateData.coverImage = coverImage;

    // Update the blog
    const updatedBlog = await client.blogpost.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: updatedBlog,
    });
  } catch (e) {
    console.error("Error in updateBlog:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to update blog post",
      error: e.message,
    });
  }
};







export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required",
      });
    }

    // Check if blog exists
    const existingBlog = await client.blogpost.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    await client.blogpost.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (e) {
    console.error("Error in deleteBlog:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog post",
      error: e.message,
    });
  }
};

/**
 * Get all blog posts with pagination and filtering
 */
export const getAllBlog = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      published, // Filter: "true" for published only, "false" for drafts only
      author,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const where = {};

    // Filter by published status
    if (published === "true") {
      where.publishedAt = { not: null };
    } else if (published === "false") {
      where.publishedAt = null;
    }

    // Filter by author name
    if (author) {
      where.authorName = {
        contains: author,
        mode: "insensitive",
      };
    }

    // Get total count
    const total = await client.blogpost.count({ where });

    // Get paginated results
    const blogs = await client.blogpost.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: {
        [sortBy]: sortOrder.toLowerCase(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Blog posts fetched successfully",
      data: blogs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (e) {
    console.error("Error in getAllBlog:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog posts",
      error: e.message,
    });
  }
};

/**
 * Get blog post details by ID
 */
export const getBlogDetailsByBlogId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required",
      });
    }

    const blog = await client.blogpost.findUnique({
      where: { id },
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog post fetched successfully",
      data: blog,
    });
  } catch (e) {
    console.error("Error in getBlogDetailsByBlogId:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog post details",
      error: e.message,
    });
  }
};

/**
 * Search blog posts by title
 */
export const searchBlogByTitle = async (req, res) => {
  try {
    const { search, publishedOnly = "false" } = req.query;

    if (!search || search.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const where = {
      title: {
        contains: search.trim(),
        mode: "insensitive",
      },
    };

    // Only show published posts if requested
    if (publishedOnly === "true") {
      where.publishedAt = { not: null };
    }

    const blogs = await client.blogpost.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: `Found ${blogs.length} matching blog post(s)`,
      data: blogs,
      count: blogs.length,
    });
  } catch (e) {
    console.error("Error in searchBlogByTitle:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to search blog posts",
      error: e.message,
    });
  }
};

