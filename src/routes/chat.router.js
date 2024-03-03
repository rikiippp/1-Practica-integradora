import Router from 'express';
import Message from '../dao/models/chat.model.js';

const router = Router()

router.get('/chat', async (req, res) => {
    try {
        const messages = await Message.find().lean(); // La funcion lean() es para remplazar el .map
        res.render('chat', { favIcon: '/uploads/1708456649794-message.png', titlePage: 'Home | Chat', messages: messages });
    } catch (error) {
        res.status(500).send('Error fetching messages');
    }
});

router.post('/chat', async (req, res) => {
    const { user, message } = req.body;
    try {
        await Message.create({ user, message });
        res.redirect('/chat');
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).send('Error saving message: ' + error.message);
    }
});


export default router;