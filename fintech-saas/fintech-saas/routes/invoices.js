const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const authenticate = require('../middleware/authenticate');

// Create invoice
router.post('/', authenticate, async (req, res) => {
  try {
    const { amount, dueDate, description } = req.body;
    const invoice = await Invoice.create({
      userId: req.user.id,
      amount,
      dueDate,
      description,
    });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice', error });
  }
});

// Get all invoices for user
router.get('/', authenticate, async (req, res) => {
  try {
    const invoices = await Invoice.findAll({ where: { userId: req.user.id } });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error });
  }
});

// Get single invoice by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice', error });
  }
});

// Update invoice
router.put('/:id', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const { amount, dueDate, description, status } = req.body;
    invoice.amount = amount ?? invoice.amount;
    invoice.dueDate = dueDate ?? invoice.dueDate;
    invoice.description = description ?? invoice.description;
    invoice.status = status ?? invoice.status;

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error updating invoice', error });
  }
});

// Delete invoice
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deleted = await Invoice.destroy({ where: { id: req.params.id, userId: req.user.id } });
    if (!deleted) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice', error });
  }
});

module.exports = router;
