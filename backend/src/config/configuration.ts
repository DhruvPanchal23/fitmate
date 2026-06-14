export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fitmate?schema=public',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fitmate-secret-key-change-in-production-12345',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});
