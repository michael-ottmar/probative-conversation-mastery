#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Setting up database...\n');

// Check if environment variables are set
const requiredEnvVars = ['POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease add these to your .env.local file from your Supabase dashboard.');
  console.error('See ENVIRONMENT_SETUP.md for detailed instructions.\n');
  process.exit(1);
}

try {
  console.log('1️⃣  Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n2️⃣  Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('\n✅ Database setup complete!');
  console.log('You can now test authentication at http://localhost:3000\n');
} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  process.exit(1);
}