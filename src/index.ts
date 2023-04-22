import "./side-effect";

import { ResultAsync, fromSafePromise } from "neverthrow";

import { logger } from "@adapters/logger";

import { client } from "./client";

const execute = () => {
  return fromSafePromise(
    (async () => {
      await client.query("BEGIN");
      await client.query("SELECT * FROM users");
      await client.query("COMMIT");
    })()
  );
};

const main = (): ResultAsync<void, unknown> => {
  const a = execute();

  const b = fromSafePromise(
    (async () => {
      await client.transaction(execute);
    })()
  );

  return ResultAsync.combine([a, b]).map(() => void 0);
};

void main().match(
  () => logger.success("main function completed successfully"),
  (err) => logger.error("main function failed", err)
);
