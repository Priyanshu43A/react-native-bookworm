import mongoose from 'mongoose';

// Connect to MongoDB
const connectToDb = async () => {
try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected:', conn.connection.host);
} catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
}
}

export default connectToDb;