import { AxiosError } from "axios";
import React from "react";

function ErrorPage({ pageError }: { pageError: any }) {
  if (!pageError.response?.status || pageError.response == undefined) {
    <div className="flex flex-col items-center justify-center flex-grow font-bold text-xl text-red-500 ">
      <h1 className="text-2xl py-8 pt-12 sm:py-4 text-center">
        Sorry something went wrong:
      </h1>
      <div className="w-4/5 h-fit bg-white p-4 rounded flex flex-col justify-center overflow-x-scroll">
        It looks as if the server is down. This may happen from time to time.
        Try again in a few minutes.
      </div>
    </div>;
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow font-bold text-xl text-red-500 ">
      <h1 className="text-2xl py-8 pt-12 sm:py-4 text-center">
        Sorry something went wrong:
      </h1>
      <div className="w-4/5 h-fit bg-white p-4 rounded flex flex-col justify-center overflow-x-scroll">
        <p className="">
          Error Status code:{" "}
          <span className="text-black">
            {(pageError as AxiosError).response?.status || 500}
          </span>
        </p>
        <p className="">
          Error name:{" "}
          <span className="text-black">
            {(pageError as AxiosError).response?.statusText || (
              <span>Server Error</span>
            )}
          </span>
        </p>
        <p className="">
          Server response:{" "}
          <span className="text-black">
            {pageError.response?.data?.message || (
              <span>
                <br></br>It looks as if the server is down.<br></br>This may
                happen from time to time.<br></br>Try again in a few minutes.
              </span>
            )}
          </span>
        </p>
      </div>
    </div>
  );
}

export default ErrorPage;
