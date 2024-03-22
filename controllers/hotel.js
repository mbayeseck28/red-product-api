const Hotel = require("../models/hotel");

const fs = require("fs");

exports.createHotel = (req, res, next) => {
  const objetHotel = {
    nom: req.body.nom,
    image: req.body.image,
    adresse: req.body.adresse,
    email: req.body.email,
    telephone: req.body.telephone,
    prix: req.body.prix,
    devise: req.body.devise,
  };

  delete objetHotel._id;
  delete objetHotel._userId;

  const hotel = new Hotel({
    ...objetHotel,
    // userId: req.auth.userId,
    image: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  hotel
    .save()
    .then(() => {
      res.status(201).json({
        message: "Hotel saved successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getOneHotel = (req, res, next) => {
  Hotel.findOne({
    _id: req.params.id,
  })
    .then((hotel) => {
      res.status(200).json(hotel);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyHotel = (req, res, next) => {
  // Récupérer les valeurs à mettre à jour à partir du corps de la requête
  let updateValues = { ...req.body };

  // Supprimer les propriétés qui ne doivent pas être mises à jour
  delete updateValues._id;
  delete updateValues._userId;

  // Si une nouvelle image est fournie, mettre à jour l'URL de l'image
  if (req.file) {
    updateValues.image = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
  } else {
    // Si aucune nouvelle image n'est fournie, ne pas modifier l'URL de l'image
    delete updateValues.image;
  }

  Hotel.findOneAndUpdate({ _id: req.params.id }, updateValues, { new: true })
    .then((hotel) => {
      if (!hotel) {
        return res.status(404).json({ message: "Hotel non trouvé" });
      }
      res.status(200).json({ message: "Hotel modifié!", hotel });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteHotel = (req, res, next) => {
  Hotel.findOne({ _id: req.params.id })
    .then((hotel) => {
      const filename = hotel.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Hotel.deleteOne({ _id: req.params.id })
          .then(() => {
            res.status(200).json({ message: "Objet supprimé !" });
          })
          .catch((error) => res.status(401).json({ error }));
      });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllHotel = (req, res, next) => {
  Hotel.find()
    .then((hotel) => {
      // Inverser la liste
      const reversedHotel = hotel.reverse();
      res.status(200).json(reversedHotel);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
