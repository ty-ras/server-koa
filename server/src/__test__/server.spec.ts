/**
 * @file This file contains unit tests for functionality in file `../server.ts`.
 */

import test from "ava";

import * as spec from "../server";
import * as secure from "./secure";
import * as serverGeneric from "@ty-ras/server";
import * as testSupport from "@ty-ras/server-test-support";

const createServer: testSupport.CreateServer = (
  endpoints,
  info,
  httpVersion,
  secure,
) => {
  const server = spec.createServer({
    endpoints,
    ...getCreateState(info),
  });
  return {
    server: serverGeneric.createNodeServerGeneric(
      httpVersion === 2
        ? {
            httpVersion: 2,
            secure,
            options: secure ? secureInfo : {},
          }
        : httpVersion === 1
        ? {
            httpVersion: 1,
            secure,
            options: secure ? secureInfo : {},
          }
        : doThrow(`Invalid http version: ${httpVersion}`),
      server.callback(),
    ),
    secure,
  };
};

const secureInfo = secure.generateKeyAndCert();
const doThrow = (msg: string) => {
  throw new Error(msg);
};

const defaultOpts: testSupport.RegisterTestsOptions = {
  run500Test: true,
};

testSupport.registerTests(test, createServer, {
  ...defaultOpts,
  httpVersion: 1,
  secure: false,
});

testSupport.registerTests(test, createServer, {
  ...defaultOpts,
  httpVersion: 1,
  secure: true,
});

testSupport.registerTests(test, createServer, {
  ...defaultOpts,
  httpVersion: 2,
  secure: false,
});

testSupport.registerTests(test, createServer, {
  ...defaultOpts,
  httpVersion: 2,
  secure: true,
});

const getCreateState = (
  info: testSupport.ServerTestAdditionalInfo[0],
): Pick<spec.ServerCreationOptions<unknown, never>, "createState"> =>
  info == 500
    ? {
        createState: () => {
          throw new Error("This should be catched.");
        },
      }
    : {};
