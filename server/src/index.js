require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    // Videos
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
    'video/3gpp',
    'video/x-matroska',
    'video/x-flv',
    'video/x-m4v',
    'video/x-mpeg',
    'video/x-mpeg2',
    'video/x-mpeg3',
    'video/x-mpeg4',
    'video/x-ms-asf',
    'video/x-ms-wmv',
    'video/x-ms-wmx',
    'video/x-ms-wvx',
    'video/x-msvideo',
    'video/x-sgi-movie'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    console.log('Accepted file type:', file.mimetype);
    cb(null, true);
  } else {
    console.log('Rejected file type:', file.mimetype);
    cb(new Error(`Invalid file type: ${file.mimetype}. Only images and videos are allowed.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
}).single('file');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', {
    providedUsername: username,
    expectedUsername: process.env.ADMIN_USERNAME,
    providedPassword: password
  });

  try {
    // Simple direct comparison for debugging
    if (username === process.env.ADMIN_USERNAME && password === 'fia200422') {
      const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
      console.log('Login successful, token generated');
      res.json({ token });
    } else {
      console.log('Login failed:', {
        usernameMatch: username === process.env.ADMIN_USERNAME,
        passwordMatch: password === 'fia200422'
      });
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload endpoint
app.post('/api/upload', authenticateToken, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 500MB.' });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      const uploadDate = new Date().toISOString();
      
      console.log('File uploaded successfully:', {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      res.json({
        filename: req.file.filename,
        url: `http://localhost:3001/uploads/${req.file.filename}`,
        type: fileType,
        uploadDate: uploadDate
      });
    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({ error: 'Error processing upload' });
    }
  });
});

// Get all files endpoint
app.get('/api/items', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return res.status(500).json({ error: 'Error reading files' });
    }

    const fileDetails = files.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      const fileType = file.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'video';
      
      return {
        filename: file,
        url: `http://localhost:3001/uploads/${file}`,
        type: fileType,
        uploadDate: stats.birthtime.toISOString()
      };
    });

    res.json(fileDetails);
  });
});

// Update file date
app.patch('/api/items/:filename', authenticateToken, async (req, res) => {
  const { filename } = req.params;
  const { date } = req.body;
  const filePath = path.join(uploadsDir, filename);

  try {
    // Check if file exists using promises
    await fs.promises.access(filePath);
    
    // Create a new date object from the provided date
    const newDate = new Date(date);
    
    // Return the updated file info
    res.json({
      filename,
      url: `http://localhost:3001/uploads/${filename}`,
      type: filename.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'video',
      uploadDate: newDate.toISOString()
    });
  } catch (error) {
    console.error('Error updating file date:', error);
    res.status(500).json({ error: 'Failed to update file date' });
  }
});

// Delete file endpoint
app.delete('/api/items/:filename', authenticateToken, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.status(500).json({ error: 'Error deleting file' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 