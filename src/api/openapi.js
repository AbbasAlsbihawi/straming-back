import swaggerJsDoc from "swagger-jsdoc";

import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  userSchema,
} from "./schemas/auth.js";
import videoSchema from "./schemas/video.js";
import file from "./schemas/file.js";
import { fileSchema } from "./schemas/file.js";

export const definition = {
  openapi: "3.0.0",
  info: {
    title: "hurryapp-hackathon",
    version: "0.0.1",
    description: "hurryapp-hackathon",
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1",
    },
    {
      url: "/api/v2",
      description: "API v2",
    },
  ],
  components: {
    schemas: {
      Video: videoSchema,
      loginSchema,
      registerSchema,
      changePasswordSchema,
      User: userSchema,
      File: file,
      CreateFile: fileSchema,
    },
    securitySchemes: {
      BearerAuth: {
        type: "http",
        description: "Simple bearer token",
        scheme: "bearer",
        bearerFormat: "simple",
      },
    },
  },
};

const options = {
  definition,
  apis: ["./src/api/routes/*.js"],
};

const spec = swaggerJsDoc(options);

export default spec;
