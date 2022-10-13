import { dialog, ipcMain } from 'electron';
import { container } from 'tsyringe';
import Tokens from './bin/Tokens';
import ScraperConfig from './features/scraper/domain/entities/ScraperConfig';
import { IGetScraperConfig } from './features/scraper/domain/usecases/GetScraperConfig';
import { IScrapePartNumbers } from './features/scraper/domain/usecases/ScrapePartNumbers';
import { ISetScraperConfig } from './features/scraper/domain/usecases/SetScraperConfig';

abstract class Bridge {
  static init() {
    const getScraperConfig: IGetScraperConfig = container.resolve<IGetScraperConfig>(Tokens.getScraperConfig);
    const setScraperConfig: ISetScraperConfig = container.resolve<ISetScraperConfig>(Tokens.setScraperConfig);
    const scrapePartNumbers: IScrapePartNumbers = container.resolve<IScrapePartNumbers>(Tokens.scrapePartNumbers);

    ipcMain.handle("dialog:openDirectory", async (_) => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
      });

      if (canceled) {
        return null;
      } else {
        return filePaths[0];
      }
    });

    ipcMain.on("usecase:getScraperConfig", (event) => {
      const scraperConfigOrFailure = getScraperConfig();

      if (scraperConfigOrFailure.isLeft()) {
        event.returnValue = null;
        return;
      }

      event.returnValue = scraperConfigOrFailure.value;
      return;
    });

    ipcMain.on("usecase:setScraperConfig", (event, config: ScraperConfig) => {
      const savedOrFailed = setScraperConfig(config);

      if (savedOrFailed.isLeft()) {
        event.returnValue = false;
        return;
      }

      event.returnValue = true;
      return;
    });

    ipcMain.handle("usecase:scrapePartNumbers", async (_, url) => {
      const result = await scrapePartNumbers(url);

      return !result.isLeft();
    });
  }
}

export default Bridge;
