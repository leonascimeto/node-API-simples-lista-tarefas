const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth.json")

const User = require("../models/user");

const router = express.Router();

function generateToken(params = {}) {
  const token = jwt.sign({ id: params.id }, authConfig.secret, {
    expiresIn: 86400,
  });
  return token;
}

//register
router.post('/register', async (req, res) => {
  const { email } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).send({ error: "Já existe um usuário com este email" });

    const user = await User.create(req.body);

    user.password = undefined;

    return res.send({
      user,
      token: generateToken({ id: user.id }),
    });
  } catch (err) {
    console.err(err)
    res.status(400).send({ error: "Falha no registro!" })
  }
});

//authenticate
router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user)
    return res.status(400).send({ error: 'Usuário não encontrado' });

  if (!await bcrypt.compare(password, user.password))
    return res.status(400).send({ error: "Senha Inválida" });

  user.password = undefined;



  res.send({
    user,
    token: generateToken({ id: user.id }),
  })
})

module.exports = app => app.use('/auth', router);