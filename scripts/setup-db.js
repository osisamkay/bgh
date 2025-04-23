// This script sets up the database by running Prisma migrations
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to check if .env file exists
function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath) && !fs.existsSync(envLocalPath)) {
    console.error('Error: No .env or .env.local file found. Please create one with your database connection string.');
    console.log('Example: DATABASE_URL="postgresql://username:password@localhost:5432/database_name"');
    process.exit(1);
  }
}

// Function to run database migrations
function runMigrations() {
  try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Error running migrations:', error.message);
    process.exit(1);
  }
}

// Function to generate Prisma client
function generatePrismaClient() {
  try {
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma client generated successfully.');
  } catch (error) {
    console.error('Error generating Prisma client:', error.message);
    process.exit(1);
  }
}

// Main function
function setupDatabase() {
  console.log('Starting database setup...');
  
  // Check if .env file exists
  checkEnvFile();
  
  // Run migrations
  runMigrations();
  
  // Generate Prisma client
  generatePrismaClient();
  
  console.log('Database setup completed successfully!');
}

// Run the setup
setupDatabase();