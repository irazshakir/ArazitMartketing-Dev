// server/services/whatsappService.js
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs'; // For handling file streams
import logger from '../utils/logger.js';
import path from 'path';

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

// Upload media to WhatsApp API
export const uploadMedia = async (filePath, mimeType) => {
  try {
    logger.info(`📤 Uploading media file`, { filePath, mimeType });
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_NUMBER_ID}/media`;
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('type', mimeType);

    const response = await axios.post(url, formData, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'multipart/form-data',
      }
    });

    logger.info(`✅ Media uploaded successfully`, { mediaId: response.data.id });
    return response.data.id;
  } catch (error) {
    logger.error(`❌ Error uploading media: ${error.message}`, { error });
    throw error;
  }
};

// Send media message (document or audio)
export const sendMediaMessage = async (recipient, mediaId, mediaType) => {
  try {
    logger.info(`📤 Sending ${mediaType} message`, { recipient, mediaId });
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_NUMBER_ID}/messages`;
    
    const response = await axios.post(url, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: mediaType,
      [mediaType]: { id: mediaId }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      }
    });

    logger.info(`✅ Media message sent successfully`, { 
      recipient, 
      messageId: response.data.messages?.[0]?.id 
    });
    return response.data;
  } catch (error) {
    logger.error(`❌ Error sending media message: ${error.message}`, { error });
    throw error;
  }
};

export const getMediaUrl = async (mediaId) => {
  try {
    logger.info(`🔍 Fetching media URL`, { mediaId });
    const url = `${WHATSAPP_API_URL}/${mediaId}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      }
    });

    logger.info(`✅ Media URL fetched successfully`);
    return response.data.url;
  } catch (error) {
    logger.error(`❌ Error fetching media URL: ${error.message}`, { error });
    throw error;
  }
};

// Add this function to download and store files locally
const downloadAndStoreMedia = async (mediaUrl, filename) => {
  try {
    const response = await axios({
      method: 'GET',
      url: mediaUrl,
      responseType: 'stream',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
      }
    });

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  } catch (error) {
    logger.error(`❌ Error downloading media: ${error.message}`, { error });
    throw error;
  }
};

