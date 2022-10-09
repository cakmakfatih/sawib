import { Either } from "@typed-f/either";
import { Failure } from "main/core/error/failures";
import StealthBrowser from "../entities/StealthBrowser";
import { LaunchBrowserParams } from "../usecases/LaunchBrowser";

interface BrowserRepository {
  launch(params?: LaunchBrowserParams): Promise<Either<Failure, StealthBrowser>>;
}

export default BrowserRepository;
