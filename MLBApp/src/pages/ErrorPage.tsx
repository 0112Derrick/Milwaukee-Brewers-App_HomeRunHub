function ErrorPage({ pageError }: { pageError: any }) {
  if (!pageError.response?.status || pageError.response == undefined) {
    <div className="flex flex-col items-center justify-center flex-grow font-bold text-xl text-red-500 ">
      <div className="w-4/5 h-fit bg-white p-4 rounded flex flex-col justify-center overflow-x-scroll">
        It looks as if the server is down. This may happen from time to time.
        Try again in a few minutes.
      </div>
    </div>;
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow font-bold text-xl text-red-500 ">
      <h1 className="text-2xl py-8 pt-12 sm:py-4 text-center">
        Oops we encountered an error:
      </h1>
      <div className="w-4/5 h-fit bg-white p-4 rounded flex flex-col justify-center overflow-x-scroll">
        <p className="">
          Server response:{" "}
          <span className="text-black">
            {typeof pageError == "string" ? (
              <div>Error: {pageError}</div>
            ) : (
              pageError.response?.data?.message || (
                <span>
                  <br></br>It looks as if the server is down.<br></br>This may
                  happen from time to time.<br></br>Try again in a few minutes.
                </span>
              )
            )}
          </span>
        </p>
      </div>
    </div>
  );
}

export default ErrorPage;
