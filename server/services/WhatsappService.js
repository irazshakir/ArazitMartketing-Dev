// server/services/whatsappService.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { WHATSAPP_API_URL, WHATSAPP_NUMBER_ID, WHATSAPP_ACCESS_TOKEN } = process.env;

// Helper function to send a message
export const sendMessage = async (recipient, text) => {
  try {
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_NUMBER_ID}/messages`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    };

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: { 
        body: text 
      }
    };

    const response = await axios.post(url, payload, { headers });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Helper function to delete a message
export const deleteMessage = async (messageId) => {
  const url = `${WHATSAPP_API_URL}/${WHATSAPP_NUMBER_ID}/messages/${messageId}`;
  const headers = {
    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
  };

  const response = await axios.delete(url, { headers });
  return response.data;
};


