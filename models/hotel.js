const mongoose = require("mongoose");

const hotelSchema = mongoose.Schema({
  nom: { type: String, required: true },
  image: { type: String, required: true },
  adresse: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String, required: true },
  prix: { type: Number, required: true },
  devise: { type: String, required: true },
  dateAjout: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Hotel", hotelSchema);
