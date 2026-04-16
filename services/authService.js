const bcrypt = require('bcrypt');
const { User, Customer } = require('../database/models');
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
    customerType, pan, aadhaar
) => {

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {

        console.log("User exists → checking role entity...");

        if (role === 'customer') {
            let c = await Customer.findOne({ where: { user_id: existingUser.id } });

            if (!c) {
                await Customer.create({
                    user_id: existingUser.id,
                    customer_type: customerType || 'individual',
                    pan_number: pan || 'ABCDE1234F',
                    adhaar_number: aadhaar || '123456789012'
                });
                console.log("Customer created!");
            }
        }

        else if (role === 'loan_officer') {
            let l = await LoanOfficer.findOne({ where: { user_id: existingUser.id } });

            if (!l) {
                await LoanOfficer.create({
                    user_id: existingUser.id
                });
                console.log("Loan Officer created!");
            }
        }

        else if (role === 'investor') {
            let i = await Investor.findOne({ where: { user_id: existingUser.id } });

            if (!i) {
                await Investor.create({
                    user_id: existingUser.id
                });
                console.log("Investor created!");
            }
        }

        return existingUser;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // CREATE USER
    const user = await User.create({
        fname,
        lname,
        email,
        password_hash,
        phone,
        role
    });
    console.log("User created:", user.id);

    if (role === 'customer') {
        await Customer.create({
            user_id: user.id,
            customer_type: customerType || 'individual',
            pan_number: pan || 'ABCDE1234F',
            adhaar_number: aadhaar || '123456789012'
        });

        console.log("Customer created!");
    } else if (role === 'loan_officer') {
        await LoanOfficer.create({ user_id: user.id });
    }
    else if (role === 'investor') {
        await Investor.create({ user_id: user.id });
    }

    return user; // return full user
};