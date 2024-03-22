const express = require("express");
const router = express.Router();

// const auth = require("../middleware/auth");

const multer = require("../middleware/multer-config");

const hotelCtrl = require("../controllers/hotel");

router.get("/", hotelCtrl.getAllHotel);
router.post("/", multer, hotelCtrl.createHotel);
router.get("/:id", hotelCtrl.getOneHotel);
router.put("/:id", multer, hotelCtrl.modifyHotel);
router.delete("/:id", hotelCtrl.deleteHotel);

module.exports = router;
