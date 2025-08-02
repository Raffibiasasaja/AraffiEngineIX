const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');

/**
 * User Model
 * Supports both MongoDB (Mongoose) and SQLite operations
 */

// MongoDB Schema
const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['customer', 'admin', 'owner'],
    default: 'customer'
  }
}, {
  timestamps: true,
  _id: false
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const MongoUser = mongoose.model('User', userSchema);

/**
 * User class for handling both MongoDB and SQLite operations
 */
class User {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.username = data.username;
    this.password = data.password;
    this.role = data.role || 'customer';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<User>} Created user
   */
  static async create(userData) {
    if (database.type === 'mongodb') {
      const user = new MongoUser({
        _id: uuidv4(),
        ...userData
      });
      await user.save();
      return user;
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const user = new User(userData);
        const hashedPassword = bcrypt.hashSync(user.password, 12);
        
        const query = `
          INSERT INTO users (id, username, password, role, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `;
        
        db.run(query, [user.id, user.username, hashedPassword, user.role], function(err) {
          if (err) {
            reject(err);
          } else {
            user.password = hashedPassword;
            user.createdAt = new Date().toISOString();
            user.updatedAt = new Date().toISOString();
            resolve(user);
          }
        });
      });
    }
  }

  /**
   * Find user by username
   * @param {string} username - Username to search for
   * @returns {Promise<User|null>} Found user or null
   */
  static async findByUsername(username) {
    if (database.type === 'mongodb') {
      return await MongoUser.findOne({ username });
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const query = 'SELECT * FROM users WHERE username = ?';
        
        db.get(query, [username], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(new User(row));
          } else {
            resolve(null);
          }
        });
      });
    }
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<User|null>} Found user or null
   */
  static async findById(id) {
    if (database.type === 'mongodb') {
      return await MongoUser.findById(id);
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const query = 'SELECT * FROM users WHERE id = ?';
        
        db.get(query, [id], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(new User(row));
          } else {
            resolve(null);
          }
        });
      });
    }
  }

  /**
   * Get all users
   * @returns {Promise<User[]>} Array of users
   */
  static async findAll() {
    if (database.type === 'mongodb') {
      return await MongoUser.find({}).select('-password');
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const query = 'SELECT id, username, role, createdAt, updatedAt FROM users';
        
        db.all(query, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const users = rows.map(row => new User(row));
            resolve(users);
          }
        });
      });
    }
  }

  /**
   * Compare password
   * @param {string} candidatePassword - Password to compare
   * @returns {Promise<boolean>} True if password matches
   */
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Update user
   * @param {Object} updateData - Data to update
   * @returns {Promise<User>} Updated user
   */
  async update(updateData) {
    if (database.type === 'mongodb') {
      const updated = await MongoUser.findByIdAndUpdate(
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
        
        if (updateData.password) {
          updateData.password = bcrypt.hashSync(updateData.password, 12);
        }
        
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const query = `UPDATE users SET ${setClause}, updatedAt = datetime('now') WHERE id = ?`;
        
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
   * Delete user
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete() {
    if (database.type === 'mongodb') {
      await MongoUser.findByIdAndDelete(this.id);
      return true;
    } else {
      return new Promise((resolve, reject) => {
        const db = database.getInstance();
        const query = 'DELETE FROM users WHERE id = ?';
        
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
   * Convert to JSON (exclude password)
   * @returns {Object} User object without password
   */
  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }
}

module.exports = User;