import client from "../prisma.js";
import cloudinary from "../utils/cloudinary.js";


export const addStore = async (req ,res) => {
    try {
        const { storeName, storeAddress, storePincode,
            storeOpeningTimeing, storeClosingTiming, is24x7, storeLocationUrl,
            storeOpenDayEnd, storePhoneNumber, storeOpenDayStart ,storeCity ,storeState } = req.body;


            if (
                !storeName ||
                !storeAddress ||
                !storePincode ||
                (is24x7 === false && (!storeOpeningTimeing || !storeClosingTiming)) ||
                is24x7 === undefined ||
                !storeLocationUrl ||
                !storeOpenDayEnd ||
                !storePhoneNumber ||
                !storeOpenDayStart ||
                !storeState || 
                !storeCity
              ) {
                return res.status(400).json({
                  success: false,
                  message: "Missing details",
                });
              }
              
              if(storePincode.length !== 6){
                return res.status(400).json({
                    success: false,
                    message: "Invalid pincode",
                  });
              }
              const is24x7Bool = is24x7 === "true";


        const storeImageFile = req.files.find(f => f.fieldname === 'storeimage');

        let storeImage = null;

        if (storeImageFile) {
            const result = await cloudinary.uploader.upload(
                `data:${storeImageFile.mimetype};base64,${storeImageFile.buffer.toString('base64')}`,
                { folder: "project_files", resource_type: "auto" }
            );
            storeImage = result.secure_url;
        }

        const newStore = await client.store.create({
            data: {
                storeName: storeName,
                storeAddress: storeAddress,
                storePincode: storePincode,
                storeImage: storeImage,
                storePhoneNumber: storePhoneNumber,
                storeOpenDayStart: storeOpenDayStart,
                storeOpenDayEnd: storeOpenDayEnd,
                storeOpeningTimeing: storeOpeningTimeing,
                storeClosingTiming: storeClosingTiming,
                is24x7: is24x7Bool,
                storeLocationUrl: storeLocationUrl,
                storeCity : storeCity ,
                storeState : storeState
            }
        })


        return res.status(201).json({
            success: true,
            message: "store created successfully",
            store: newStore
        });


    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'error while adding store ,please try again later !'
        })
    }
}

export const deleteStore = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Store ID is required"
            });
        }

        // Check if store exists
        const existingStore = await client.store.findUnique({
            where: { id }
        });

        if (!existingStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }
        // Delete the store
        await client.store.delete({
            where: { id }
        });

        return res.status(200).json({
            success: true,
            message: "Store deleted successfully"
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Error while deleting store, please try again later!'
        });
    }
};

export const updateStore = async (req, res) => {
    try {
        const { id } = req.body;
        const {
            storeName,
            storeAddress,
            storePincode,
            storeOpeningTimeing,
            storeClosingTiming,
            is24x7,
            storeLocationUrl,
            storeOpenDayEnd,
            storePhoneNumber,
            storeOpenDayStart,
            storeCity,
            storeState
        } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Store ID is required"
            });
        }

        // Check if store exists
        const existingStore = await client.store.findUnique({
            where: { id }
        });

        if (!existingStore) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        // Validate pincode if provided
        if (storePincode && storePincode.length !== 6) {
            return res.status(400).json({
                success: false,
                message: "Invalid pincode"
            });
        }

        // Validate timing requirements if is24x7 is being set to false
        if (is24x7 === "false" && (!storeOpeningTimeing || !storeClosingTiming)) {
            return res.status(400).json({
                success: false,
                message: "Opening and closing timings are required for non-24x7 stores"
            });
        }

        // Handle image upload if provided
        let storeImage = existingStore.storeImage;
        const storeImageFile = req.files?.find(f => f.fieldname === 'storeimage');
        
        if (storeImageFile) {
            // Delete old image from cloudinary if exists
            if (existingStore.storeImage) {
                const publicId = existingStore.storeImage.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`project_files/${publicId}`);
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(
                `data:${storeImageFile.mimetype};base64,${storeImageFile.buffer.toString('base64')}`,
                { folder: "project_files", resource_type: "auto" }
            );
            storeImage = result.secure_url;
        }

        // Prepare update data (only include fields that are provided)
        const updateData = {};
        if (storeName) updateData.storeName = storeName;
        if (storeAddress) updateData.storeAddress = storeAddress;
        if (storePincode) updateData.storePincode = storePincode;
        if (storeCity) updateData.storeCity = storeCity;
        if (storeState) updateData.storeState = storeState;
        if (storeImage) updateData.storeImage = storeImage;
        if (storePhoneNumber) updateData.storePhoneNumber = storePhoneNumber;
        if (storeOpenDayStart) updateData.storeOpenDayStart = storeOpenDayStart;
        if (storeOpenDayEnd) updateData.storeOpenDayEnd = storeOpenDayEnd;
        if (storeLocationUrl) updateData.storeLocationUrl = storeLocationUrl;
        
        if (is24x7 !== undefined) {
            updateData.is24x7 = is24x7 === "true";
            if (updateData.is24x7) {
                updateData.storeOpeningTimeing = null;
                updateData.storeClosingTiming = null;
            }
        }
        
        if (storeOpeningTimeing) updateData.storeOpeningTimeing = storeOpeningTimeing;
        if (storeClosingTiming) updateData.storeClosingTiming = storeClosingTiming;

        // Update the store
        const updatedStore = await client.store.update({
            where: { id },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: "Store updated successfully",
            store: updatedStore
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Error while updating store, please try again later!'
        })
    }
};


// Search Store Controller
export const searchStore = async (req, res) => {
    try {
        const { city, state, pincode } = req.query;

        if (!city && !state && !pincode) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one search parameter (city, state, or pincode)"
            });
        }

        // Build search criteria
        const searchCriteria = {};
        
        if (city) {
            searchCriteria.storeCity = {
                contains: city,
                mode: 'insensitive'
            };
        }
        
        if (state) {
            searchCriteria.storeState = state;
        }
        
        if (pincode) {
            searchCriteria.storePincode = pincode;
        }

        // Search stores
        const stores = await client.store.findMany({
            where: searchCriteria,
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No stores found matching the search criteria"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Found ${stores.length} store(s)`,
            count: stores.length,
            stores: stores
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Error while searching stores, please try again later!'
        });
    }
};

// Get All Stores Controller
export const getAllStore = async (req, res) => {
    try {
        const { page , limit } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count
        const totalStores = await client.store.count();

        // Get paginated stores
        const stores = await client.store.findMany({
            skip: skip,
            take: limitNum,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const totalPages = Math.ceil(totalStores / limitNum);

        return res.status(200).json({
            success: true,
            message: "Stores retrieved successfully",
            count: stores.length,
            totalStores: totalStores,
            currentPage: pageNum,
            totalPages: totalPages,
            stores: stores
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Error while fetching stores, please try again later!'
        });
    }
};