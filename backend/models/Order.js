const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');

/**
 * Order Model
 * Supports both MongoDB (Mongoose) and SQLite operations
 */

// MongoDB Schema
const orderSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  tableNumber: {
    type: String,
    required: true,
    trim: true
  },
  menu: {
    type: String,
    required: true,
    trim: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  _id: false
});

const MongoOrder = mongoose.model('Order', orderSchema);

/**
 * Order class for handling both MongoDB and SQLite operations
 */
class Order {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.tableNumber = data.tableNumber;
    this.menu = data.menu;
    this.note = data.note || '';
    this.status = data.status || 'Pending';
    this.timestamp = data.timestamp || new Date().toISOString();
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Order>} Created order
   */
  static async create(orderData) {
    if (database.type === 'mongodb') {
      const order = new MongoOrder({
        _id: uuidv4(),
        ...orderData
      });
      await order.save();
      return order;
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const order = new Order(orderData);
        
        const query = `
          INSERT INTO orders (id, tableNumber, menu, note, status, timestamp, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `;
        
        db.run(query, [
          order.id,
          order.tableNumber,
          order.menu,
          order.note,
          order.status,
          order.timestamp
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            order.createdAt = new Date().toISOString();
            order.updatedAt = new Date().toISOString();
            resolve(order);
          }
        });
      });
    }
  }

  /**
   * Find order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Order|null>} Found order or null
   */
  static async findById(id) {
    if (database.type === 'mongodb') {
      return await MongoOrder.findById(id);
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const query = 'SELECT * FROM orders WHERE id = ?';
        
        db.get(query, [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(new Order(row));
          } else {
            resolve(null);
          }
        });
      });
    }
  }

  /**
   * Get all orders with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Promise<{orders: Order[], total: number, pagination: Object}>} Orders with pagination
   */
  static async findAll(options = {}) {
    const {
      status,
      tableNumber,
      menu,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'DESC'
    } = options;

    if (database.type === 'mongodb') {
      const query = {};
      
      if (status) query.status = status;
      if (tableNumber) query.tableNumber = tableNumber;
      if (menu) query.menu = { $regex: menu, $options: 'i' };
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const total = await MongoOrder.countDocuments(query);
      const skip = (page - 1) * limit;
      
      const sortObj = {};
      sortObj[sortBy] = sortOrder === 'ASC' ? 1 : -1;
      
      const orders = await MongoOrder.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit);

      return {
        orders,
        total,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        let query = 'SELECT * FROM orders';
        let countQuery = 'SELECT COUNT(*) as total FROM orders';
        const params = [];
        const conditions = [];

        if (status) {
          conditions.push('status = ?');
          params.push(status);
        }
        if (tableNumber) {
          conditions.push('tableNumber = ?');
          params.push(tableNumber);
        }
        if (menu) {
          conditions.push('menu LIKE ?');
          params.push(`%${menu}%`);
        }
        if (startDate) {
          conditions.push('timestamp >= ?');
          params.push(startDate);
        }
        if (endDate) {
          conditions.push('timestamp <= ?');
          params.push(endDate);
        }

        if (conditions.length > 0) {
          const whereClause = ' WHERE ' + conditions.join(' AND ');
          query += whereClause;
          countQuery += whereClause;
        }

        query += ` ORDER BY ${sortBy} ${sortOrder}`;
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, (page - 1) * limit);

        // Get total count first
        db.get(countQuery, params.slice(0, -2), (err, countResult) => {
          if (err) {
            reject(err);
            return;
          }

          const total = countResult.total;

          // Get orders
          db.all(query, params, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              const orders = rows.map(row => new Order(row));
              resolve({
                orders,
                total,
                pagination: {
                  page,
                  limit,
                  totalPages: Math.ceil(total / limit),
                  hasNext: page < Math.ceil(total / limit),
                  hasPrev: page > 1
                }
              });
            }
          });
        });
      });
    }
  }

  /**
   * Update order
   * @param {Object} updateData - Data to update
   * @returns {Promise<Order>} Updated order
   */
  async update(updateData) {
    if (database.type === 'mongodb') {
      const updated = await MongoOrder.findByIdAndUpdate(
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
        
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const query = `UPDATE orders SET ${setClause}, updatedAt = datetime('now') WHERE id = ?`;
        
        db.run(query, [...values, this.id], function(err) {
          if (err) {
            reject(err);
          } else {
            Object.assign(this, updateData);
            this.updatedAt = new Date().toISOString();
            resolve(this);
          }
        });
      });
    }
  }

  /**
   * Delete order
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete() {
    if (database.type === 'mongodb') {
      await MongoOrder.findByIdAndDelete(this.id);
      return true;
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const query = 'DELETE FROM orders WHERE id = ?';
        
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
   * Get orders by status
   * @param {string} status - Order status
   * @returns {Promise<Order[]>} Array of orders
   */
  static async findByStatus(status) {
    const result = await Order.findAll({ status });
    return result.orders;
  }

  /**
   * Get pending orders
   * @returns {Promise<Order[]>} Array of pending orders
   */
  static async getPending() {
    return await Order.findByStatus('Pending');
  }

  /**
   * Get in progress orders
   * @returns {Promise<Order[]>} Array of in progress orders
   */
  static async getInProgress() {
    return await Order.findByStatus('In Progress');
  }

  /**
   * Get completed orders
   * @returns {Promise<Order[]>} Array of completed orders
   */
  static async getCompleted() {
    return await Order.findByStatus('Completed');
  }

  /**
   * Get daily statistics
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object>} Daily statistics
   */
  static async getDailyStats(date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    if (database.type === 'mongodb') {
      const stats = await MongoOrder.aggregate([
        {
          $match: {
            timestamp: {
              $gte: startDate,
              $lt: endDate
            }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
            },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
            },
            inProgressOrders: {
              $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
            },
            activeTables: { $addToSet: '$tableNumber' }
          }
        },
        {
          $project: {
            _id: 0,
            totalOrders: 1,
            completedOrders: 1,
            pendingOrders: 1,
            inProgressOrders: 1,
            activeTableCount: { $size: '$activeTables' }
          }
        }
      ]);

      return stats[0] || {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        inProgressOrders: 0,
        activeTableCount: 0
      };
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const queries = {
          total: 'SELECT COUNT(*) as count FROM orders WHERE date(timestamp) = date(?)',
          completed: 'SELECT COUNT(*) as count FROM orders WHERE date(timestamp) = date(?) AND status = "Completed"',
          pending: 'SELECT COUNT(*) as count FROM orders WHERE date(timestamp) = date(?) AND status = "Pending"',
          inProgress: 'SELECT COUNT(*) as count FROM orders WHERE date(timestamp) = date(?) AND status = "In Progress"',
          activeTables: 'SELECT COUNT(DISTINCT tableNumber) as count FROM orders WHERE date(timestamp) = date(?)'
        };

        const results = {};
        let completed = 0;
        const total = Object.keys(queries).length;

        Object.entries(queries).forEach(([key, query]) => {
          db.get(query, [date], (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            results[key] = row.count;
            completed++;
            
            if (completed === total) {
              resolve({
                totalOrders: results.total,
                completedOrders: results.completed,
                pendingOrders: results.pending,
                inProgressOrders: results.inProgress,
                activeTableCount: results.activeTables
              });
            }
          });
        });
      });
    }
  }

  /**
   * Get most popular menu items
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Array>} Array of popular menu items
   */
  static async getPopularItems(startDate, endDate) {
    if (database.type === 'mongodb') {
      return await MongoOrder.aggregate([
        {
          $match: {
            timestamp: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            },
            status: 'Completed'
          }
        },
        {
          $group: {
            _id: '$menu',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            _id: 0,
            menu: '$_id',
            count: 1
          }
        }
      ]);
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const query = `
          SELECT menu, COUNT(*) as count
          FROM orders
          WHERE date(timestamp) >= date(?) AND date(timestamp) <= date(?) AND status = 'Completed'
          GROUP BY menu
          ORDER BY count DESC
          LIMIT 10
        `;
        
        db.all(query, [startDate, endDate], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  }

  /**
   * Convert to JSON
   * @returns {Object} Order object
   */
  toJSON() {
    return {
      id: this.id,
      tableNumber: this.tableNumber,
      menu: this.menu,
      note: this.note,
      status: this.status,
      timestamp: this.timestamp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Order;