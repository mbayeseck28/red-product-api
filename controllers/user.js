const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        prenom: req.body.prenom,
        nom: req.body.nom,
        telephone: req.body.telephone,
        email: req.body.email,
        password: hash,
        // photo: `${req.protocol}://${req.get('host')}/images/${
        //   req.file.filename
        // }`,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// ____________________________________

const nodemailer = require("nodemailer");

// Fonction pour envoyer un e-mail de réinitialisation de mot de passe
function sendResetPasswordEmail(user, token) {
  // Configuration du service d'envoi d'e-mails (Nodemailer)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "test.mbayeseck@gmail.com",
      pass: "p r o z n v n x e a a g h u q x",
    },
  });

  // Contenu de l'e-mail
  const mailOptions = {
    from: "test.mbayeseck@gmail.com",
    to: user.email, // Adresse e-mail de l'utilisateur
    subject: "Réinitialisation de mot de passe",
    text: `Bonjour ${user.prenom},

      Vous avez demandé une réinitialisation de mot de passe. Veuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :
      
      http://localhost:3000/resetpassword/${token}
      
      Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.

      Cordialement,
      RED PRODUCT`,
  };

  // Envoi de l'e-mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email envoyé: " + info.response);
    }
  });
}

// ________________________

// Contrôleur pour la demande de réinitialisation de mot de passe
exports.forgotPassword = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé !" });
      }
      const token = jwt.sign({ userId: user._id }, "RESET_PASSWORD_SECRET", {
        expiresIn: "1h", // Durée de validité du token de réinitialisation
      });
      sendResetPasswordEmail(user, token);
      res.status(200).json({
        message: "Un e-mail de réinitialisation de mot de passe a été envoyé.",
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// Contrôleur pour la soumission du formulaire de réinitialisation de mot de passe
exports.resetPassword = (req, res) => {
  const { token, password } = req.body;
  jwt.verify(token, "RESET_PASSWORD_SECRET", (err, decoded) => {
    if (err) {
      console.error("Erreur de vérification du token :", err); // pour déboguer
      return res.status(401).json({ error: "Token invalide ou expiré." });
    }
    const userId = decoded.userId;
    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: "Utilisateur non trouvé !" });
        }
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            console.error("Erreur lors du hachage du mot de passe :", err); // pour déboguer
            return res
              .status(500)
              .json({ error: "Erreur lors du hachage du mot de passe." });
          }
          user.password = hash;
          user
            .save()
            .then(() =>
              res
                .status(200)
                .json({ message: "Mot de passe réinitialisé avec succès." })
            )
            .catch((error) => {
              console.error(
                "Erreur lors de l'enregistrement de l'utilisateur :",
                error
              ); // Ajout de cette ligne pour déboguer
              res.status(500).json({ error });
            });
        });
      })
      .catch((error) => {
        console.error("Erreur lors de la recherche de l'utilisateur :", error); // Ajout de cette ligne pour déboguer
        res.status(500).json({ error });
      });
  });
};
