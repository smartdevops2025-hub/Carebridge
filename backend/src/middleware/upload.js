const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        'uploads/aadhaar',
        'uploads/pan',
        'uploads/selfie',
        'uploads/certificates',
        'uploads/profiles',
        'uploads/documents'
    ];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};
createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/documents';
        if (file.fieldname === 'aadhaar_front' || file.fieldname === 'aadhaar_back') {
            folder = 'uploads/aadhaar';
        } else if (file.fieldname === 'pan_image') {
            folder = 'uploads/pan';
        } else if (file.fieldname === 'selfie_image') {
            folder = 'uploads/selfie';
        } else if (file.fieldname === 'experience_certificate') {
            folder = 'uploads/certificates';
        } else if (file.fieldname === 'profile_image') {
            folder = 'uploads/profiles';
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
    }
};

// Upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

// Multi-file upload for KYC
const uploadKYCDocuments = upload.fields([
    { name: 'aadhaar_front', maxCount: 1 },
    { name: 'aadhaar_back', maxCount: 1 },
    { name: 'pan_image', maxCount: 1 },
    { name: 'selfie_image', maxCount: 1 },
    { name: 'experience_certificate', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 }
]);

const uploadSingle = upload.single('file');
const uploadMultiple = upload.array('files', 5);

module.exports = {
    upload,
    uploadKYCDocuments,
    uploadSingle,
    uploadMultiple
};
