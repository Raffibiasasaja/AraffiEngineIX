require('dotenv').config();
const database = require('../config/database');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

/**
 * Seed Data Script
 * Populates the database with initial data for development and testing
 */

// Sample users
const sampleUsers = [
  {
    username: 'admin',
    password: 'Admin123',
    role: 'admin'
  },
  {
    username: 'owner',
    password: 'Owner123',
    role: 'owner'
  },
  {
    username: 'customer1',
    password: 'Customer123',
    role: 'customer'
  }
];

// Sample menu items
const sampleMenuItems = [
  {
    name: 'Bakso Urat',
    description: 'Chewy meatballs with rich tendon, served in savory broth',
    price: 15000
  },
  {
    name: 'Bakso Keju',
    description: 'Delicious meatballs filled with melted cheese',
    price: 18000
  },
  {
    name: 'Bakso Ayam',
    description: 'Tender chicken meatballs in clear chicken broth',
    price: 14000
  },
  {
    name: 'Bakso Seafood',
    description: 'Fresh seafood meatballs with shrimp and fish',
    price: 22000
  },
  {
    name: 'Bakso Jumbo',
    description: 'Extra large beef meatballs for hearty appetite',
    price: 20000
  },
  {
    name: 'Bakso Malang',
    description: 'Traditional Malang style meatballs with tofu and vegetables',
    price: 16000
  },
  {
    name: 'Bakso Tahu',
    description: 'Meatballs served with fried tofu and vegetables',
    price: 13000
  },
  {
    name: 'Bakso Telur',
    description: 'Meatballs with quail eggs in rich broth',
    price: 17000
  },
  {
    name: 'Mie Ayam Bakso',
    description: 'Chicken noodles topped with meatballs',
    price: 15000
  },
  {
    name: 'Bakso Bakar',
    description: 'Grilled meatballs with special sauce',
    price: 19000
  }
];

// Sample orders
const sampleOrders = [
  {
    tableNumber: '1',
    menu: 'Bakso Urat',
    note: 'Extra spicy please',
    status: 'Pending'
  },
  {
    tableNumber: '2',
    menu: 'Bakso Keju',
    note: '',
    status: 'In Progress'
  },
  {
    tableNumber: '3',
    menu: 'Bakso Seafood',
    note: 'No onions',
    status: 'Completed'
  },
  {
    tableNumber: '1',
    menu: 'Mie Ayam Bakso',
    note: 'Less salt',
    status: 'Completed'
  },
  {
    tableNumber: '4',
    menu: 'Bakso Jumbo',
    note: 'Extra vegetables',
    status: 'Pending'
  }
];

/**
 * Seed users
 */
async function seedUsers() {
  console.log('🔄 Seeding users...');
  
  for (const userData of sampleUsers) {
    try {
      const existingUser = await User.findByUsername(userData.username);
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.username} (${userData.role})`);
      } else {
        console.log(`⚠️  User ${userData.username} already exists`);
      }
    } catch (error) {
      console.error(`❌ Error creating user ${userData.username}:`, error.message);
    }
  }
}

/**
 * Seed menu items
 */
async function seedMenuItems() {
  console.log('🔄 Seeding menu items...');
  
  for (const itemData of sampleMenuItems) {
    try {
      // Check if item with same name exists
      const existingItems = await MenuItem.findAll();
      const exists = existingItems.find(item => item.name === itemData.name);
      
      if (!exists) {
        await MenuItem.create(itemData);
        console.log(`✅ Created menu item: ${itemData.name} - Rp ${itemData.price.toLocaleString()}`);
      } else {
        console.log(`⚠️  Menu item ${itemData.name} already exists`);
      }
    } catch (error) {
      console.error(`❌ Error creating menu item ${itemData.name}:`, error.message);
    }
  }
}

/**
 * Seed orders
 */
async function seedOrders() {
  console.log('🔄 Seeding orders...');
  
  // Create orders with different timestamps for variety
  for (let i = 0; i < sampleOrders.length; i++) {
    try {
      const orderData = { ...sampleOrders[i] };
      
      // Vary the timestamp for realistic data
      const now = new Date();
      const randomHours = Math.floor(Math.random() * 24);
      const randomMinutes = Math.floor(Math.random() * 60);
      orderData.timestamp = new Date(now.getTime() - (randomHours * 60 * 60 * 1000) - (randomMinutes * 60 * 1000));
      
      await Order.create(orderData);
      console.log(`✅ Created order: Table ${orderData.tableNumber} - ${orderData.menu} (${orderData.status})`);
    } catch (error) {
      console.error(`❌ Error creating order:`, error.message);
    }
  }
}

/**
 * Main seed function
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    await database.connect();
    
    // Seed data in order
    await seedUsers();
    console.log('');
    
    await seedMenuItems();
    console.log('');
    
    await seedOrders();
    console.log('');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Sample credentials:');
    console.log('   Admin:    username: admin,     password: Admin123');
    console.log('   Owner:    username: owner,     password: Owner123');
    console.log('   Customer: username: customer1, password: Customer123');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    console.error(error.stack);
  } finally {
    // Close database connection
    await database.close();
    process.exit(0);
  }
}

/**
 * Clear all data (for testing)
 */
async function clearDatabase() {
  try {
    console.log('🗑️  Clearing database...');
    
    await database.connect();
    
    // Note: This is a simplified clear function
    // In a real app, you might want more sophisticated clearing
    console.log('⚠️  Database clearing not implemented for safety');
    console.log('   Please manually clear the database if needed');
    
  } catch (error) {
    console.error('❌ Database clearing failed:', error.message);
  } finally {
    await database.close();
    process.exit(0);
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'seed') {
  seedDatabase();
} else if (command === 'clear') {
  clearDatabase();
} else {
  console.log('Usage: node seedData.js [seed|clear]');
  console.log('  seed  - Populate database with sample data');
  console.log('  clear - Clear all data from database');
  process.exit(1);
}

module.exports = {
  seedDatabase,
  clearDatabase,
  sampleUsers,
  sampleMenuItems,
  sampleOrders
};