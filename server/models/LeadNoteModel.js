import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import UserModel from './UserModel.js';

const LeadNoteModel = sequelize.define('lead_notes', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  lead_id: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  note_added_by: {
    type: DataTypes.BIGINT,
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
LeadNoteModel.belongsTo(UserModel, {
  foreignKey: 'note_added_by',
  as: 'user'
});

export default LeadNoteModel; 