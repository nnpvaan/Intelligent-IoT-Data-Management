const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
const { assertProductionAuthConfig } = require("./config/authConfig");
const apiRoutes = require("./routes");
const authRoutes = require("./routes/auth");
=======

const { assertProductionAuthConfig } = require("./config/authConfig");
const { MAX_REQUEST_BODY_BYTES } = require("./config/uploadLimits");
const {
  requestBodyLimitErrorHandler,
} = require("./middleware/uploadLimitMiddleware");
const apiRoutes = require("./routes");
const authRoutes = require("./routes/auth");
const thingSpeakRoutes = require("./routes/thingspeak");

>>>>>>> 5c5855ebf2c866c6f18f3809753f78e18e71beba
function cookieParser(req, _res, next) {
  req.cookies = Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .filter(Boolean)
      .map((part) => {
        const i = part.indexOf("=");
<<<<<<< HEAD
        return [part.slice(0, i).trim(), decodeURIComponent(part.slice(i + 1))];
      }),
  );
  next();
}
function createApp() {
  assertProductionAuthConfig();
  const app = express();
  const origin = process.env.FRONTEND_ORIGIN;
  app.use(
    cors({ origin: origin ? origin.split(",") : true, credentials: true }),
  );
  app.use(express.json());
  app.use(cookieParser);
  app.get("/", (_req, res) => res.send("Backend is running"));
  app.get("/health", (_req, res) =>
=======
        return [
          part.slice(0, i).trim(),
          decodeURIComponent(part.slice(i + 1)),
        ];
      }),
  );

  next();
}

function createApp() {
  assertProductionAuthConfig();

  const app = express();

  const origin = process.env.FRONTEND_ORIGIN;

  app.use(
    cors({
      origin: origin ? origin.split(",") : true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: MAX_REQUEST_BODY_BYTES }));
  app.use(cookieParser);

  app.get("/", (_req, res) => {
    res.send("Backend is running");
  });

  app.get("/health", (_req, res) => {
>>>>>>> 5c5855ebf2c866c6f18f3809753f78e18e71beba
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
<<<<<<< HEAD
    }),
  );
  app.get("/ready", (_req, res) =>
    process.env.NODE_ENV === "production" && !process.env.JWT_SECRET
      ? res
          .status(503)
          .json({
            error: {
              code: "READY_DEPENDENCY_UNAVAILABLE",
              message: "Authentication configuration is unavailable.",
            },
          })
      : res.json({ status: "ready" }),
  );
  app.use("/api", apiRoutes);
  app.use("/api", authRoutes);
  return app;
}
module.exports = createApp();
module.exports.createApp = createApp;
=======
    });
  });

  app.get("/ready", (_req, res) =>
    process.env.NODE_ENV === "production" && !process.env.JWT_SECRET
      ? res.status(503).json({
          error: {
            code: "READY_DEPENDENCY_UNAVAILABLE",
            message: "Authentication configuration is unavailable.",
          },
        })
      : res.json({ status: "ready" }),
  );

  // Main Backend routes:
  // analyse, datasets, series, timestamps, mocks
  app.use("/api", apiRoutes);

  // Authentication routes
  app.use("/api", authRoutes);

  // ThingSpeak live-data routes
  app.use("/api", thingSpeakRoutes);

  app.use(requestBodyLimitErrorHandler);
  return app;
}

module.exports = createApp();
module.exports.createApp = createApp;
>>>>>>> 5c5855ebf2c866c6f18f3809753f78e18e71beba
