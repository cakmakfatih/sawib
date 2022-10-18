import ScraperConfig from "../../main/features/scraper/domain/entities/ScraperConfig";
import { AppStateType } from "./context";

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
  ? {
    type: Key;
  }
  : {
    type: Key;
    payload: M[Key];
  }
};

export enum Types {
  setPartsCheckUsername = 'SET_PARTS_CHECK_USERNAME',
  setPartsCheckPassword = 'SET_PARTS_CHECK_PASSWORD',
  setScraperSavePath = 'SET_SCRAPER_SAVE_PATH',
  setScraperConfig = 'SET_SCRAPER_CONFIG',
  setQuoteUrl = 'SET_QUOTE_URL',
  setIsScraping = 'SET_IS_SCRAPING',
}

type AppPayload = {
  [Types.setPartsCheckUsername]: string;
  [Types.setPartsCheckPassword]: string;
  [Types.setScraperSavePath]: string;
  [Types.setScraperConfig]: ScraperConfig;
  [Types.setQuoteUrl]: string;
  [Types.setIsScraping]: boolean;
};

export type AppActions = ActionMap<AppPayload>[keyof ActionMap<AppPayload>];

function appReducer(state: AppStateType, action: AppActions): AppStateType {
  switch (action.type) {
    case (Types.setPartsCheckUsername):
      return {
        ...state,
        partsCheckUsername: action.payload,
      };
    case (Types.setPartsCheckPassword):
      return {
        ...state,
        partsCheckPassword: action.payload,
      };
    case (Types.setScraperSavePath):
      return {
        ...state,
        scraperSavePath: action.payload,
      };
    case (Types.setScraperConfig):
      return {
        ...state,
        scraperConfig: action.payload,
      };
    case (Types.setIsScraping):
      return {
        ...state,
        isScraping: action.payload,
      };
    case (Types.setQuoteUrl):
      return {
        ...state,
        quoteUrl: action.payload,
      };
    default:
      return state;
  }
}

export default appReducer;
