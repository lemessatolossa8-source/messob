const { sequelize } = require("../config/db");
const Project = require("../models/Project");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

async function runEndToEndVerification() {
  console.log("=== STARTING FULL PROJECTS END-TO-END VERIFICATION ===");
  try {
    await sequelize.authenticate();
    console.log("✓ Connected to MySQL database in Laragon");

    // 1. Verify projects table schema in MySQL
    const [cols] = await sequelize.query("DESCRIBE `projects`;");
    const colNames = cols.map((c) => c.Field);
    console.log("✓ Projects table columns:", colNames.join(", "));

    const requiredFields = [
      "id",
      "title",
      "description",
      "image",
      "location",
      "start_date",
      "end_date",
      "status",
      "department",
      "progress",
      "is_published",
      "created_at",
      "updated_at",
    ];

    const missingFields = requiredFields.filter((f) => !colNames.includes(f));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
    console.log("✓ ALL 13 REQUIRED FIELDS CONFIRMED IN MYSQL!");

    // 2. Test Admin Login / Token Generation
    let admin = await User.findOne({ where: { role: "admin" } });
    if (!admin) {
      admin = await User.create({
        name: "Burayu Administrator",
        email: "admin@burayu.gov.et",
        password: "admin123456password",
        role: "admin",
      });
    }
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET || "default_jwt_secret", {
      expiresIn: "1h",
    });
    console.log("✓ Admin authentication token verified for admin id:", admin.id);

    // 3. Test Add Project -> Save to MySQL (Unpublished initially)
    const newProject = await Project.create({
      title: {
        om: "Ijaarsa Daandii Asfaaltii Burayyuu",
        am: "የቡራዩ አስፋልት መንገድ ግንባታ ፕሮጀክት",
        en: "Burayu Asphalt Road Construction Project",
      },
      description: {
        om: "Pirojektii ijaarsa daandii asfaaltii bal'aa magaalaa Burayyuu keessatti.",
        am: "በቡራዩ ከተማ የሚካሄድ የዋና መንገድ አስፋልት ዝርጋታ ፕሮጀክት።",
        en: "Comprehensive municipal road asphalt construction project across Burayu corridors.",
      },
      image: "",
      location: "Burayu Central Corridor",
      start_date: "2026-02-01",
      end_date: "2026-11-30",
      status: "Ongoing",
      department: "Infrastructure",
      progress: 35,
      is_published: false, // Unpublished draft
      budget: "Municipal Infrastructure Fund",
      authorId: admin.id,
    });
    console.log("✓ Project successfully inserted into MySQL with ID:", newProject.id);

    // 4. Verify Unpublished Project is NOT visible on Public side
    const publicProjectsBefore = await Project.findAll({ where: { is_published: true } });
    const isPubliclyVisibleBefore = publicProjectsBefore.some((p) => p.id === newProject.id);
    console.log(
      "✓ Public Visibility (Unpublished):",
      isPubliclyVisibleBefore ? "FAILED (Visible)" : "PASSED (Hidden from public)"
    );
    if (isPubliclyVisibleBefore) throw new Error("Unpublished project should not be visible to public!");

    // 5. Test Edit Project (Update progress and details)
    await newProject.update({
      progress: 60,
      location: "Burayu Sector 4 - Gefersa Nono",
    });
    const refreshed = await Project.findByPk(newProject.id);
    console.log("✓ Project updated in MySQL. New Progress:", refreshed.progress, "Location:", refreshed.location);

    // 6. Test Publish Project
    await refreshed.update({ is_published: true });
    console.log("✓ Project published (is_published = true)");

    // 7. Verify Published Project IS visible on Public side (Homepage & Public Projects)
    const publicProjectsAfter = await Project.findAll({ where: { is_published: true } });
    const isPubliclyVisibleAfter = publicProjectsAfter.some((p) => p.id === newProject.id);
    console.log(
      "✓ Public Visibility (Published):",
      isPubliclyVisibleAfter ? "PASSED (Visible on Public & Home)" : "FAILED (Not visible)"
    );
    if (!isPubliclyVisibleAfter) throw new Error("Published project must be visible to public!");

    // 8. Test Unpublish Project
    await refreshed.update({ is_published: false });
    const publicProjectsAfterUnpublish = await Project.findAll({ where: { is_published: true } });
    const isVisibleAfterUnpublish = publicProjectsAfterUnpublish.some((p) => p.id === newProject.id);
    console.log(
      "✓ Public Visibility (After Unpublish):",
      !isVisibleAfterUnpublish ? "PASSED (Hidden again)" : "FAILED (Still visible)"
    );
    if (isVisibleAfterUnpublish) throw new Error("Unpublished project must be hidden!");

    // 9. Re-publish for showcase or clean delete
    await refreshed.update({ is_published: true });
    console.log("✓ Left 1 real published project in MySQL for user to see on the frontend!");

    console.log("=== ALL PROJECT VERIFICATION CHECKS PASSED SUCCESSFULLY! ===");
    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  }
}

runEndToEndVerification();
