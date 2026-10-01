require("dotenv").config();
const { connectDB } = require("./config/db");
const User = require("./models/User");
const News = require("./models/News");
const Service = require("./models/Service");
const Branch = require("./models/Branch");
const Announcement = require("./models/Announcement");

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting MySQL database seeding...");
    await connectDB();

    // 1. Seed Admin User
    const adminEmail = "admin@burayu.gov.et";
    let admin = await User.findOne({ where: { email: adminEmail } });

    if (!admin) {
      admin = await User.create({
        name: "Burayu Administrator",
        email: adminEmail,
        password: "password123",
        role: "admin",
        isActive: true,
      });
      console.log(`✅ Admin user created: ${adminEmail} / password123`);
    } else {
      console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
    }

    // Services, Branches, and News should be added through the admin panel

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
