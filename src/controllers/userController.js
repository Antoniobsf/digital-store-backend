const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = {
  // POST /v1/user (Criar usuário)
  async create(req, res, next) {
    try {
      const { firstname, surname, email, password, confirmPassword } = req.body;

      if (!firstname || !surname || !email || !password) {
        return res.status(400).json({ error: 'Preencha firstname, surname, email e password.' });
      }

      if (confirmPassword && password !== confirmPassword) {
        return res.status(400).json({ error: 'As senhas não conferem.' });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        firstname,
        surname,
        email,
        password: hashedPassword,
      });

      return res.status(201).json({
        id: user.id,
        firstname: user.firstname,
        surname: user.surname,
        email: user.email,
      });
    } catch (error) {
      return next(error);
    }
  },

  // POST /v1/user/token (Login e geração de JWT)
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'digital_store_super_secret_key_2026',
        { expiresIn: '24h' }
      );

      return res.status(200).json({ token });
    } catch (error) {
      return next(error);
    }
  },

  // GET /v1/user/:id (Buscar usuário por ID)
  async getById(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'firstname', 'surname', 'email'],
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      return res.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  },

  // PUT /v1/user/:id (Atualizar usuário - autenticado)
  async update(req, res, next) {
    try {
      const { firstname, surname, email } = req.body;
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      await user.update({
        firstname: firstname ?? user.firstname,
        surname: surname ?? user.surname,
        email: email ?? user.email,
      });

      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },

  // DELETE /v1/user/:id (Remover usuário - autenticado)
  async remove(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      await user.destroy();
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  },
};
