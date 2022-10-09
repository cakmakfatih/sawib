import Logger from '../../../../core/Logger';
import StealthBrowser from '../../../../features/browser/domain/entities/StealthBrowser';
import { ICreatePages } from '../../domain/usecases/CreatePages';
import { Page } from 'playwright-firefox';
import { container, inject, injectable } from 'tsyringe';
import Tokens from 'main/bin/Tokens';

interface BotController { }

@injectable()
class BotControllerImpl implements BotController {
  public stealthBrowser: StealthBrowser;
  public pages: Page[];

  private readonly logger: Logger;
  private readonly createPages: ICreatePages;

  constructor(
    stealthBrowser: StealthBrowser,
    @inject(Tokens.logger) logger?: Logger,
    @inject(Tokens.createPages) createPages?: ICreatePages,
  ) {
    this.stealthBrowser = stealthBrowser;

    this.logger = logger ?? container.resolve<Logger>(Tokens.logger);
    this.createPages = createPages ?? container.resolve<ICreatePages>(Tokens.createPages);
  }
}

export default BotControllerImpl;
