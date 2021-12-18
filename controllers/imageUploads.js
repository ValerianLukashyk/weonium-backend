const multer = require("multer");
const sharp = require("sharp");

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image" || "video")) {
        cb(null, true);
    } else {
        cb("Please upload only images and video.", false);
    }
};


const multerStorage = multer.memoryStorage(); // for image

// const videoStorage = multer.diskStorage({
//     destination: 'videos', // Destination to store video 
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now()
//             + path.extname(file.originalname))
//     }
// });

// const videoUpload = multer({
//     storage: videoStorage,
//     limits: {
//         fileSize: 100000000 // 10000000 Bytes = 10 MB
//     },
//     fileFilter(req, file, cb) {
//         // upload only mp4 and mkv format
//         if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
//             return cb(new Error('Please upload a video'))
//         }
//         cb(undefined, true)
//     }
// })

// const uploadVideos = videoUpload.single('video')


const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const uploadFiles = upload.array("all", 10);
const uploadPostFiles = upload.single("image");

const uploadPostImage = (req, res, next) => {
    uploadPostFiles(req, res, err => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return res.send("Too many files to upload.")
            }
        } else if (err) {
            return res.send(err)
        }

        next()
    })
}

const uploadImages = (req, res, next) => {
    uploadFiles(req, res, err => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return res.send("Too many files to upload.");
            }
        } else if (err) {
            return res.send(err);
        }

        next();
    });
};

const resizeImages = async (req, res, next) => {
    console.log(req.files)
    if (!req.files) return next();

    req.body.images = [];
    req.body.videos = [];

    await Promise.all(
        req.files.map(async file => {
            if (file.originalname.match(/\.(png|jpg)$/)) {
                const filename = file.originalname.replace(/\..+$/, "");
                const newFilename = `${Date.now()}-${filename}.jpeg`;

                await sharp(file.buffer)
                    .resize(1000)
                    .toFormat("jpeg")
                    .jpeg({ quality: 82 })
                    .toFile(`upload/${newFilename}`);

                req.body.images.push(newFilename);
            }
            if (file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
                console.log(file)
                const newFilename = `${Date.now()}-${filename}.mp4`;
                req.body.videos.push(newFilename);
            }

        })
    );

    next();
};

// const getResult = async (req, res) => {
//     if (req.body.images.length <= 0) {
//         return res.send(`You must select at least 1 image.`);
//     }

//     const images = req.body.images
//         .map(image => "http://localhost:5000/upload/" + image)
//     // .join("");
//     console.log(images)
//     return res.send(`Images were uploaded:${images}`);
// };

module.exports = {
    uploadImages: uploadImages,
    uploadPostImage: uploadPostImage,
    resizeImages: resizeImages,
    // getResult: getResult
};