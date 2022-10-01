/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test from "ava";
import * as spec from "../context";
import type * as koa from "koa";
import type * as data from "@ty-ras/data";

// These look a bit silly but they make more sense in other server frameworks.
// The functions are provided here for orthogonality's sake.

test("Validate validateContextState works", (t) => {
  t.plan(2);
  const { validator, getState } = spec.validateContextState((data) => ({
    error: "none",
    data,
  }));
  t.deepEqual(validator(dummyContext), {
    error: "none",
    data: dummyContext,
  });
  t.deepEqual(getState(dummyContext), dummyContext.state);
});

test("Validate validateContextState works with failing callback", (t) => {
  t.plan(2);
  const { validator, getState } = spec.validateContextState(erroringValidator);
  t.deepEqual(validator(dummyContext), errorObject);
  t.deepEqual(getState(dummyContext), dummyContext.state);
});

test("Validate validateContextState works with failing callback and custom status code", (t) => {
  t.plan(2);
  const { validator, getState } = spec.validateContextState(
    erroringValidator,
    403,
  );
  t.deepEqual(validator(dummyContext), {
    error: "protocol-error",
    statusCode: 403,
    body: undefined,
  });
  t.deepEqual(getState(dummyContext), dummyContext.state);
});

test("Validate validateContextState works with failing callback and custom status code and body", (t) => {
  t.plan(2);
  const { validator, getState } = spec.validateContextState(erroringValidator, {
    statusCode: 403,
    body: "Body",
  });
  t.deepEqual(validator(dummyContext), {
    error: "protocol-error",
    statusCode: 403,
    body: "Body",
  });
  t.deepEqual(getState(dummyContext), dummyContext.state);
});

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

const getHumanReadableMessage = () => "";

const erroringValidator: data.DataValidator<unknown, unknown> = () =>
  errorObject;

const errorObject: data.DataValidatorResultError = {
  error: "error",
  errorInfo: "Info",
  getHumanReadableMessage,
};
