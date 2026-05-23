const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Data helpers
const readData = (file) => {
  const filePath = path.join(__dirname, 'data', file);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeData = (file, data) => {
  const filePath = path.join(__dirname, 'data', file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// ===================== VEHICLE ROUTES =====================

// GET all vehicles (with filtering, sorting, pagination)
app.get('/api/vehicles', (req, res) => {
  try {
    let vehicles = readData('vehicles.json');
    const { brand, minPrice, maxPrice, year, fuelType, transmission, condition, search, sort, page = 1, limit = 12, featured } = req.query;

    // Filtering
    if (brand) vehicles = vehicles.filter(v => v.brand.toLowerCase() === brand.toLowerCase());
    if (fuelType) vehicles = vehicles.filter(v => v.fuelType.toLowerCase() === fuelType.toLowerCase());
    if (transmission) vehicles = vehicles.filter(v => v.transmission.toLowerCase() === transmission.toLowerCase());
    if (condition) vehicles = vehicles.filter(v => v.condition.toLowerCase() === condition.toLowerCase());
    if (year) vehicles = vehicles.filter(v => v.year === parseInt(year));
    if (minPrice) vehicles = vehicles.filter(v => v.price >= parseInt(minPrice));
    if (maxPrice) vehicles = vehicles.filter(v => v.price <= parseInt(maxPrice));
    if (featured === 'true') vehicles = vehicles.filter(v => v.featured);
    if (search) {
      const q = search.toLowerCase();
      vehicles = vehicles.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sort === 'price_asc') vehicles.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') vehicles.sort((a, b) => b.price - a.price);
    else if (sort === 'year_desc') vehicles.sort((a, b) => b.year - a.year);
    else if (sort === 'views') vehicles.sort((a, b) => (b.views || 0) - (a.views || 0));
    else vehicles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = vehicles.length;
    const totalPages = Math.ceil(total / parseInt(limit));
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginated = vehicles.slice(start, start + parseInt(limit));

    res.json({ vehicles: paginated, total, totalPages, currentPage: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single vehicle
app.get('/api/vehicles/:id', (req, res) => {
  try {
    const vehicles = readData('vehicles.json');
    const vehicle = vehicles.find(v => v.id === req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    // Increment views
    vehicle.views = (vehicle.views || 0) + 1;
    writeData('vehicles.json', vehicles);

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create vehicle (admin)
app.post('/api/vehicles', (req, res) => {
  try {
    const vehicles = readData('vehicles.json');
    const newVehicle = {
      id: 'v' + Date.now(),
      ...req.body,
      views: 0,
      createdAt: new Date().toISOString()
    };
    vehicles.push(newVehicle);
    writeData('vehicles.json', vehicles);
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update vehicle (admin)
app.put('/api/vehicles/:id', (req, res) => {
  try {
    const vehicles = readData('vehicles.json');
    const idx = vehicles.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Vehicle not found' });
    vehicles[idx] = { ...vehicles[idx], ...req.body };
    writeData('vehicles.json', vehicles);
    res.json(vehicles[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE vehicle (admin)
app.delete('/api/vehicles/:id', (req, res) => {
  try {
    let vehicles = readData('vehicles.json');
    vehicles = vehicles.filter(v => v.id !== req.params.id);
    writeData('vehicles.json', vehicles);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== BOOKING ROUTES =====================

app.post('/api/bookings', (req, res) => {
  try {
    const bookings = readData('bookings.json');
    const booking = {
      id: 'b' + Date.now(),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    bookings.push(booking);
    writeData('bookings.json', bookings);
    res.status(201).json({ success: true, bookingId: booking.id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/bookings', (req, res) => {
  const bookings = readData('bookings.json');
  res.json(bookings);
});

// ===================== TESTIMONIALS ROUTES =====================

app.get('/api/testimonials', (req, res) => {
  const testimonials = readData('testimonials.json');
  res.json(testimonials);
});

// ===================== STATS ROUTE =====================

app.get('/api/stats', (req, res) => {
  const vehicles = readData('vehicles.json');
  const bookings = readData('bookings.json');
  res.json({
    totalVehicles: vehicles.length,
    carsAvailable: vehicles.length,
    happyClients: 247,
    yearsFounded: new Date().getFullYear() - 2018,
    bookings: bookings.length
  });
});

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/index.html')));
app.get('/inventory', (req, res) => res.sendFile(path.join(__dirname, '../client/inventory.html')));
app.get('/details', (req, res) => res.sendFile(path.join(__dirname, '../client/details.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, '../client/about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '../client/contact.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../client/admin.html')));

app.listen(PORT, () => console.log(`Manga Autos server running on http://localhost:${PORT}`));
