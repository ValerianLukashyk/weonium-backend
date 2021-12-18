const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home");
const uploadController = require("../controllers/imageUploads");

let routes = app => {
    router.get("/", homeController.getHome);

    router.post(
        '/multiple',
        uploadController.uploadImages,
        uploadController.resizeImages,
        // uploadController.getResult
    );

    return app.use("/load/", router);
};

module.exports = routes;