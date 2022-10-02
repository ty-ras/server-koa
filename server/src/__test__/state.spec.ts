/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test from "ava";
import * as spec from "../state";
import type * as koa from "koa";

// These look a bit silly but they make more sense in other server frameworks.
// The functions are provided here for orthogonality's sake.

test("Validate getStateFromContext works", (t) => {
  t.plan(1);
  t.deepEqual(spec.getStateFromContext(dummyContext), dummyContext.state);
});

test("Validate modifyState works", (t) => {
  t.plan(1);
  const ctxCopy: typeof dummyContext = {
    ...dummyContext,
    state: { ...dummyContext.state },
  };
  spec.modifyState(ctxCopy, (state) => (state.property = "Modified"));
  t.deepEqual(ctxCopy, { state: { property: "Modified" } });
});

const dummyContext: koa.ParameterizedContext<State> = {
  state: {
    property: "Property",
  },
} as any;

interface State {
  property: string;
}
