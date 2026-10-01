const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: { en: "", am: "", om: "" },
    },
    description: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    content: {
      type: DataTypes.JSON,
      defaultValue: { en: "", am: "", om: "" },
    },
    image: {
      type: DataTypes.STRING(2000),
      defaultValue: "",
    },
    location: {
      type: DataTypes.STRING,
      defaultValue: "Burayu",
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "start_date",
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "end_date",
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: "Planned",
      // Values: 'Planned', 'Ongoing', 'Completed', 'Suspended'
    },
    department: {
      type: DataTypes.STRING,
      defaultValue: "Infrastructure",
      field: "department",
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_published",
    },
    budget: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    tableName: "projects",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Project.belongsTo(User, { as: "author", foreignKey: "authorId" });

Project.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;

  // Compatibility aliases for UI cards and forms
  values.startDate = values.start_date || "";
  values.targetCompletion = values.end_date || "";
  values.category = values.department || "Infrastructure";
  values.projectStatus = values.status || "Planned";

  // Map is_published to status 'published'/'draft' for components checking item.status
  // while preserving raw status in projectStatus
  values.is_published = !!values.is_published;
  values.status = values.is_published ? "published" : "draft";

  return values;
};

module.exports = Project;
