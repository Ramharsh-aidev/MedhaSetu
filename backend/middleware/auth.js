const jwt = require("jsonwebtoken");
const {User} = require("../db/models/User");

module.exports= async function (req, res, next){
    const header= req.header("Authorization"); //looks like "Bearer <token>"
    const token= header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({success: false, message:"No token. Unauthorized."});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user details from database
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({success: false, message: "User not found"});
        }

        req.user = user;
        next();
    } catch (err){
        return res.status(401).json({success: false, message: "Token invalid" });
    }
};