import type { wsContext } from "../wsContext";

export type ActionHandler = {
  handleRequest: (
    payload: unknown,
    wsCtx: wsContext
  ) => Promise<object | string>;
  handleResponse: (
    payload: unknown,
    wsCtx: wsContext
  ) => Promise<object | string>;
};
