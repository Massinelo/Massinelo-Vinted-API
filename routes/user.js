const express = require('express');
const router = express.Router();
const uid2 = require('uid2');
const SHA256 = require('crypto-js/sha256');
const encBase64 = require('crypto-js/enc-base64');

const User = require('../models/User');

router.post('/users/signup', async (req, res) => {
  try {
    const { email, username, phone, password } = req.fields;

    //verifier si le user existe déja
    const user = await User.findOne({ email: email });

    if (user) {
      res.status(409).json({ message: 'This email has already been taken' });
    } else {
      if (email && username && password) {
        // 1- Encrypter le mot de passe & génerer un token
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(password + salt).toString(encBase64);
        // 2- Créer nouveau user
        const newUser = new User({
          email: email,
          account: {
            username: username,
            phone: phone,
          },
          token: token,
          hash: hash,
          salt: salt,
        });
        // 3- Le sauvgarder dans la BDD
        await newUser.save();
        // 4- Repondre au client
        res.status(200).json({
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(400).json({ message: 'Missing parameters' });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.fields;

    const user = await User.findOne({ email: email });

    if (user) {
      // Verifier si le password client + le salt correspond au hash dans la base
      const hashToVerify = SHA256(password + user.salt).toString(encBase64);
      if (hashToVerify === user.hash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ message: 'Unauthorized ' });
      }
    } else {
      res.status(401).json({ message: 'Unauthorized ' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
