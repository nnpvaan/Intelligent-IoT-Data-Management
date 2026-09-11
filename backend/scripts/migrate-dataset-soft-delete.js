require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const fs = require("fs");
const path = require("path");
const db = require("../src/db/pool");

async function migrate() {
  try {
    await db.query(
      fs.readFileSync(
        path.resolve(
          __dirname,
          "../src/db/migrations/003_dataset_soft_delete.sql",
        ),
        "utf8",
      ),
    );
    console.log("Dataset soft-delete PostgreSQL migration applied.");
  } finally {
    await db.end();
  }
}

migrate().catch((error) => {
  console.error("Dataset soft-delete migration failed:", error);
  process.exitCode = 1;
});
