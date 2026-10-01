const Project = require("../models/Project");
const { sequelize } = require("../config/db");

async function testProjects() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB");

    // 1. Create a project
    const created = await Project.create({
      title: { om: "Projeektii Daandii Burayyuu", am: "የቡራዩ መንገድ ፕሮጀክት", en: "Burayu Arterial Corridor" },
      description: { om: "Ijaarsa daandii asfaaltii", am: "የአስፋልት መንገድ ግንባታ", en: "Asphalt corridor road construction" },
      location: "Burayu Central",
      start_date: "2026-01-15",
      end_date: "2026-12-30",
      status: "Ongoing",
      department: "Infrastructure",
      progress: 45,
      is_published: true,
      budget: "Municipal Fund",
    });
    console.log("Created project ID:", created.id);

    // 2. Fetch project
    const found = await Project.findByPk(created.id);
    console.log("Found project:", found.toJSON());

    // 3. Update project
    await found.update({ progress: 50, is_published: false });
    console.log("Updated project status:", found.toJSON().status, "is_published:", found.toJSON().is_published);

    // 4. Delete project
    await found.destroy();
    console.log("Deleted test project successfully");

    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testProjects();
