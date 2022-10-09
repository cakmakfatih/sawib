import { Either } from "@typed-f/either";
import { Failure } from "main/core/error/failures";
import SBrowser from "../entities/SBrowser";
import { LaunchBrowserParams } from "../usecases/LaunchBrowser";

interface BrowserRepository {
  launch(params?: LaunchBrowserParams): Promise<Either<Failure, SBrowser>>;
}

export default BrowserRepository;
