import multer from 'multer';

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// Add file filter for images, PDFs, and videos
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype.startsWith('image/') ||   // all image types
        file.mimetype === 'application/pdf' || // pdf
        file.mimetype.startsWith('video/')     // all video types
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only image, PDF, or video files are allowed!'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit (you can adjust if needed)
    }
});

export const productUpload = upload.any() ; 

export default upload;