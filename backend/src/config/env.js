import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

let loaded = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../../.env");

export const loadEnv = () => {
  if (loaded) {
    return;
  }

  dotenv.config({ path: envPath });
  loaded = true;
};

loadEnv();

export default loadEnv;
