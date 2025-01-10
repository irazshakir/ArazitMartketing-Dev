import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import UserModel from './UserModel.js';
import LeadNoteModel from './LeadNoteModel.js';

const LeadModel = sequelize.define('leads', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
LeadModel.belongsTo(UserModel, {
  foreignKey: 'created_by',
  as: 'user'
});

LeadModel.hasMany(LeadNoteModel, {
  foreignKey: 'lead_id',
  as: 'notes'
});

// Add these as instance methods instead of static
LeadModel.findNotes = async function(leadId, options = {}) {
  try {
    const notes = await LeadNoteModel.findAll({
      where: { lead_id: leadId },
      include: [
        { model: UserModel, attributes: ['name'] }
      ],
      order: [['created_at', 'DESC']]
    });
    return notes;
  } catch (error) {
    throw error;
  }
};

LeadModel.createNote = async function(noteData) {
  try {
    const note = await LeadNoteModel.create(noteData);
    return note;
  } catch (error) {
    throw error;
  }
};

export default LeadModel; 