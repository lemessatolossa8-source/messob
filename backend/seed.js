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

    // 2. Seed Services if empty
    const serviceCount = await Service.count();
    if (serviceCount === 0) {
      await Service.bulkCreate([
        {
          title: {
            en: "Business & Trade Permit",
            am: "የንግድ ፈቃድ አገልግሎት",
            om: "Hayyama Daldalaa",
          },
          description: {
            en: "Issuance and renewal of municipal business licenses and commercial operating permits.",
            am: "የንግድ ስራ ፍቃድ መስጠት እና ማደስ አገልግሎቶች።",
            om: "Tajaajila hayyama daldalaa kennuufi haaressuu.",
          },
          icon: "Briefcase",
          category: "Business",
          status: "published",
          order: 1,
        },
        {
          title: {
            en: "Land & Urban Construction",
            am: "የቦታ እና የከተማ ግንባታ",
            om: "Lafaafi Ijaarsa Magaalaa",
          },
          description: {
            en: "Urban planning permits, land tenure registration, building plan verification.",
            am: "የከተማ ማስተር ፕላን ፍቃድ እና የግንባታ ማረጋገጫ አገልግሎት።",
            om: "Hayyama ijaarsa magaalaafi galmeessa ragaa lafaa.",
          },
          icon: "Building",
          category: "Urban",
          status: "published",
          order: 2,
        },
        {
          title: {
            en: "Vital Events Registration",
            am: "የወሳኝ ኩነቶች ምዝገባ",
            om: "Galmeessa Taateewwan Murteessoo",
          },
          description: {
            en: "Birth certificates, marriage registration, and official residency identification cards.",
            am: "የልደት፣ የጋብቻ እና የነዋሪነት መታወቂያ ምስክር ወረቀት መስጠት።",
            om: "Waraqaa ragaa dhalootaa, fuudhaa fi heerumaa akkasumas waraqaa eenyummaa.",
          },
          icon: "FileText",
          category: "Civil",
          status: "published",
          order: 3,
        },
      ]);
      console.log("✅ Default Services seeded.");
    }

    // 3. Seed Branches if empty
    const branchCount = await Branch.count();
    if (branchCount === 0) {
      await Branch.bulkCreate([
        {
          name: {
            en: "Burayu Central City Hall",
            am: "ቡራዩ ማዕከላዊ ከተማ አስተዳደር",
            om: "Wajjira Kantiibaa Magaalaa Buraayyuu",
          },
          address: "Burayu Main Road, near Public Square",
          phone: "+251 11 284 0001",
          email: "info@burayu.gov.et",
          latitude: 9.055,
          longitude: 38.685,
          openingHours: "Mon–Fri 8:30 AM – 5:00 PM",
          description: {
            en: "Headquarters for Burayu Municipal Administration and Executive Mayor's Office.",
            am: "የቡራዩ ከተማ አስተዳደር ማዕከላዊ ጽሕፈት ቤት።",
            om: "Wajjira Muummee Bulchiinsa Magaalaa Buraayyuu.",
          },
          active: true,
        },
      ]);
      console.log("✅ Default Branch seeded.");
    }

    // 4. Seed News if empty
    const newsCount = await News.count();
    if (newsCount === 0) {
      await News.create({
        title: {
          en: "Burayu City Launches Digital Portal for Municipal Services",
          am: "የቡራዩ ከተማ አስተዳደር አዲሱን የዲጂታል አገልግሎት ፖርታል ይፋ አደረገ",
          om: "Magaalaan Buraayyuu Tajaajila Diijitaalaa Haaraa Eegalchiise",
        },
        summary: {
          en: "Citizens can now access permits, vital event registrations, and announcements online.",
          am: "ዜጎች አሁን በቀላሉ የንግድ ፍቃድ እና የወሳኝ ኩነቶች አገልግሎትን በመስመር ላይ ማግኘት ይችላሉ።",
          om: "Lammiileen tajaajila adda addaa toora intarnetiitiin argachuu danda'u.",
        },
        content: {
          en: "The Burayu City Administration has officially unveiled its state-of-the-art public portal MESOB...",
          am: "የቡራዩ ከተማ አስተዳደር የህዝብ አገልግሎቶችን ለማዘመን አዲሱን MESOB ፖርታል ሥራ ላይ ውሏል።",
          om: "Bulchiinsi Magaalaa Buraayyuu tajaajila ummataa ammayyeessuuf poortaalii MESOB banera.",
        },
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        category: "Technology",
        status: "published",
        date: new Date().toISOString().split("T")[0],
        authorId: admin.id,
      });
      console.log("✅ Default News seeded.");
    }

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
