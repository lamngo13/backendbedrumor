const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SECRET || 'default-secret-key';

// Middleware
app.use(express.json());

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const dataFile = path.join(uploadsDir, 'texts.json');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({ texts: [] }));
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to check secret
const checkSecret = (req, res, next) => {
  const providedSecret = req.headers['x-secret'] || req.query.secret || req.body.secret;
  
  if (providedSecret === SECRET) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid or missing secret' });
  }
};

// Helper functions for text storage
const readTexts = () => {
  const data = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(data);
};

const writeTexts = (data) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

// PUBLIC ROUTES - No authentication required

// Get all text entities
app.get('/api/texts', (req, res) => {
  try {
    const data = readTexts();
    res.json(data.texts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve texts' });
  }
});

// Get a specific text entity by ID
app.get('/api/texts/:id', (req, res) => {
  try {
    const data = readTexts();
    const text = data.texts.find(t => t.id === req.params.id);
    
    if (text) {
      res.json(text);
    } else {
      res.status(404).json({ error: 'Text not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve text' });
  }
});

// Get all images (list)
app.get('/api/images', (req, res) => {
  try {
    const files = fs.readdirSync(imagesDir);
    const images = files.map(file => ({
      filename: file,
      url: `/api/images/${file}`
    }));
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve images' });
  }
});

// Get a specific image
app.get('/api/images/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filepath = path.join(imagesDir, filename);
    
    // Ensure the resolved path is within the images directory
    if (!filepath.startsWith(imagesDir)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
});

// PROTECTED ROUTES - Require secret authentication

// Upload a new image
app.post('/api/images', checkSecret, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    res.status(201).json({
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      url: `/api/images/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete an image
app.delete('/api/images/:filename', checkSecret, (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filepath = path.join(imagesDir, filename);
    
    // Ensure the resolved path is within the images directory
    if (!filepath.startsWith(imagesDir)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Create a new text entity
app.post('/api/texts', checkSecret, (req, res) => {
  try {
    const { content, title } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const data = readTexts();
    const newText = {
      id: crypto.randomUUID(),
      title: title || 'Untitled',
      content: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.texts.push(newText);
    writeTexts(data);
    
    res.status(201).json(newText);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create text' });
  }
});

// Update a text entity
app.put('/api/texts/:id', checkSecret, (req, res) => {
  try {
    const { content, title } = req.body;
    const data = readTexts();
    const textIndex = data.texts.findIndex(t => t.id === req.params.id);
    
    if (textIndex === -1) {
      return res.status(404).json({ error: 'Text not found' });
    }
    
    if (title !== undefined) {
      data.texts[textIndex].title = title;
    }
    if (content !== undefined) {
      data.texts[textIndex].content = content;
    }
    data.texts[textIndex].updatedAt = new Date().toISOString();
    
    writeTexts(data);
    res.json(data.texts[textIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update text' });
  }
});

// Delete a text entity
app.delete('/api/texts/:id', checkSecret, (req, res) => {
  try {
    const data = readTexts();
    const textIndex = data.texts.findIndex(t => t.id === req.params.id);
    
    if (textIndex === -1) {
      return res.status(404).json({ error: 'Text not found' });
    }
    
    data.texts.splice(textIndex, 1);
    writeTexts(data);
    
    res.json({ message: 'Text deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete text' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API for image and text storage',
    endpoints: {
      public: {
        'GET /api/texts': 'Get all text entities',
        'GET /api/texts/:id': 'Get a specific text entity',
        'GET /api/images': 'Get all images (list)',
        'GET /api/images/:filename': 'Get a specific image'
      },
      protected: {
        'POST /api/images': 'Upload a new image (requires secret)',
        'DELETE /api/images/:filename': 'Delete an image (requires secret)',
        'POST /api/texts': 'Create a new text entity (requires secret)',
        'PUT /api/texts/:id': 'Update a text entity (requires secret)',
        'DELETE /api/texts/:id': 'Delete a text entity (requires secret)'
      },
      authentication: 'Include secret in header as "x-secret", query parameter "secret", or body "secret"'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
