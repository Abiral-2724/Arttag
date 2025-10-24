import client from "../prisma.js";


import cloudinary from "../utils/cloudinary.js";
import dotenv from 'dotenv' 


dotenv.config({});
// const client = new PrismaClient() ;
// import { PrismaClient } from '@prisma/client';

export const addProduct = async (req, res) => {
    try {
      const userId = req.params.userId;
        const categoryId = req.params.categoryId
      // 1️⃣ Check user
      const user = await client.user.findFirst({ where: { id: userId } });
      if (!user) {

        return res.status(400).json({
          success: false,
          message: "No user exists with this ID",
        });
      }
  
      if (user.role === "USER") {
        return res.status(403).json({
          success: false,
          message: "You have no right to add a product",
        });
      }
  
      // 2️⃣ Extract and validate fields
      const {
        name,
        description,
        shortDescription,
        originalPrice,
        discountPrice,
        type,
        tags ,
        material,
        dimensions,
        weight,
        packageContent,
        care,
        countryOfOrigin,
        manufacturerName,
        packerName,
        importerName,
        delivery,
        caseOnDeliveryAvailability,
        returnDetails,
        colors,
        modelImageDescriptions
      } = req.body;
  
      
      if (
        !name ||
        !description ||
        !originalPrice ||
        !discountPrice ||
        !material ||
        !dimensions ||
        !weight ||
        !packageContent ||
        !care ||
        !countryOfOrigin ||
        !manufacturerName ||
        !importerName ||
        !packerName ||
        !delivery ||
        !caseOnDeliveryAvailability ||
        !returnDetails 
        
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing fields! All fields are required.",
        });
      }
  
      const primaryImage1File = req.files.find(f => f.fieldname === 'primaryImage1');
      const primaryImage2File = req.files.find(f => f.fieldname === 'primaryImage2');
      
      let primaryImage1 = null;
      let primaryImage2 = null;
      
      if (primaryImage1File) {
        const result1 = await cloudinary.uploader.upload(
          `data:${primaryImage1File.mimetype};base64,${primaryImage1File.buffer.toString('base64')}`,
          { folder: "project_files", resource_type: "auto" }
        );
        primaryImage1 = result1.secure_url;
      }
      
      if (primaryImage2File) {
        const result2 = await cloudinary.uploader.upload(
          `data:${primaryImage2File.mimetype};base64,${primaryImage2File.buffer.toString('base64')}`,
          { folder: "project_files", resource_type: "auto" }
        );
        primaryImage2 = result2.secure_url;
      }

      const product = await client.product.create({
        data: {
          name, description, shortDescription, material, dimensions,
          originalPrice: Number(originalPrice),
          discountPrice: Number(discountPrice),
          type ,
          tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
          weight: parseFloat(weight),
          packageContent, care, countryOfOrigin,
          manufacturerName, packerName, importerName,
          delivery, caseOnDeliveryAvailability: caseOnDeliveryAvailability === "true",
          returnDetails, 
          categoryId: categoryId,
          primaryImage1, primaryImage2
        }
      });

      const parsedDescriptions = typeof modelImageDescriptions === "string" ? JSON.parse(modelImageDescriptions) : modelImageDescriptions || [];

      const modelImageFiles = req.files.filter(f => f.fieldname === 'modelImages');
for (let i = 0; i < modelImageFiles.length; i++) {
  const file = modelImageFiles[i];
  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    { folder: "project_files", resource_type: "auto" }
  );
  await client.productImages.create({
    data: {
      url: result.secure_url,
      altText: file.originalname,
      description: parsedDescriptions[i] || "Model Image",
      productId: product.id
    }
  });
}

      const parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors;
      for (const color of parsedColors) {
        const colorFiles = req.files.filter(f => f.fieldname.startsWith(`color_${color.name}_image`));
        const colorImages = [];
        for (const file of colorFiles) {
          const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            { folder: "project_files", resource_type: "auto" }
          );
          colorImages.push(result.secure_url);
        }
      
        await client.productColor.create({
          data: {
            name: color.name,
            hex: color.hex,
            productId: product.id,
            colorImage1: colorImages[0] || null,
            colorImage2: colorImages[1] || null,
            colorImage3: colorImages[2] || null,
            colorImage4: colorImages[3] || null,
            colorImage5: colorImages[4] || null
          }
        });
      }

   

      const fullProduct = await client.product.findUnique({
        where: { id: product.id },
        include: { colors: true, images: true}
      });
  
      

      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        product: fullProduct,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "Error while adding product. Please try again later!",
      });
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
                success: false,
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
        orders: {
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
      orderCount: product.orders.length,
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
      const products = await prisma.product.findMany({
        where: { categoryId: subcategoryId },
        distinct: ["type"], // ensures unique types
        select: {
          type: true,
          primaryImage1: true, // pick one image per type
        },
      });
      
      // Transform into array of { type, image }
      const typesWithImage = products
        .filter(p => p.type) // remove null types
        .map(p => ({ type: p.type, image: p.primaryImage1 }));
      

      const subcategorydetail = await client.category.findFirst({
        where : {
            id : subcategoryId
        }
      })
  
      
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
  