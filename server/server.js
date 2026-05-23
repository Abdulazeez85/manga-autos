const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Simple admin token (set ADMIN_TOKEN env) and helpers
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'devtoken';
function requireAdmin(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function validateVehiclePayload(payload) {
  const errors = [];
  if (!payload) { errors.push('payload required'); return errors; }
  if (!payload.brand || typeof payload.brand !== 'string') errors.push('brand is required');
  if (!payload.model || typeof payload.model !== 'string') errors.push('model is required');
  if (payload.price === undefined || payload.price === null || isNaN(Number(payload.price))) errors.push('price must be a number');
  if (payload.year && isNaN(parseInt(payload.year, 10))) errors.push('year must be a number');
  return errors;
}

function validateBookingPayload(payload) {
  const errors = [];
  if (!payload) { errors.push('payload required'); return errors; }
  if (!payload.name || typeof payload.name !== 'string') errors.push('name is required');
  if (!payload.phone || typeof payload.phone !== 'string') errors.push('phone is required');
  return errors;
}

// Data helpers
const readData = async (file) => {
  const filePath = path.join(__dirname, 'data', file);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    console.error(`Failed to read ${file}:`, err);
    return [];
  }
};

const writeData = async (file, data) => {
  const filePath = path.join(__dirname, 'data', file);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Failed to write ${file}:`, err);
    throw err;
  }
};

// ===================== VEHICLE ROUTES =====================

// GET all vehicles (with filtering, sorting, pagination)
app.get('/api/vehicles', async (req, res) => {
  try {
    let vehicles = await readData('vehicles.json');
    const {
      brand,
      minPrice,
      maxPrice,
      year,
      minYear,
      maxYear,
      fuelType,
      transmission,
      condition,
      search,
      sort,
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const brands = Array.isArray(brand) ? brand : brand ? [brand] : [];
    const conditions = Array.isArray(condition) ? condition : condition ? [condition] : [];
    const fuels = Array.isArray(fuelType) ? fuelType : fuelType ? [fuelType] : [];
    const transmissions = Array.isArray(transmission) ? transmission : transmission ? [transmission] : [];

    if (brands.length) {
      vehicles = vehicles.filter(v => brands.some(b => v.brand.toLowerCase() === b.toLowerCase()));
    }
    if (fuels.length) {
      vehicles = vehicles.filter(v => fuels.some(f => v.fuelType.toLowerCase() === f.toLowerCase()));
    }
    if (transmissions.length) {
      vehicles = vehicles.filter(v => transmissions.some(t => v.transmission.toLowerCase() === t.toLowerCase()));
    }
    if (conditions.length) {
      vehicles = vehicles.filter(v => conditions.some(c => v.condition.toLowerCase() === c.toLowerCase()));
    }
    if (year) vehicles = vehicles.filter(v => v.year === parseInt(year, 10));
    if (minYear) vehicles = vehicles.filter(v => v.year >= parseInt(minYear, 10));
    if (maxYear) vehicles = vehicles.filter(v => v.year <= parseInt(maxYear, 10));
    if (minPrice) vehicles = vehicles.filter(v => v.price >= parseInt(minPrice, 10));
    if (maxPrice) vehicles = vehicles.filter(v => v.price <= parseInt(maxPrice, 10));
    if (featured === 'true') vehicles = vehicles.filter(v => v.featured);
    if (search) {
      const q = search.toLowerCase();
      vehicles = vehicles.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
      );
    }

    if (sort === 'price_asc') vehicles.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') vehicles.sort((a, b) => b.price - a.price);
    else if (sort === 'year_desc') vehicles.sort((a, b) => b.year - a.year);
    else if (sort === 'views') vehicles.sort((a, b) => (b.views || 0) - (a.views || 0));
    else vehicles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, parseInt(limit, 10) || 12);
    const total = vehicles.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (currentPage - 1) * pageSize;
    const paginated = vehicles.slice(start, start + pageSize);

    res.json({ vehicles: paginated, total, totalPages, currentPage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single vehicle
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicles = await readData('vehicles.json');
    const vehicle = vehicles.find(v => v.id === req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create vehicle (admin)
app.post('/api/vehicles', requireAdmin, async (req, res) => {
  try {
    const errors = validateVehiclePayload(req.body);
    if (errors.length) return res.status(400).json({ error: 'Invalid payload', details: errors });
    const vehicles = await readData('vehicles.json');
    const newVehicle = {
      id: 'v' + Date.now(),
      ...req.body,
      views: 0,
      createdAt: new Date().toISOString()
    };
    vehicles.push(newVehicle);
    await writeData('vehicles.json', vehicles);
    res.status(201).json(newVehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update vehicle (admin)
app.put('/api/vehicles/:id', requireAdmin, async (req, res) => {
  try {
    const errors = validateVehiclePayload(req.body);
    if (errors.length) return res.status(400).json({ error: 'Invalid payload', details: errors });
    const vehicles = await readData('vehicles.json');
    const idx = vehicles.findIndex(v => v.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Vehicle not found' });
    vehicles[idx] = { ...vehicles[idx], ...req.body };
    await writeData('vehicles.json', vehicles);
    res.json(vehicles[idx]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE vehicle (admin)
app.delete('/api/vehicles/:id', requireAdmin, async (req, res) => {
  try {
    let vehicles = await readData('vehicles.json');
    vehicles = vehicles.filter(v => v.id !== req.params.id);
    await writeData('vehicles.json', vehicles);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== BOOKING ROUTES =====================

app.post('/api/bookings', async (req, res) => {
  try {
    const errors = validateBookingPayload(req.body);
    if (errors.length) return res.status(400).json({ error: 'Invalid payload', details: errors });
    const bookings = await readData('bookings.json');
    const booking = {
      id: 'b' + Date.now(),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    bookings.push(booking);
    await writeData('bookings.json', bookings);
    res.status(201).json({ success: true, bookingId: booking.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await readData('bookings.json');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== TESTIMONIALS ROUTES =====================

app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await readData('testimonials.json');
    res.json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================== STATS ROUTE =====================

app.get('/api/stats', async (req, res) => {
  try {
    const vehicles = await readData('vehicles.json');
    const bookings = await readData('bookings.json');
    res.json({
      totalVehicles: vehicles.length,
      carsAvailable: vehicles.length,
      happyClients: 247,
      yearsFounded: new Date().getFullYear() - 2018,
      bookings: bookings.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../client/index.html')));
app.get('/inventory', (req, res) => res.sendFile(path.join(__dirname, '../client/inventory.html')));
app.get('/details', (req, res) => res.sendFile(path.join(__dirname, '../client/details.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, '../client/about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '../client/contact.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '../client/admin.html')));

app.listen(PORT, () => console.log(`Manga Autos server running on http://localhost:${PORT}`));
