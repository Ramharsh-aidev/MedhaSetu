const bcrypt= require("bcryptjs")
const jwt= require("jsonwebtoken")
const {User}= require("../db/models/User.js")

// make a token for a user id
 const makeToken= (userId) => 
    jwt.sign({id:userId}, process.env.JWT_SECRET, {expiresIn:"7d"});

// post /api/auth/register
// sign controller

exports.register= async (req , res , next) => {
    try {
        const {
            name, 
            email, 
            password, 
            role, 
            phone,
            specialization,
            registration_number,
            experience_years,
            qualification,
            pharmacy_name,
            pharmacy_address
        }= req.body;

        if (!name || !email || !password)
            return res.status(400).json({success: false, message: "All fields are required"});

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({success: false, message: "Email already in use" });

        if (phone) {
            const phoneExists = await User.findOne({ phone });
            if (phoneExists) return res.status(400).json({success: false, message: "Phone number already in use" });
        }

        if (registration_number) {
            const regExists = await User.findOne({ registration_number });
            if (regExists) return res.status(400).json({success: false, message: "Registration number already in use" });
        }

        const hashed = await bcrypt.hash(password, 10);
        
        // Prepare user data
        const userData = { 
            name, 
            email, 
            password: hashed, 
            role: role || 'patient' 
        };

        // Add optional fields if provided
        if (phone) userData.phone = phone;
        if (specialization) userData.specialization = specialization;
        if (registration_number) userData.registration_number = registration_number;
        if (experience_years) userData.experience_years = experience_years;
        if (qualification) userData.qualification = qualification;
        if (pharmacy_name) userData.pharmacy_name = pharmacy_name;
        if (pharmacy_address) userData.pharmacy_address = pharmacy_address;

        const user = await User.create(userData);

        const token = makeToken(user._id);
        res.status(201).json({
            success: true,
            message: "Registered successfully",
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                phone: user.phone, 
                role: user.role,
                specialization: user.specialization,
                registration_number: user.registration_number,
                experience_years: user.experience_years,
                qualification: user.qualification,
                pharmacy_name: user.pharmacy_name,
                pharmacy_address: user.pharmacy_address
            }
        });
    } catch (err) {
        next(err);  
    }
};


//POST /api/auth/login
// Login Controller

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({success: false, message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({success: false, message: "Invalid email or password" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({success: false, message: "Invalid credentials" });

        const token = makeToken(user._id);
        res.json({
            success: true,
            message: "Logged in successfully",
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                phone: user.phone,
                role: user.role,
                specialization: user.specialization,
                registration_number: user.registration_number,
                experience_years: user.experience_years,
                qualification: user.qualification,
                pharmacy_name: user.pharmacy_name,
                pharmacy_address: user.pharmacy_address
            }
        });
    } catch (err) {
        next(err)
    }
};


// GET /api/auth/me (need login)

exports.me = async (req, res) => {
  res.json({ user: req.user }); // req.user comes from auth middleware
};