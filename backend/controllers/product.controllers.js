import client from "../prisma.js";


import cloudinary from "../utils/cloudinary.js";
import dotenv from 'dotenv' 


dotenv.config({});
// import { PrismaClient } from '@prisma/client';
// const client = new PrismaClient() ;


export const addProduct = async (req, res) => {
  try {
    const { userId, categoryId } = req.params;

    // 1️⃣ Auth check
    const user = await client.user.findFirst({ where: { id: userId } });
    if (!user) return res.status(400).json({ success: false, message: "No user exists with this ID" });
    if (user.role === "USER") return res.status(403).json({ success: false, message: "You have no right to add a product" });

    // 2️⃣ Destructure body
    const {
      name, description, shortDescription, originalPrice, discountPrice,
      type, tags, material, dimensions, weight, packageContent, care,
      countryOfOrigin, manufacturerName, packerName, importerName,
      delivery, caseOnDeliveryAvailability, returnDetails,
      colors, modelImageDescriptions, totalCount,
      highlights, keyFeatures,          // new optional fields
    } = req.body;

    // 3️⃣ Validate required fields
    const required = { name, description, originalPrice, discountPrice, material, dimensions, weight, packageContent, care, countryOfOrigin, manufacturerName, importerName, packerName, delivery, caseOnDeliveryAvailability, returnDetails };
    const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    // 4️⃣ Upload ALL images in parallel (primary + model + color images)
    const primaryImage1File = req.files?.find(f => f.fieldname === 'primaryImage1');
    const primaryImage2File = req.files?.find(f => f.fieldname === 'primaryImage2');
    const modelImageFiles   = req.files?.filter(f => f.fieldname === 'modelImages') || [];

    const parsedColors       = typeof colors === 'string' ? JSON.parse(colors) : (colors || []);
    const parsedDescriptions = typeof modelImageDescriptions === 'string' ? JSON.parse(modelImageDescriptions) : (modelImageDescriptions || []);

    // Helper: upload a single buffer to Cloudinary
    const uploadBuffer = (file) =>
      cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        { folder: 'project_files', resource_type: 'auto' }
      );

    // Kick off ALL uploads simultaneously
    const [primary1Result, primary2Result, modelResults, ...colorResultGroups] = await Promise.all([
      primaryImage1File ? uploadBuffer(primaryImage1File) : Promise.resolve(null),
      primaryImage2File ? uploadBuffer(primaryImage2File) : Promise.resolve(null),
      Promise.all(modelImageFiles.map(uploadBuffer)),
      ...parsedColors.map((color) => {
        const colorFiles = req.files?.filter(f => f.fieldname.startsWith(`color_${color.name}_image`)) || [];
        return Promise.all(colorFiles.map(uploadBuffer));
      }),
    ]);

    const primaryImage1 = primary1Result?.secure_url || null;
    const primaryImage2 = primary2Result?.secure_url || null;

    // 5️⃣ Create product
    const safeParseJSON = (val, fallback) => {
      if (!val || typeof val !== 'string' || val.trim() === '') return fallback;
      try { return JSON.parse(val); } catch { return fallback; }
    };

    const product = await client.product.create({
      data: {
        name, description, shortDescription: shortDescription || null,
        material, dimensions,
        originalPrice: Number(originalPrice),
        discountPrice: Number(discountPrice),
        type: type || null,
        tags: safeParseJSON(typeof tags === 'string' ? tags : JSON.stringify(tags ?? []), []),
        weight: parseFloat(weight),
        packageContent, care, countryOfOrigin,
        manufacturerName, packerName, importerName,
        delivery,
        caseOnDeliveryAvailability: caseOnDeliveryAvailability === 'true',
        returnDetails,
        categoryId,
        primaryImage1, primaryImage2,
        totalCount: Number(totalCount) || 0,
        highlights: highlights || null,
        keyFeatures: keyFeatures || null,
      },
    });

    // 6️⃣ Create model images & colors in parallel (now just DB writes, uploads already done)
    const modelImageData = modelResults.map((result, i) => ({
      url: result.secure_url,
      altText: modelImageFiles[i]?.originalname || `image_${i}`,
      description: parsedDescriptions[i] || 'Model Image',
      productId: product.id,
    }));

    const colorData = parsedColors.map((color, ci) => {
      const urls = (colorResultGroups[ci] || []).map(r => r.secure_url);
      return {
        name: color.name,
        hex: color.hex,
        productId: product.id,
        colorImage1: urls[0] || null,
        colorImage2: urls[1] || null,
        colorImage3: urls[2] || null,
        colorImage4: urls[3] || null,
        colorImage5: urls[4] || null,
      };
    });

    // Single parallel DB write for model images + colors
    await Promise.all([
      modelImageData.length > 0 ? client.productImages.createMany({ data: modelImageData }) : Promise.resolve(),
      colorData.length > 0       ? client.productColor.createMany({ data: colorData })       : Promise.resolve(),
    ]);

    // 7️⃣ Return full product
    const fullProduct = await client.product.findUnique({
      where: { id: product.id },
      include: { colors: true, images: true },
    });

    return res.status(201).json({ success: true, message: 'Product created successfully', product: fullProduct });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Error while adding product. Please try again later!' });
  }
};
  

export const getProductDetailsById = async(req ,res) => {
    try{
            const productId = req.params.productId ; 

            const product = await client.product.findFirst({
                where : {
                    id : productId
                },
                include: {wishlists : true ,cart:true , colors: true, images: true}
            })

            if(!product){
                return res.status(400).json({
                    success : false ,
                    message : 'no such product exits'
                })
            }
            
            return res.status(200).json({
                success : true  ,
                message : 'Product detail found successfully' ,
                product : product
            })
            
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while getting product details ,please try again later !'
        })
    }
}



export const getallProductoftheCategory = async(req ,res) => {
    try{
        const categoryId = req.params.categoryId ; 

        const category = await client.category.findFirst({
            where : {
                id : categoryId
            }
        })

        if(!category){
            return res.status(400).json({
                success: true,
                message: "No such category exits"
                
              });
        }

        const product = await client.product.findMany({
            where : {
                categoryId : categoryId
            },
            include: { colors: true, images: true}

        })

        return res.status(201).json({
            success: true,
            message: "all product of category found successfully",
            product: product,
          });

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while getting product by category ,please try again later !'
        })
    }
}

export const updateProductDetails = async(req ,res) => {
    try{

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while updating product details ,please try again later !'
        })
    }
}


export const getAllProduct = async (req, res) => {
  try {
    // Fetch all products and count number of orders for each
    const products = await client.product.findMany({
      include: {
        images: true,
        colors: true,
        reviews: true,
        wishlists: true,
        orderItems: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add order count for each product
    const formattedProducts = products.map((product) => ({
      ...product,
      orderCount: product.orderItems.length,
    }));

    return res.status(200).json({
      success: true,
      message: "All products fetched successfully!",
      data: formattedProducts,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error while getting all products, please try again later!",
    });
  }
};


export const allDetails = async(req ,res) => {
    try{
        const now = new Date();
    const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // === 1. Totals ===
    const [totalProducts, totalCategories, totalOrders, totalRevenue] = await Promise.all([
      client.product.count(),
      client.category.count(),
      client.orders.count(),
      client.orders.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    // === 2. Added last month ===
    const [productsLastMonth, categoriesLastMonth, ordersLastMonth] = await Promise.all([
      client.product.count({
        where: {
          createdAt: {
            gte: firstDayOfLastMonth,
            lte: lastDayOfLastMonth,
          },
        },
      }),
      client.category.count({
        where: {
          createdAt: {
            gte: firstDayOfLastMonth,
            lte: lastDayOfLastMonth,
          },
        },
      }),
      client.orders.count({
        where: {
          createdAt: {
            gte: firstDayOfLastMonth,
            lte: lastDayOfLastMonth,
          },
        },
      }),
    ]);

    // === 3. Monthly trend data for graphs ===
    // Orders and revenue per month for the last 12 months
    const monthsBack = 12;
    const monthlyTrends = [];

    for (let i = 0; i < monthsBack; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const ordersInMonth = await client.orders.findMany({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        select: {
          totalAmount: true,
        },
      });

      const orderCount = ordersInMonth.length;
      const revenueSum = ordersInMonth.reduce((acc, o) => acc + o.totalAmount, 0);

      monthlyTrends.unshift({
        month: start.toLocaleString("default", { month: "short" }),
        year: start.getFullYear(),
        orders: orderCount,
        revenue: revenueSum,
      });
    }

    // === Final response ===
    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        totalProducts,
        totalCategories,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        productsLastMonth,
        categoriesLastMonth,
        ordersLastMonth,
        monthlyTrends, // ← graph data: [{month, year, orders, revenue}]
      },
    });
  } catch (e) {
    console.error("Error in allDetails:", e);
    return res.status(500).json({
      success: false,
      message: "Error while getting all details, please try again later!",
    });
  }
    
}
export const getProductBySpecificType = async (req, res) => {
    try {
      const { type, sort } = req.query; // sort = 'lowToHigh' or 'highToLow'
      const subcategoryId = req.params.subcategoryId;
  
      if (!subcategoryId) {
        return res.status(400).json({
          success: false,
          message: "subcategoryId is required",
        });
      }
  
      // Step 1: Build sorting condition
      let orderBy = undefined;
      if (sort === "lowToHigh") {
        orderBy = { discountPrice: "asc" };
      } else if (sort === "highToLow") {
        orderBy = { discountPrice: "desc" };
      }
  
      // Step 2: Fetch filtered + sorted products
      const products = await client.product.findMany({
        where: {
          categoryId: subcategoryId,
          ...(type && { type: { equals: type, mode: "insensitive" } }),
        },
        include: {
          images: true,
          colors: true,
        },
        ...(orderBy && { orderBy }), // apply sorting if requested
      });
  
      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No products found for this category/type",
        });
      }
  
      return res.status(200).json({
        success: true,
        count: products.length,
        products,
      });
    } catch (e) {
      console.error("Error fetching products:", e);
      return res.status(500).json({
        success: false,
        message:
          "Error while getting products with specific type or filter. Please try again later!",
      });
    }
  };

  export const getAllTypeOfProductInSubcategory = async (req, res) => {
    try {
      // 1️⃣ Get the subcategory ID from route parameters
      const { subcategoryId } = req.params;
  
      if (!subcategoryId) {
        return res.status(400).json({
          success: false,
          message: "Subcategory ID is required",
        });
      }
  
      // 2️⃣ Fetch all distinct 'type' values from products belonging to this subcategory
      const products = await client.product.findMany({
        where: { categoryId: subcategoryId },
        distinct: ["type"], // ensures unique types
        select: {
          type: true,
          primaryImage1: true,
          name : true ,
          originalPrice:true ,
          discountPrice : true ,
           // pick one image per type
        },
      });
      
      // Transform into array of { type, image }
      const typesWithImage = products
        .filter(p => p.type) // remove null types
        .map(p => ({ type: p.type, image: p.primaryImage1 , }));
      

      const subcategorydetail = await client.category.findFirst({
        where : {
            id : subcategoryId
        }
      })
  
      console.log(subcategorydetail)
      // 4️⃣ Return response
      return res.status(200).json({
        success: true,
        types: typesWithImage,
        subcategorydetail : subcategorydetail
      });
    } catch (e) {
      console.error("Error getting types:", e);
      return res.status(500).json({
        success: false,
        message: "Error while getting all types. Please try again later!",
      });
    }
  };


  export const searchProduct = async (req, res) => {
    try {
      const query = req.query.q;
  
      if (!query || query.trim().length === 0) {
        return res.json({ results: [] });
      }
  
      const searchTerm = query.trim().toLowerCase();
      const results = [];
  
      
      const categories = await client.category.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
          parentId: null,
        },
        select: { id: true, name: true },
        take: 5,
      });
  
      categories.forEach((category) => {
        results.push({
          type: "category",
          id: category.id,
          name: category.name,
          url: `/product/category/${category.id}`,
        });
      });
  
      
      const subcategories = await client.category.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
          parentId: { not: null },
        },
        select: {
          id: true,
          name: true,
          parentId: true,
          parent: { select: { id: true, name: true } },
        },
        take: 5,
      });
  
      subcategories.forEach((subcategory) => {
        results.push({
          type: "subcategory",
          id: subcategory.id,
          name: subcategory.name,
          categoryId: subcategory.parentId,
          url: `/product/category/${subcategory.parentId}/subcategory/${subcategory.id}/${encodeURIComponent(
            subcategory.name
          )}`,
        });
      });
  
      
      const products = await client.product.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          categoryId: true,
          primaryImage1: true,
        },
        take: 10,
      });
  
      
      const categoryIds = [...new Set(products.map((p) => p.categoryId))];
  
      const categoryMapArr = await client.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true, parentId: true },
      });
  
      const categoryMap = {};
      categoryMapArr.forEach((c) => (categoryMap[c.id] = c));
  
     
      products.forEach((product) => {
        const subcat = categoryMap[product.categoryId];
        if (!subcat) return;
  
        results.push({
          type: "product",
          id: product.id,
          name: product.name,
          categoryId: subcat.parentId,
          subcategoryId: subcat.id,
          url: `/product/category/${subcat.parentId}/subcategory/${
            subcat.id
          }/${encodeURIComponent(subcat.name)}/${product.id}`,
        });
      });
  
      return res.json({
        results: results.slice(0, 15),
        query: query,
      });
    } catch (e) {
      console.error("🔴 SEARCH API ERROR:", e);
      return res.status(500).json({
        success: false,
        message: "Error while performing search! Please try again later.",
      });
    }
  };
  
export const updateStockOfProduct = async(req ,res) => {
  try{
      const {productId ,newStock} = req.body ; 

      if(!productId || !newStock){
        return res.status(400).json({
          success: false,
          message: "Missing field",
        });
      }

      const productExits = await client.product.findFirst({
        where : {
          id : productId
        }
      })

        if(!productExits){
          return res.status(400).json({
            success: false,
            message: "No such product exits",
          });
        }

        const updatedProductWithStock = await client.product.update({
          where : {
            id : productId
          } ,
          data:{
            totalCount : newStock
          }
        })

        return res.status(200).json({
          success : true ,
          message : "Stock of product updated successfully" ,
          product : updatedProductWithStock
        })
  }
  catch(e){
    console.error( e);
      return res.status(500).json({
        success: false,
        message: "Error while updating product stock. Please try again later!",
      });
  }
}

export const deleteProductById = async(req ,res) => {
  try{
          const {productId} = req.body ; 
          const userId = req.params.userId ; 

          const user = await client.user.findFirst(
              { 
                  where:
                   { 
                      id: userId
                   } 
                  }
              );
          if (!user) {
            return res.status(400).json({
              success: false,
              message: "No user exists with this ID",
            });
          }
      
          if (user.role === "USER") {
            return res.status(403).json({
              success: false,
              message: "You have no right to delete a product",
            });
          }
      

          const product = await client.product.delete({
              where : {
                  id : productId
              }
          })

          return res.status(200).json({
              success: true,
              message: "product deleted succesfully !!",
            });
  }
  catch(e){
      console.log(e) ; 
      return res.status(500).json({
          success : false ,
          message : 'error while getting product details ,please try again later !'
      })
  }
}

export const editProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1️⃣ Verify product exists
    const existingProduct = await client.product.findUnique({
      where: { id: productId },
      include: { images: true, colors: true },
    });

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 2️⃣ Destructure body
    const {
      name, description, shortDescription,
      originalPrice, discountPrice,
      type, tags, material, dimensions, weight,
      packageContent, care, countryOfOrigin,
      manufacturerName, packerName, importerName,
      delivery, caseOnDeliveryAvailability, returnDetails,
      categoryId, totalCount,
      replaceModelImages,
      highlights, keyFeatures,
      deleteColorIds,
      updateColors,
      addColors,
    } = req.body;

    // 3️⃣ Build product update object
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
    if (type !== undefined) updateData.type = type;
    if (material !== undefined) updateData.material = material;
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (packageContent !== undefined) updateData.packageContent = packageContent;
    if (care !== undefined) updateData.care = care;
    if (countryOfOrigin !== undefined) updateData.countryOfOrigin = countryOfOrigin;
    if (manufacturerName !== undefined) updateData.manufacturerName = manufacturerName;
    if (packerName !== undefined) updateData.packerName = packerName;
    if (importerName !== undefined) updateData.importerName = importerName;
    if (delivery !== undefined) updateData.delivery = delivery;
    if (returnDetails !== undefined) updateData.returnDetails = returnDetails;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (highlights !== undefined) updateData.highlights = highlights;
    if (keyFeatures !== undefined) updateData.keyFeatures = keyFeatures;

    if (originalPrice !== undefined) updateData.originalPrice = Number(originalPrice);
    if (discountPrice !== undefined) updateData.discountPrice = Number(discountPrice);
    if (weight !== undefined) updateData.weight = parseFloat(weight);
    if (totalCount !== undefined) updateData.totalCount = Number(totalCount);

    if (caseOnDeliveryAvailability !== undefined) {
      updateData.caseOnDeliveryAvailability = caseOnDeliveryAvailability === 'true';
    }

    
    // 4️⃣ Safe JSON parser
    const safeParseJSON = (val, fallback = []) => {
      if (!val || typeof val !== 'string' || val.trim() === '') return fallback;
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    };

    if (tags !== undefined) {
      // FIXED — safe against undefined, null, "", and malformed JSON
updateData.tags = safeParseJSON(typeof tags === 'string' ? tags : JSON.stringify(tags ?? []), []);
    }


    const toDeleteIds = safeParseJSON(deleteColorIds);
    const toUpdateColors = safeParseJSON(updateColors);
    const toAddColors = safeParseJSON(addColors);

    // Upload helper
    const uploadBuffer = (file) =>
      cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        { folder: 'project_files', resource_type: 'auto' }
      );

    // Files
    const primaryImage1File = req.files?.find(f => f.fieldname === 'primaryImage1');
    const primaryImage2File = req.files?.find(f => f.fieldname === 'primaryImage2');

    const modelImageFiles = replaceModelImages === 'true'
      ? (req.files?.filter(f => f.fieldname === 'modelImages') || [])
      : [];

    // Update colors
    const updateColorUploads = toUpdateColors.map(async (color) => {
      const slotResults = [null, null, null, null, null];

      for (let slot = 0; slot < 5; slot++) {
        const file = req.files?.find(f => f.fieldname === `updateColor_${color.id}_image${slot}`);
        if (file) {
          const r = await uploadBuffer(file);
          slotResults[slot] = r.secure_url;
        }
      }

      return { id: color.id, name: color.name, hex: color.hex, slotUrls: slotResults };
    });

    // Add colors
    const addColorUploads = toAddColors.map(async (color) => {
      const files = req.files?.filter(f =>
        f.fieldname.startsWith(`color_${color.name}_image`)
      ) || [];

      const results = await Promise.all(files.map(uploadBuffer));
      const urls = results.map(r => r.secure_url);

      return {
        name: color.name,
        hex: color.hex,
        productId,
        colorImage1: urls[0] || null,
        colorImage2: urls[1] || null,
        colorImage3: urls[2] || null,
        colorImage4: urls[3] || null,
        colorImage5: urls[4] || null,
      };
    });

    const [
      primary1Result,
      primary2Result,
      modelResults,
      resolvedUpdateColors,
      resolvedNewColors,
    ] = await Promise.all([
      primaryImage1File ? uploadBuffer(primaryImage1File) : Promise.resolve(null),
      primaryImage2File ? uploadBuffer(primaryImage2File) : Promise.resolve(null),
      modelImageFiles.length > 0
        ? Promise.all(modelImageFiles.map(uploadBuffer))
        : Promise.resolve([]),
      Promise.all(updateColorUploads),
      Promise.all(addColorUploads),
    ]);

    if (primary1Result) updateData.primaryImage1 = primary1Result.secure_url;
    if (primary2Result) updateData.primaryImage2 = primary2Result.secure_url;

    const ops = [];

    ops.push(
      client.product.update({
        where: { id: productId },
        data: updateData,
      })
    );

    if (toDeleteIds.length > 0) {
      ops.push(
        client.productColor.deleteMany({
          where: { id: { in: toDeleteIds } },
        })
      );
    }

    resolvedUpdateColors.forEach(({ id, name, hex, slotUrls }) => {
      const colorUpdateData = { name, hex };

      if (slotUrls[0]) colorUpdateData.colorImage1 = slotUrls[0];
      if (slotUrls[1]) colorUpdateData.colorImage2 = slotUrls[1];
      if (slotUrls[2]) colorUpdateData.colorImage3 = slotUrls[2];
      if (slotUrls[3]) colorUpdateData.colorImage4 = slotUrls[3];
      if (slotUrls[4]) colorUpdateData.colorImage5 = slotUrls[4];

      ops.push(
        client.productColor.update({
          where: { id },
          data: colorUpdateData,
        })
      );
    });

    if (resolvedNewColors.length > 0) {
      ops.push(
        client.productColor.createMany({
          data: resolvedNewColors,
        })
      );
    }

    if (replaceModelImages === 'true' && modelResults.length > 0) {
      ops.push(
        client.productImages
          .deleteMany({ where: { productId } })
          .then(() => {
            const newImageData = modelResults.map((r, i) => ({
              url: r.secure_url,
              altText: modelImageFiles[i]?.originalname || `image_${i}`,
              description: 'Model Image',
              productId,
            }));

            return client.productImages.createMany({ data: newImageData });
          })
      );
    }

    await Promise.all(ops);

    const updatedProduct = await client.product.findUnique({
      where: { id: productId },
      include: { images: true, colors: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: 'Error while updating product',
    });
  }
};


