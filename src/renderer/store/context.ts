import ScraperConfig from "../../main/features/scraper/domain/entities/ScraperConfig";
import { createContext, Dispatch } from "react";
import { AppActions } from "./reducers";
import { ipcRenderer } from "electron";

const scraperConfig: ScraperConfig = ipcRenderer.sendSync('usecase:getScraperConfig');

type AppStateType = {
  scraperConfig?: ScraperConfig;
  partsCheckUsername: string;
  partsCheckPassword: string;
  scraperSavePath: string;
  quoteUrl: string;
  isScraping: boolean;
};

const appInitialState: AppStateType = {
  scraperConfig,
  partsCheckUsername: scraperConfig?.partsCheckCredentials?.username ?? "",
  partsCheckPassword: scraperConfig?.partsCheckCredentials?.password ?? "",
  scraperSavePath: scraperConfig?.savePath ?? "",
  quoteUrl: "",
  isScraping: false,
};

const AppContext = createContext<{
  state: AppStateType;
  dispatch: Dispatch<AppActions>;
}>({
  state: appInitialState,
  dispatch: () => null,
});


export { AppContext, AppStateType, appInitialState };
