import { AsyncLocalStorage } from "node:async_hooks";

import { logger } from "@adapters/logger";

const isTransaction = Symbol("$$transaction");
interface DBClient {
  [isTransaction]: boolean;
  query<T>(query: string): PromiseLike<T>;
  transaction<T>(callback: () => PromiseLike<T>): PromiseLike<T>;
}
const context = new AsyncLocalStorage<Omit<DBClient, "transaction">>();

export const client: DBClient = {
  [isTransaction]: false,
  query<T>(query: string) {
    const store = context.getStore();
    if (!store) {
      throw new Error("client is not initialized");
    }

    if (store[isTransaction]) {
      logger.debug("query", query, `(in transaction)`);
    } else {
      logger.debug("query", query);
    }

    return new Promise<T>((resolve) => {
      setTimeout(() => {
        if (store[isTransaction]) {
          logger.debug("result", query, `(in transaction)`);
        } else {
          logger.debug("result", query);
        }
        resolve({} as T);
      }, Math.random() * 100);
    });
  },
  async transaction(callback) {
    const store = context.getStore();
    if (!store) throw new Error("client is not initialized");

    const o = { ...store, [isTransaction]: true };

    try {
      logger.info("transaction start");

      return await context.run(o, callback);
    } finally {
      logger.info("transaction end");
    }
  },
};

// initialize
context.enterWith(client);
