require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const app = require("./app");
const { startThingSpeakPolling } = require("./services/thingspeakService");
<<<<<<< HEAD
=======
const { startDatasetCleanupJob } = require("./jobs/datasetCleanupJob");
>>>>>>> 5c5855ebf2c866c6f18f3809753f78e18e71beba
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  startThingSpeakPolling();
<<<<<<< HEAD
=======
  startDatasetCleanupJob();
>>>>>>> 5c5855ebf2c866c6f18f3809753f78e18e71beba
});
