import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';


const protect = async (req, res, next) => {
    const {authorization } = req.headers
    
    if(!authorization){
        return res.status(500).json({error: 'Authorization token required'})
    }
    
    const token  = authorization.split(' ')[1]
    
    try {
        const {_id} = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = await User.findOne({_id}).select('_id')
        next()
    } catch (error) {
        console.log(error);
        res.status(400).send("Invalid Token");
    }
}

export default protect

