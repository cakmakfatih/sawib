import { Either } from "@typed-f/either";
import { Failure } from "main/core/error/failures";
import SBrowser from "../entities/SBrowser";
import StealthBrowserLaunchOptions from "../entities/StealthBrowserLaunchOptions";
import BrowserRepository from "../repositories/BrowserRepository";

type LaunchBrowserParams = StealthBrowserLaunchOptions;

interface ILaunchBrowser {
  (params?: LaunchBrowserParams): Promise<Either<Failure, SBrowser>>;
}

async function LaunchBrowser(repository: BrowserRepository, params?: LaunchBrowserParams): Promise<Either<Failure, SBrowser>> {
  return await repository.launch(params);
}

export {
  LaunchBrowserParams,
  ILaunchBrowser,
  LaunchBrowser,
};
