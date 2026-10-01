const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Branch = sequelize.define(
  "Branch",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { en: "", am: "", om: "" },
    },
    address: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    latitude: {
      type: DataTypes.FLOAT,
    },
    longitude: {
      type: DataTypes.FLOAT,
    },
    openingHours: {
      type: DataTypes.STRING,
      defaultValue: "Mon–Fri 8:30 AM – 5:00 PM",
    },
    description: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  }
);

Branch.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = Branch;
