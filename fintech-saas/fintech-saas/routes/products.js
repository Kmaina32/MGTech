const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authenticate = require('../middleware/authenticate');

// Create product
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    const product = await Product.create({
      userId: req.user.id,
      name,
      description,
      price,
      quantity,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
});

// Get all products for user
router.get('/', authenticate, async (req, res) => {
  try {
    const products = await Product.findAll({ where: { userId: req.user.id } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

// Get single product by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
});

// Update product
router.put('/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, quantity } = req.body;
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.quantity = quantity ?? product.quantity;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
});

// Delete product
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
});

module.exports = router;
s