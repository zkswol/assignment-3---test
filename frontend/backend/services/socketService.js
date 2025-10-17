const { Server } = require('socket.io');
const aiService = require('./aiService');

class SocketService {
  constructor(server) {
    this.io = new Server(server, { cors: { origin: '*' } });
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('tts:request', async (payload) => {
        try {
          const result = await aiService.synthesizeSpeech(payload?.text);
          socket.emit('tts:response', result);
        } catch (error) {
          console.error('TTS Error:', error);
          socket.emit('tts:response', { 
            ok: false, 
            error: 'Failed to synthesize speech' 
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  getIO() {
    return this.io;
  }
}

module.exports = SocketService;
