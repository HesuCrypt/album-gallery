const bcrypt = require('bcryptjs');

const password = 'fia200422';
bcrypt.hash(password, 10).then(hash => {
  console.log('Password hash for fia200422:');
  console.log(hash);
}); 