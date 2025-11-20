import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { sendEmail } from "./services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env located at: C:/Users/user/Desktop/MedFLow/.env
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

sendEmail("oelimuyah@gmail.com", "Test Email", "<h1>Hello</h1>");

console.log("Mailtrap host:", process.env.EMAIL_HOST);
console.log(process.env.EMAIL_HOST, process.env.EMAIL_PORT);



