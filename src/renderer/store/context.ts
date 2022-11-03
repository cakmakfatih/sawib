import ScraperConfig from "../../main/features/scraper/domain/entities/ScraperConfig";
import { createContext, Dispatch } from "react";
import { AppActions } from "./reducers";
import { ipcRenderer } from "electron";

const scraperConfig: ScraperConfig = ipcRenderer.sendSync('usecase:getScraperConfig');

const scrapingMethods: { [key: string]: string; } = {
  scrapePartsData: 'SCRAPE_PARTS_DATA',
  scrapeVehicleInfoWithPartsData: 'SCRAPE_VEHICLE_INFO_WITH_PARTS_DATA',
};

type AppStateType = {
  scraperConfig?: ScraperConfig;
  partsCheckUsername: string;
  partsCheckPassword: string;
  scraperSavePath: string;
  quoteUrl: string;
  isScraping: boolean;
  scrapingMethod: string;
};

const appInitialState: AppStateType = {
  scraperConfig,
  partsCheckUsername: scraperConfig?.partsCheckCredentials?.username ?? "",
  partsCheckPassword: scraperConfig?.partsCheckCredentials?.password ?? "",
  scraperSavePath: scraperConfig?.savePath ?? "",
  quoteUrl: "",
  isScraping: false,
  scrapingMethod: scrapingMethods.scrapePartsData,
};

const AppContext = createContext<{
  state: AppStateType;
  dispatch: Dispatch<AppActions>;
}>({
  state: appInitialState,
  dispatch: () => null,
});


export { AppContext, AppStateType, appInitialState, scrapingMethods };
