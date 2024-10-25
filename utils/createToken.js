import jwt from 'jsonwebtoken';

const createToken = (userId) => {
    return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
        expiresIn: '24h', 
    });
};

export default createToken;