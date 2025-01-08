import { DataTypes } from 'sequelize';

const Lead = (sequelize) => {
  const Lead = sequelize.define('Lead', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lead_product: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    lead_stage: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Stages',
        key: 'id'
      }
    },
    lead_source_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'LeadSources',
        key: 'id'
      }
    },
    assigned_user: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    initial_remarks: {
      type: DataTypes.TEXT
    },
    lead_active_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  Lead.associate = (models) => {
    Lead.belongsTo(models.Product, { foreignKey: 'lead_product' });
    Lead.belongsTo(models.Stage, { foreignKey: 'lead_stage' });
    Lead.belongsTo(models.LeadSource, { foreignKey: 'lead_source_id' });
    Lead.belongsTo(models.User, { foreignKey: 'assigned_user' });
  };

  return Lead;
};

export default Lead; 