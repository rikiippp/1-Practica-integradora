import Router from 'express';
import Message from '../dao/models/chat.model.js';

const router = Router()

router.get('/api/chat', async (req, res) => {
    try {
        const messages = await Message.find();
        res.render('chat', { messages });
    } catch (error) {
        res.status(500).send('Error fetching messages');
    }
});

router.post('/api/chat', async (req, res) => {
    const { user, message } = req.body;
    try {
        await Message.create({ user, message });
        res.redirect('/api/chat');
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).send('Error saving message: ' + error.message);
    }
});


export default router;