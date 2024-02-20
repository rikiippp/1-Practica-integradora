import mongoose from 'mongoose';

const messageCollection = 'messages';

const messageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true }
});


const Message = mongoose.model(messageCollection, messageSchema);

export default Message;