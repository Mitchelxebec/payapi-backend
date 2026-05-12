import express, { Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db";
import logger from "./utils/logger";
import errorHandler from "./middleware/errorMiddleware";
import authRoute from "./routes/auth";
import payApiRoute from "./routes/payApiRoutes";

dotenv.config();

const app = express();

// 1. Middleware

// Define which origins are allowed
const allowedOrigins = [
  "http://localhost:5173",
  "https://pay-api-ochre.vercel.app",
  "https://www.pay-api-ochre.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      // or if the origin is in our allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies or auth headers if needed
  }),
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 request per window
  message: "Too many requests from this IP, please try again later.",
});

// 2. Routes
app.use("/api/", limiter);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/payapi", payApiRoute);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "PayAPI Gateway is Online",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5005;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Critical Failure: Could not start server", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.info("MongoDB connection closed through app termination");
  process.exit(0);
});
