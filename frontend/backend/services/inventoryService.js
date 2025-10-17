const Inventory = require('../models/inventory');
const { generateNextInventoryId } = require('../utils/idGenerator');
const { successResponse, formatErrorResponse } = require('../utils/helpers');

class InventoryService {
  async getAllItems() {
    try {
      const inventory = await Inventory.find().sort({ createdAt: -1 });
      
      // Format all date fields to show only date part
      const formattedInventory = inventory.map(item => ({
        ...item.toObject(),
        createdDate: item.createdDate ? new Date(item.createdDate).toISOString().split('T')[0] : null,
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : null,
        expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : null
      }));
      
      return successResponse({ inventory: formattedInventory });
    } catch (error) {
      return formatErrorResponse(error);
    }
  }

  async getItemById(inventoryId) {
    try {
      const item = await Inventory.findOne({ inventoryId });
      if (!item) {
        return { ok: false, error: 'Inventory item not found' };
      }
      
      // Format all date fields to show only date part
      const formattedItem = {
        ...item.toObject(),
        createdDate: item.createdDate ? new Date(item.createdDate).toISOString().split('T')[0] : null,
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : null,
        expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : null
      };
      
      return successResponse({ item: formattedItem });
    } catch (error) {
      return formatErrorResponse(error);
    }
  }

  async createItem(itemData) {
    try {
      const {
        userId, ingredientName, quantity, unit, category,
        purchaseDate, expirationDate, location, cost
      } = itemData;

      const inventoryId = await generateNextInventoryId();
      const createdDate = new Date();

      const newItem = new Inventory({
        inventoryId,
        userId,
        addedBy: userId,
        ingredientName,
        quantity,
        unit,
        category,
        purchaseDate: new Date(purchaseDate),
        expirationDate: new Date(expirationDate),
        location,
        cost,
        createdDate
      });

      await newItem.save();
      
      // Format all date fields to show only date part
      const formattedItem = {
        ...newItem.toObject(),
        createdDate: newItem.createdDate ? new Date(newItem.createdDate).toISOString().split('T')[0] : null,
        purchaseDate: newItem.purchaseDate ? new Date(newItem.purchaseDate).toISOString().split('T')[0] : null,
        expirationDate: newItem.expirationDate ? new Date(newItem.expirationDate).toISOString().split('T')[0] : null
      };
      
      return successResponse({ item: formattedItem });
    } catch (error) {
      return formatErrorResponse(error);
    }
  }

  async updateItem(inventoryId, updateData) {
    try {
      const updatedItem = await Inventory.findOneAndUpdate(
        { inventoryId },
        { 
          $set: { 
            ingredientName: updateData.ingredientName,
            quantity: updateData.quantity,
            unit: updateData.unit,
            category: updateData.category,
            purchaseDate: new Date(updateData.purchaseDate),
            expirationDate: new Date(updateData.expirationDate),
            location: updateData.location,
            cost: updateData.cost
          } 
        },
        { runValidators: true, new: true }
      );

      if (!updatedItem) {
        return { ok: false, error: 'Inventory item not found' };
      }

      // Format all date fields to show only date part
      const formattedItem = {
        ...updatedItem.toObject(),
        createdDate: updatedItem.createdDate ? new Date(updatedItem.createdDate).toISOString().split('T')[0] : null,
        purchaseDate: updatedItem.purchaseDate ? new Date(updatedItem.purchaseDate).toISOString().split('T')[0] : null,
        expirationDate: updatedItem.expirationDate ? new Date(updatedItem.expirationDate).toISOString().split('T')[0] : null
      };

      return successResponse({ item: formattedItem });
    } catch (error) {
      return formatErrorResponse(error);
    }
  }

  async deleteItem(inventoryId) {
    try {
      const deleted = await Inventory.deleteOne({ inventoryId });
      if (deleted.deletedCount === 0) {
        return { ok: false, error: 'Inventory item not found' };
      }

      return { ok: true, message: 'Inventory item deleted successfully' };
    } catch (error) {
      return formatErrorResponse(error);
    }
  }
}

module.exports = new InventoryService();
