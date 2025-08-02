const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');

/**
 * MenuItem Model
 * Supports both MongoDB (Mongoose) and SQLite operations
 */

// MongoDB Schema
const menuItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  _id: false
});

const MongoMenuItem = mongoose.model('MenuItem', menuItemSchema);

/**
 * MenuItem class for handling both MongoDB and SQLite operations
 */
class MenuItem {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.available = data.available !== undefined ? data.available : true;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a new menu item
   * @param {Object} itemData - Menu item data
   * @returns {Promise<MenuItem>} Created menu item
   */
  static async create(itemData) {
    if (database.type === 'mongodb') {
      const item = new MongoMenuItem({
        _id: uuidv4(),
        ...itemData
      });
      await item.save();
      return item;
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const item = new MenuItem(itemData);
        
        const query = `
          INSERT INTO menu_items (id, name, description, price, available, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `;
        
        db.run(query, [
          item.id,
          item.name,
          item.description,
          item.price,
          item.available ? 1 : 0
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            item.createdAt = new Date().toISOString();
            item.updatedAt = new Date().toISOString();
            resolve(item);
          }
        });
      });
    }
  }

  /**
   * Find menu item by ID
   * @param {string} id - Menu item ID
   * @returns {Promise<MenuItem|null>} Found menu item or null
   */
  static async findById(id) {
    if (database.type === 'mongodb') {
      return await MongoMenuItem.findById(id);
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const query = 'SELECT * FROM menu_items WHERE id = ?';
        
        db.get(query, [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            row.available = Boolean(row.available);
            resolve(new MenuItem(row));
          } else {
            resolve(null);
          }
        });
      });
    }
  }

  /**
   * Get all menu items
   * @param {Object} filters - Filter options
   * @returns {Promise<MenuItem[]>} Array of menu items
   */
  static async findAll(filters = {}) {
    if (database.type === 'mongodb') {
      const query = {};
      if (filters.available !== undefined) {
        query.available = filters.available;
      }
      return await MongoMenuItem.find(query).sort({ name: 1 });
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        let query = 'SELECT * FROM menu_items';
        const params = [];
        
        if (filters.available !== undefined) {
          query += ' WHERE available = ?';
          params.push(filters.available ? 1 : 0);
        }
        
        query += ' ORDER BY name ASC';
        
        db.all(query, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const items = rows.map(row => {
              row.available = Boolean(row.available);
              return new MenuItem(row);
            });
            resolve(items);
          }
        });
      });
    }
  }

  /**
   * Update menu item
   * @param {Object} updateData - Data to update
   * @returns {Promise<MenuItem>} Updated menu item
   */
  async update(updateData) {
    if (database.type === 'mongodb') {
      const updated = await MongoMenuItem.findByIdAndUpdate(
        this.id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
      return updated;
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        
        // Convert boolean to integer for SQLite
        if (updateData.available !== undefined) {
          updateData.available = updateData.available ? 1 : 0;
          values[fields.indexOf('available')] = updateData.available;
        }
        
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const query = `UPDATE menu_items SET ${setClause}, updatedAt = datetime('now') WHERE id = ?`;
        
        db.run(query, [...values, this.id], function(err) {
          if (err) {
            reject(err);
          } else {
            Object.assign(this, updateData);
            if (updateData.available !== undefined) {
              this.available = Boolean(updateData.available);
            }
            this.updatedAt = new Date().toISOString();
            resolve(this);
          }
        });
      });
    }
  }

  /**
   * Delete menu item
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete() {
    if (database.type === 'mongodb') {
      await MongoMenuItem.findByIdAndDelete(this.id);
      return true;
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const query = 'DELETE FROM menu_items WHERE id = ?';
        
        db.run(query, [this.id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        });
      });
    }
  }

  /**
   * Get available menu items
   * @returns {Promise<MenuItem[]>} Array of available menu items
   */
  static async getAvailable() {
    return await MenuItem.findAll({ available: true });
  }

  /**
   * Search menu items by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<MenuItem[]>} Array of matching menu items
   */
  static async search(searchTerm) {
    if (database.type === 'mongodb') {
      return await MongoMenuItem.find({
        name: { $regex: searchTerm, $options: 'i' }
      }).sort({ name: 1 });
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const query = 'SELECT * FROM menu_items WHERE name LIKE ? ORDER BY name ASC';
        
        db.all(query, [`%${searchTerm}%`], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const items = rows.map(row => {
              row.available = Boolean(row.available);
              return new MenuItem(row);
            });
            resolve(items);
          }
        });
      });
    }
  }

  /**
   * Toggle availability
   * @returns {Promise<MenuItem>} Updated menu item
   */
  async toggleAvailability() {
    return await this.update({ available: !this.available });
  }

  /**
   * Convert to JSON
   * @returns {Object} Menu item object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      available: this.available,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = MenuItem;