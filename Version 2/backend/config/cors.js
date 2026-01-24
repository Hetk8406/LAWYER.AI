const corsOptions = {
  origin: ['http://localhost:3010', 'http://localhost:5010'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 24 * 60 * 60 // 24 hours
};

module.exports = corsOptions;