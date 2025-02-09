import { OpenAPIV3 } from 'openapi-types';

export interface SwaggerOptions {
  definition: OpenAPIV3.Document;
  apis: string[];
}

const swaggerConfig: SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
    },
    paths: {},
  },
  apis: ["./src/routes/**/*.ts"],
};

export default swaggerConfig;
