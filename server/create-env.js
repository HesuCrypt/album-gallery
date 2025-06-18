const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function createEnv() {
  try {
    const password = 'fia200422';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const envContent = `# Server Configuration
PORT=3001

# JWT Configuration
JWT_SECRET=albumfia-secret-key-2024

# Admin Credentials
ADMIN_USERNAME=albumfia
ADMIN_PASSWORD_HASH=${hash}`;

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    console.log('Created .env file with credentials:');
    console.log('Username: albumfia');
    console.log('Password: fia200422');
  } catch (error) {
    console.error('Error creating .env file:', error);
  }
}

createEnv(); 