const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/admin.routes');
const apiRoutes = require('./routes/api.routes');
const authRoutes = require('./routes/auth.routes');
const errorMiddleware = require('./middleware/error.middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

// Error handling
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
