import { Either, Left, Right } from "@typed-f/either";

function safeCall<T>(func: () => T): Either<Error, T> {
  try {
    const data = func();

    return new Right(data);
  } catch (error) {
    if (error instanceof Error)
      return new Left(error);

    return new Left(new Error("Unexpected error."));
  }
}

export default safeCall;
