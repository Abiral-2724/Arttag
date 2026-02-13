import client from "../prisma.js";


export const addRequest = async (req, res) => {
  try {
    const { name, companyName, contact, companyEmail, askAnything, quantity } = req.body;

    // Validate required fields
    if (!name || !companyName || !contact || !companyEmail || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, companyName, contact, companyEmail, quantity",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(companyEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate quantity
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const corporateRequest = await client.corporate.create({
      data: {
        name,
        companyName,
        contact,
        companyEmail,
        askAnying: askAnything || "",
        quantity: parseInt(quantity),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Corporate gifting request created successfully",
      data: corporateRequest,
    });
  } catch (e) {
    console.error("Error in addRequest:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to create corporate request",
      error: e.message,
    });
  }
};

/**
 * View all corporate gifting requests
 */
export const viewAllRequest = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const where = {};
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    // Get total count
    const total = await client.corporate.count({ where });

    // Get paginated results
    const requests = await client.corporate.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: {
        [sortBy]: sortOrder.toLowerCase(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Corporate requests fetched successfully",
      data: requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (e) {
    console.error("Error in viewAllRequest:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch corporate requests",
      error: e.message,
    });
  }
};

/**
 * Update status of a corporate gifting request
 */
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.body;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Validate status
    const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
    const upperStatus = status.toUpperCase();
    
    if (!validStatuses.includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be PENDING, APPROVED, or REJECTED",
      });
    }

    // Check if request exists
    const existingRequest = await client.corporate.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Corporate request not found",
      });
    }

    const updatedRequest = await client.corporate.update({
      where: { id },
      data: { status: upperStatus },
    });

    return res.status(200).json({
      success: true,
      message: `Status updated to ${upperStatus} successfully`,
      data: updatedRequest,
    });
  } catch (e) {
    console.error("Error in updateStatus:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: e.message,
    });
  }
};

/**
 * Search corporate requests by company name or company email
 */
export const searchByCompanyNameOrCompanyEmail = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const requests = await client.corporate.findMany({
      where: {
        OR: [
          {
            companyName: {
              contains: search.trim(),
              mode: "insensitive",
            },
          },
          {
            companyEmail: {
              contains: search.trim(),
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: `Found ${requests.length} matching request(s)`,
      data: requests,
      count: requests.length,
    });
  } catch (e) {
    console.error("Error in searchByCompanyNameOrCompanyEmail:", e);
    return res.status(500).json({
      success: false,
      message: "Failed to search corporate requests",
      error: e.message,
    });
  }
};