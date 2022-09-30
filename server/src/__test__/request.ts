// TODO create 'server-test-support' library with this file
import * as http from "http";
import type * as stream from "stream";

export const requestAsync = (
  opts: http.RequestOptions,
  write?: (writeable: stream.Writable) => Promise<void>,
) =>
  new Promise<{
    headers: http.IncomingHttpHeaders;
    data: string;
  }>((resolve, reject) => {
    const writeable = http
      .request(opts, (resp) => {
        let data = "";
        const headers = resp.headers;
        const statusCode = resp.statusCode;

        // A chunk of data has been received.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          if (statusCode === undefined || statusCode >= 400) {
            reject(new Error(`Status code: ${statusCode}`));
          } else {
            resolve({
              headers,
              data,
            });
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
    if (write) {
      void awaitAndThen(write(writeable), () => writeable.end(), reject);
    } else {
      writeable.end();
    }
  });

const awaitAndThen = async (
  awaitable: Promise<void>,
  onEnd: () => void,
  reject: (err: unknown) => void,
) => {
  try {
    await awaitable;
    onEnd();
  } catch (e) {
    reject(e);
  }
};
