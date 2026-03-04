const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'banking_app',
    password: 'yourpassword',
    port: 5432
});

module.exports = pool;