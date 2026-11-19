const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Digital Store API online!', docs: '/api-docs' });
});

app.use('/v1', routes);
app.use(errorMiddleware);

module.exports = app;
