const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

function buildConfig(prefix, fallbackDatabase) {
  const databaseUrl = process.env[`${prefix}_DATABASE_URL`]

  if (databaseUrl) {
    return {
      url: databaseUrl,
      dialect: 'postgres',
      logging: false,
    }
  }

  return {
    database: process.env[`${prefix}_DB_NAME`] || fallbackDatabase,
    username: process.env[`${prefix}_DB_USER`] || 'postgres',
    password: process.env[`${prefix}_DB_PASSWORD`] || '',
    host: process.env[`${prefix}_DB_HOST`] || 'localhost',
    port: Number(process.env[`${prefix}_DB_PORT`] || 5432),
    dialect: 'postgres',
    logging: false,
  }
}

module.exports = {
  development: buildConfig('DEV', 'banking_app'),
  test: buildConfig('TEST', 'banking_app_test'),
  production: process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        dialect: 'postgres',
        logging: false,
      }
    : buildConfig('PROD', process.env.DB_NAME || 'banking_app'),
}