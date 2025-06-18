const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function generateEnv() {
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
ADMIN_PASSWORD_HASH=${hash}

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_BUCKET_NAME=your-bucket-name`;

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    console.log('Generated .env file with new password hash');
    console.log('Username: albumfia');
    console.log('Password: fia200422');
  } catch (error) {
    console.error('Error generating .env file:', error);
  }
}

generateEnv(); 