const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Floor = require("./Floor");

const FloorService = sequelize.define(
  "FloorService",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    floorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Floor,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { en: "", am: "", om: "" },
    },
    description: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    department: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    roomNumber: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    visitorInstructions: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: "Building2",
    },
    image: {
      type: DataTypes.STRING(2000),
      defaultValue: "",
    },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      defaultValue: "published",
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
    tableName: "FloorServices",
  }
);

// Associations
Floor.hasMany(FloorService, { as: "services", foreignKey: "floorId", onDelete: "CASCADE", hooks: true });
FloorService.belongsTo(Floor, { as: "floor", foreignKey: "floorId" });

FloorService.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = FloorService;
