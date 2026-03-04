const { User } = require('../database/models');
const bcrypt = require('bcrypt');
// const { Pool } = require('pg');

exports.login = async (email, password) => {

    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    return user;

}

exports.register = async (fname, lname, email, password, phone, role) => {

    // check if user email exitst
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
        throw new Error('Email already exists');
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
        fname,
        lname,
        email,
        password_hash,
        phone,
        role
    });

    // const pool = new Pool({
    //     user: 'postgres',
    //     host: 'localhost',
    //     database: 'test_db',
    //     password: 'postgres',
    //     port: 5432
    // });

    // const client = await pool.connect();

    // try {   
    //     const query = 'INSERT INTO users (fname, lname, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5, $6)';
    //     const values = [fname, lname, email, password_hash, phone, role];
    //     await client.query(query, values);
    // } catch (err) {
    //     console.error('Error inserting user into database:', err);
    //     throw err;
    // } finally {
    //     client.release();
    // }

    // const userId = await User.findOne({ where: { email } }).then(user => user.user_id);
    const userId = user.user_id;
    return userId;

};