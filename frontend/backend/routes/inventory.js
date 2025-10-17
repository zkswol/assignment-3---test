const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');
const { authenticateUser } = require('../middleware/auth');
const { validateInventoryItem } = require('../middleware/validation');

// Get all inventory items
router.get('/inventory-34475338', authenticateUser, async (req, res) => {
  const result = await inventoryService.getAllItems();
  const statusCode = result.ok ? 200 : 500;
  res.status(statusCode).json(result);
});

// Get single inventory item
router.get('/inventory-34475338/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const result = await inventoryService.getItemById(id);
  const statusCode = result.ok ? 200 : 404;
  res.status(statusCode).json(result);
});

// Create new inventory item
router.post('/inventory-34475338', authenticateUser, validateInventoryItem, async (req, res) => {
  const itemData = { ...req.body, userId: req.user.userId };
  const result = await inventoryService.createItem(itemData);
  const statusCode = result.ok ? 201 : 400;
  res.status(statusCode).json(result);
});

// Update inventory item
router.put('/inventory-34475338/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const result = await inventoryService.updateItem(id, req.body);
  const statusCode = result.ok ? 200 : 404;
  res.status(statusCode).json(result);
});

// Delete inventory item
router.delete('/inventory-34475338/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const result = await inventoryService.deleteItem(id);
  const statusCode = result.ok ? 204 : 404;
  
  if (result.ok) {
    res.sendStatus(statusCode);
  } else {
    res.status(statusCode).json(result);
  }
});

module.exports = router;
