const { connectDB, disconnectDB } = require('./dist/config/database');
const { createUser } = require('./dist/services/userService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Migration script to move users from JSON file to MongoDB
 * 
 * Usage:
 * 1. Ensure MongoDB is running
 * 2. Build the TypeScript code: npm run build
 * 3. Run: node scripts/migrate-users-to-mongodb.js
 */

async function migrateUsers() {
  const usersFile = path.join(__dirname, '../data/users.json');

  try {
    console.log('🔄 Starting user migration from JSON to MongoDB...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();

    // Check if users.json exists
    try {
      await fs.access(usersFile);
    } catch (error) {
      console.log('⚠️  No users.json file found. Nothing to migrate.');
      await disconnectDB();
      return;
    }

    // Read users from JSON file
    console.log('📖 Reading users from JSON file...');
    const data = await fs.readFile(usersFile, 'utf-8');
    const users = JSON.parse(data);

    if (!Array.isArray(users) || users.length === 0) {
      console.log('⚠️  No users found in JSON file.');
      await disconnectDB();
      return;
    }

    console.log(`📊 Found ${users.length} user(s) to migrate\n`);

    // Migrate each user
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        await createUser({
          email: user.email,
          name: user.name,
          googleId: user.googleId,
          picture: user.picture || undefined,
        });
        successCount++;
        console.log(`✅ [${i + 1}/${users.length}] Migrated: ${user.email}`);
      } catch (error) {
        failCount++;
        console.error(`❌ [${i + 1}/${users.length}] Failed: ${user.email}`);
        console.error(`   Reason: ${error.message}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} user(s)`);
    console.log(`   ❌ Failed: ${failCount} user(s)`);
    console.log('='.repeat(50));

    if (successCount > 0) {
      console.log('\n💡 Tip: Consider backing up and removing the users.json file');
      console.log('   as it is no longer needed with MongoDB.');
    }

    // Disconnect from MongoDB
    await disconnectDB();

  } catch (error) {
    console.error('\n❌ Migration failed with error:', error);
    process.exit(1);
  }
}

// Run migration
migrateUsers()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
