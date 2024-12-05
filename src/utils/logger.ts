import { LoggingWinston } from "@google-cloud/logging-winston";
import winston from "winston";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loggingWinston = new LoggingWinston({
  projectId: process.env.PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});


const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),

  ],
});

export default  logger
