import { CannedMessageModel } from '../models/CannedMessageModel.js';

export const getAllCannedMessages = async (req, res) => {
  try {
    const messages = await CannedMessageModel.findAll();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCannedMessageById = async (req, res) => {
  try {
    const message = await CannedMessageModel.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Canned message not found' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 