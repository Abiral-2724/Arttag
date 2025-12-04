import client from "../prisma.js";

// import { PrismaClient } from "@prisma/client";
import cloudinary from "../utils/cloudinary.js";
// const client = new PrismaClient() ;

export const createCategoryOrCreateSubCategory = async(req ,res) => {
    try{
        const userId = req.params.userId ;

        const user = await client.user.findFirst({
            where : {
                id : userId
            }
        })

        if(!user){
            return res.status(400).json({
                success : false ,
                message : "No user exits with this id"
            })
        }

        if(user.role === "USER"){
            return res.status(400).json({
                success : false ,
                message : "You have no right to add category"
            })
        }

        const {name ,parentId} = req.body ; 

        if(!name){
            return res.status(400).json({
                success : false ,
                message : 'Name is required'
            })
        }

        const findifnameexits = await client.category.findFirst({
            where : {
                name : name
            }
        })

        if(findifnameexits){
            return res.status(200).json({
                success : false ,
                message : 'This category name already exits'
            })
        }

        if(!parentId){
            const category = await client.category.create({
                data : {
                    name : name
                }
            })

            return res.status(200).json({
                success : true ,
                message : 'new category created' ,
                category : category
            })
        }

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            {
              folder: 'project_files',
              resource_type: 'auto' 
            }
          );
          const file = result.secure_url
        if(!file){
            return res.status(400).json({
                success : false ,
                message : "no file found" ,
            })
        }

        const subcategory = await client.category.create({
            data : {
                name : name ,
                parentId : parentId ,
                imageUrl : file
            }
        })

        return res.status(200).json({
            success : true ,
            message : 'new subcategory created successfully' ,
            subcategory : subcategory
        })

    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while creating category ,please try again later !'
        })
    }
}


export const getallCategory = async(req ,res) => {
    try{
            const category = await client.category.findMany({
                where : {
                    parentId : null 
                    
                },
                include: { children: true }
            })

            return res.status(200).json({
                success : true ,
                message : 'all category found' ,
                category : category
            })
    }
    catch(e){
        console.log(e) ; 
        return res.status(500).json({
            success : false ,
            message : 'error while getting all category ,please try again later !'
        })
    }
}

export const getallSubCategoryOfTheCategory = async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
  
      const subcategories = await client.category.findMany({
        where: {
          parentId: categoryId,
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
            createdAt: 'desc', // Most recent first
          },
      });
  
      if (subcategories.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No subcategory found currently , add new subcategory',
        });
      }
  
      return res.status(200).json({
        success: true,
        message: 'All subcategories found',
        parentCategory: subcategories[0].parent, // since all share same parent
        subcategories,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        message: 'Error while fetching subcategories, please try again later!',
      });
    }
  };
  

export const getallSubCategory = async(req ,res) => {
    try{
        const subcategories = await client.category.findMany({
            where : {
                parentId : {
                    not : null
                }
            }
        })

        return res.status(200).json({
            success : true ,
            message : "all subcategory found" ,
            subcategories : subcategories
        })
    }catch (e) {
            console.log(e);
            return res.status(500).json({
              success: false,
              message: 'Error while fetching subcategories, please try again later!',
            });
          }
    
}