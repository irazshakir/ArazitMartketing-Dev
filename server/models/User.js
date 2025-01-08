import { DataTypes } from 'sequelize';

const User = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  User.associate = (models) => {
    User.hasMany(models.Lead, { foreignKey: 'assigned_user' });
  };

  return User;
};

export default User; 