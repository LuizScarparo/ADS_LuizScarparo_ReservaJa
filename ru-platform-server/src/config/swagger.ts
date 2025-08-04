import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { Express } from 'express';

const swaggerDocument = YAML.load('./src/config/openapi.yaml');

export function setupSwagger(app: Express): void {
  app.use('/ru-platform/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
