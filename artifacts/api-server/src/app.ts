import express, { type Express, type RequestHandler } from "express";
import cors from "cors";
import * as pinoHttpModule from "pino-http";
import type { Options } from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

// pino-http v10 uses `export =` (CJS) which TypeScript's bundler moduleResolution
// does not expose as callable via default or namespace import.
// We cast to the known function signature to satisfy the type checker.
type PinoHttpFn = (opts: Options) => RequestHandler;
const pinoHttp = pinoHttpModule as unknown as PinoHttpFn;

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: { id: string; method: string; url?: string }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: { statusCode: number }) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
