import client from "../prisma.js";
import cloudinary from "../utils/cloudinary.js";

// ─── existing functions kept as-is ──────────────────────────────────────────

export const createCategoryOrCreateSubCategory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await client.user.findFirst({ where: { id: userId } });

    if (!user) return res.status(400).json({ success: false, message: "No user exists with this id" });
    if (user.role === "USER") return res.status(400).json({ success: false, message: "You have no right to add category" });

    const { name, parentId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const existing = await client.category.findFirst({ where: { name } });
    if (existing) return res.status(200).json({ success: false, message: 'This category name already exists' });

    if (!parentId) {
      const category = await client.category.create({ data: { name } });
      return res.status(200).json({ success: true, message: 'New category created', category });
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      { folder: 'project_files', resource_type: 'auto' }
    );
    const file = result.secure_url;
    if (!file) return res.status(400).json({ success: false, message: "No file found" });

    const subcategory = await client.category.create({
      data: { name, parentId, imageUrl: file }
    });

    return res.status(200).json({ success: true, message: 'New subcategory created successfully', subcategory });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: 'Error while creating category, please try again later!' });
  }
};

export const getallCategory = async (req, res) => {
  try {
    const category = await client.category.findMany({
      where: { parentId: null },
      include: { children: true }
    });
    return res.status(200).json({ success: true, message: 'All categories found', category });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: 'Error while getting all categories, please try again later!' });
  }
};

export const getallSubCategoryOfTheCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await client.category.findMany({
      where: { parentId: categoryId },
      include: { parent: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (subcategories.length === 0) {
      return res.status(200).json({ success: true, message: 'No subcategory found currently, add new subcategory' });
    }

    return res.status(200).json({
      success: true, message: 'All subcategories found',
      parentCategory: subcategories[0].parent,
      subcategories,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: 'Error while fetching subcategories, please try again later!' });
  }
};

export const getallSubCategory = async (req, res) => {
  try {
    const subcategories = await client.category.findMany({
      where: { parentId: { not: null } }
    });
    return res.status(200).json({ success: true, message: 'All subcategories found', subcategories });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: 'Error while fetching subcategories, please try again later!' });
  }
};

// ─── NEW: Get single category/subcategory by ID ──────────────────────────────
export const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await client.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: { select: { id: true, name: true } },
        children: true,
      }
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.status(200).json({ success: true, message: 'Category found', category });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: 'Error while fetching category' });
  }
};

// ─── NEW: Update category or subcategory ────────────────────────────────────
// PATCH /category/update/:userId/:categoryId
// Body: { name? }
// File (optional): image (for subcategory image update)
export const updateCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;

    // Auth check
    const user = await client.user.findFirst({ where: { id: userId } });
    if (!user) return res.status(400).json({ success: false, message: 'No user exists with this id' });
    if (user.role === 'USER') return res.status(403).json({ success: false, message: 'You have no right to update category' });

    // Check category exists
    const existing = await client.category.findUnique({ where: { id: categoryId } });
    if (!existing) return res.status(404).json({ success: false, message: 'Category not found' });

    const { name } = req.body;
    const updateData = {};

    // Update name if provided and not taken by another category
    if (name && name !== existing.name) {
      const nameTaken = await client.category.findFirst({
        where: { name, id: { not: categoryId } }
      });
      if (nameTaken) {
        return res.status(400).json({ success: false, message: 'This category name already exists' });
      }
      updateData.name = name;
    }

    // Update image if a new file was uploaded (only for subcategories)
    if (req.file) {
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
        { folder: 'project_files', resource_type: 'auto' }
      );
      updateData.imageUrl = result.secure_url;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No changes provided' });
    }

    const updated = await client.category.update({
      where: { id: categoryId },
      data: updateData,
      include: { parent: { select: { id: true, name: true } }, children: true }
    });

    return res.status(200).json({
      success: true,
      message: `${existing.parentId ? 'Subcategory' : 'Category'} updated successfully`,
      category: updated,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: 'Error while updating category, please try again later!' });
  }
};

// ─── NEW: Delete category or subcategory ────────────────────────────────────
// DELETE /category/delete/:userId/:categoryId
export const deleteCategory = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;

    // Auth check
    const user = await client.user.findFirst({ where: { id: userId } });
    if (!user) return res.status(400).json({ success: false, message: 'No user exists with this id' });
    if (user.role === 'USER') return res.status(403).json({ success: false, message: 'You have no right to delete category' });

    // Check category exists
    const existing = await client.category.findUnique({
      where: { id: categoryId },
      include: { children: true }
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Category not found' });

    // Prevent deletion of parent category if it has subcategories
    if (!existing.parentId && existing.children.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this category — it has ${existing.children.length} subcategor${existing.children.length === 1 ? 'y' : 'ies'}. Delete subcategories first.`
      });
    }

    await client.category.delete({ where: { id: categoryId } });

    return res.status(200).json({
      success: true,
      message: `${existing.parentId ? 'Subcategory' : 'Category'} deleted successfully`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ success: false, message: 'Error while deleting category, please try again later!' });
  }
};