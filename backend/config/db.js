const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // MongoDB Atlas connection options (compatible with latest Mongoose)
        const options = {
            serverSelectionTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            // Connection pool options for Atlas stability
            maxPoolSize: 10,
            minPoolSize: 2,
            maxIdleTimeMS: 30000,
            heartbeatFrequencyMS: 2000,
        };

        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        
        console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });
        
    } catch (err) {
        console.error("❌ DB connection failed:", err.message);
        
        // Provide helpful error messages for common Atlas issues
        if (err.message.includes('authentication failed')) {
            console.error('💡 Check your MongoDB Atlas username and password');
        }
        if (err.message.includes('network error')) {
            console.error('💡 Check your network connection and MongoDB Atlas network access settings');
        }
        if (err.message.includes('server selection timed out')) {
            console.error('💡 Check your MongoDB Atlas cluster status and whitelist your IP address');
        }
        
        process.exit(1);
    }
};

module.exports = connectDB;