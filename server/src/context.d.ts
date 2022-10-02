import type * as server from "@ty-ras/server";
import type * as koa from "koa";

export interface HKTContext extends server.HKTContext {
  readonly type: koa.ParameterizedContext<this["_TState"]>;
}
