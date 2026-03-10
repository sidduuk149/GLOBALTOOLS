const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Custom endpoint for images with spaces in filenames (images stored in /images folder)
app.get('/images/:imageName', (req, res) => {
  const imageName = decodeURIComponent(req.params.imageName);
  const imagePath = path.join(__dirname, 'images', imageName);

  if (!imagePath.startsWith(path.join(__dirname, 'images'))) {
    return res.status(403).send('Forbidden');
  }

  if (!fs.existsSync(imagePath)) {
    return res.status(404).send('Image not found');
  }

  res.sendFile(imagePath);
});

const products = [
  { id: 1, category: 'Cutting Tools', image: '/images/CUTTING%20TOOLS.jpg', materials: ['Solid Carbide', 'HSS', 'Brazed'] },
  { id: 2, category: 'Taps', image: '/images/TAPS.jpeg', materials: ['Solid Carbide', 'HSS', 'Brazed'] },
  { id: 3, category: 'Thread Mill', image: '/images/THREAD%20MILL.jpg', materials: ['Solid Carbide', 'HSS', 'Brazed'] },
  { id: 4, category: 'Thread Insert', image: '/images/THREAD%20INSERT.jpg', materials: ['Solid Carbide', 'HSS', 'Brazed'] },
  { id: 5, category: 'Inserts for CNC VMC HMC GPM & SPM', image: '/images/INSERT%20FOR%20CNC.jpg', materials: ['Solid Carbide', 'HSS', 'Brazed'] },
  { id: 6, category: 'End Mill Drills & Form Cutters', image: '/images/END%20MILL.jpg', materials: ['Solid Carbide', 'HSS', 'Brazed'] }
];

app.get('/api/products', (req, res) => {
  res.json({ success: true, data: products });
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const entry = {
    name,
    email,
    phone,
    message,
    createdAt: new Date().toISOString()
  };

  const filePath = path.join(__dirname, 'contact-requests.json');
  let list = [];

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      list = JSON.parse(content || '[]');
    }
    list.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
  } catch (error) {
    console.error('Error writing contact request:', error);
    return res.status(500).json({ success: false, error: 'Could not save request.' });
  }

  console.log('New contact request:', entry);
  res.json({ success: true, message: 'Request received.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});