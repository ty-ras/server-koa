import type * as koa from "koa";
import type * as server from "@ty-ras/server";
import type * as ctx from "./context";

export const getStateFromContext: server.GetStateFromContext<ctx.HKTContext> = (
  ctx,
) => ctx.state;

// This is meant to be used by middleware occurring before the actual REST API.
export const modifyState = <TState>(
  ctx: koa.ParameterizedContext<TState>,
  modify: (state: TState) => void,
) => {
  modify(getStateFromContext(ctx));
};
