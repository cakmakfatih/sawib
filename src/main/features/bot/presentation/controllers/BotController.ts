import { Page } from 'playwright-firefox';
import { inject, injectable } from 'tsyringe';
import StealthBrowser from '../../../../features/browser/domain/entities/StealthBrowser';
import { ICreatePages } from '../../domain/usecases/CreatePages';
import Tokens from '../../../../bin/Tokens';
import { Failure } from '../../../../core/error/failures';
import { Either, Left } from '@typed-f/either';
import Logger from '../../../../core/Logger';

interface BotController {
  initialize(): Promise<Either<Failure, void>>;
}

@injectable()
class BotControllerImpl implements BotController {
  private readonly stealthBrowser: StealthBrowser;

  private readonly logger: Logger;
  private readonly createPages: ICreatePages;

  public pages: Page[];

  constructor(
    stealthBrowser: StealthBrowser,
    @inject(Tokens.logger) logger?: Logger,
    @inject(Tokens.createPages) createPages?: ICreatePages,
  ) {
    this.stealthBrowser = stealthBrowser;

    this.logger = logger!;
    this.createPages = createPages!;
  }

  async initialize(): Promise<Either<Failure, void>> {
    this.logger.info("[BotController.initialize] started.");

    this.logger.info("[BotController.initialize] completed.");

    return new Left(new Failure(""));
  }
}

export default BotControllerImpl;
