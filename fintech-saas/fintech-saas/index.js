require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sequelize = require('./models/index');
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send('Fintech SaaS API running...');
});

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Error syncing database:', err);
});
