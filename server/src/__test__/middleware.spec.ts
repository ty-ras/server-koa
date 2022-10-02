import test from "ava";

import * as spec from "../middleware";

import * as http from "http";
import Koa from "koa";
import * as testSupport from "@ty-ras/server-test-support";

testSupport.registerTests(test, (endpoints) =>
  http.createServer(new Koa().use(spec.createMiddleware(endpoints)).callback()),
);
