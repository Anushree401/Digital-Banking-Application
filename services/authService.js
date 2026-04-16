const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User, Customer, LoanOfficer, Investor } = require('../database/models');
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

exports.register = async (
    fname, lname, email, password, phone, role,
    customerType, pan, aadhaar, options = {}
) => {
    const { isGoogleAuth = false } = options;
    const normalizedRole = role === 'officer' ? 'loan_officer' : role;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
        const err = new Error('User already exists');
        err.code = 'USER_EXISTS';
        throw err;
    }

    if (!isGoogleAuth && !password) {
        throw new Error('Password is required');
    }

    const rawPassword = isGoogleAuth
        ? crypto.randomBytes(24).toString('hex')
        : String(password);

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(rawPassword, salt);

    // CREATE USER
    const user = await User.create({
        fname,
        lname,
        email,
        password_hash,
        phone,
        role: normalizedRole
    });
    console.log("User created:", user.id);

    if (normalizedRole === 'customer') {
        await Customer.create({
            user_id: user.id,
            customer_type: customerType || 'individual',
            pan_number: pan || 'ABCDE1234F',
            adhaar_number: aadhaar || '123456789012'
        });

        console.log("Customer created!");
    } else if (normalizedRole === 'loan_officer') {
        await LoanOfficer.create({
            user_id: user.id,
            employee_id: `LO-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        });
    }
    else if (normalizedRole === 'investor') {
        await Investor.create({
            user_id: user.id,
            risk_profile: 'moderate'
        });
    }

    return user; // return full user
};