require("../backend/node_modules/dotenv").config({ path: require('path').resolve(__dirname, '../backend/.env') });
const { connectDB } = require("../backend/config/db");
const User = require("../backend/models/User");
const News = require("../backend/models/News");
const Service = require("../backend/models/Service");
const Branch = require("../backend/models/Branch");
const Announcement = require("../backend/models/Announcement");

const seedDatabase = async () => {
  try {
    console.log(" Starting MySQL database seeding...");
    await connectDB();

    // 1. Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL || "lemessatolossa8@gmail.com";
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

    console.log(" Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
