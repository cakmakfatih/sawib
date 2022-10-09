import { Either, Left, Right } from "@typed-f/either";

async function safePromise<T>(func: () => Promise<T>): Promise<Either<Error, T>> {
  try {
    const data = await func();

    return new Right(data);
  } catch (error) {
    if (error instanceof Error)
      return new Left(error);

    return new Left(new Error("Unexpected error."));
  }
}

export default safePromise;
