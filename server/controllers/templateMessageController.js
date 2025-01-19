import { TemplateMessageModel } from '../models/index.js';

export const getAllTemplates = async (req, res) => {
  try {
    const templates = await TemplateMessageModel.findAll({
      search: req.query.search
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const template = await TemplateMessageModel.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 