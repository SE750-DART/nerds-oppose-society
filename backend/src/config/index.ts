import convict from "convict";
import { ipaddress, url } from "convict-format-with-validator";
import dotenv from "dotenv";

dotenv.config();

convict.addFormat(ipaddress);
convict.addFormat(url);

const index = convict({
  env: {
    format: ["prod", "dev", "test"],
    default: "dev",
    env: "NODE_ENV",
  },
  port: {
    format: "port",
    default: "42069",
    env: "PORT",
  },
  origin: {
    format: "url",
    default: "http://localhost:3000",
    env: "ORIGIN",
  },
});

const env = index.get("env");
index.loadFile(`src/config/${env}.json`);

index.validate({ allowed: "strict" });

export default index.getProperties();
