module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: 'Registro duplicado. Verifique campos únicos (como email ou slug).' });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
  }

  return res.status(500).json({ error: 'Erro interno do servidor.' });
};
