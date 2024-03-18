import mongoose from 'mongoose';

const userCollection = 'User'

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
});

const User = mongoose.model(userCollection, userSchema);

export default User