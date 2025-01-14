import ngrok from 'ngrok';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startNgrok() {
  try {
    const url = await ngrok.connect({
      addr: PORT,
      authtoken: process.env.NGROK_AUTH_TOKEN // You'll need to add this to your .env file
    });
    console.log('Ngrok tunnel is active:');
    console.log('Public URL:', url);
    console.log('Webhook URL:', `${url}/api/webhook/messages`);
  } catch (error) {
    console.error('Error starting ngrok:', error);
    process.exit(1);
  }
}

startNgrok(); 