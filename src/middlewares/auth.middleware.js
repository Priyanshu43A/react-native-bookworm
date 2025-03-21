import express from 'express'; 
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {
    try {
        //get the token
        const token = req.header('Authorization').replace('Bearer ', '');
        if(!token) {
            return res.status(401).json({error: 'You must be logged in to access this route!'});
        }
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user
        const user = await User.findById(decoded.id).select('-password');
        if(!user) {
            return res.status(404).json({error: 'User not found!'});
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({error: error.message || 'Internal server error!'});
        console.error(error);      
    }
}

export default protectRoute;  
