const { User } = require('../database/models');
const bcrypt = require('bcrypt');

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