import "./ConfigView.css";
import { useContext } from "react";
import FolderIcon from "@mui/icons-material/Folder";
import { ipcRenderer } from "electron";
import ScraperConfig from "../../../main/features/scraper/domain/entities/ScraperConfig";
import { Store } from "react-notifications-component";
import { AppContext } from "../../store/context";
import { Types } from "renderer/store/reducers";

function ConfigView() {
  const { state, dispatch } = useContext(AppContext);
  const { partsCheckUsername, partsCheckPassword, scraperSavePath } = state;

  const saveConfig = () => {
    if (partsCheckUsername && partsCheckPassword && scraperSavePath) {
      const scraperConfig: ScraperConfig = {
        partsCheckCredentials: {
          username: partsCheckUsername,
          password: partsCheckPassword,
        },
        savePath: scraperSavePath,
      };

      const saveResult = ipcRenderer.sendSync(
        "usecase:setScraperConfig",
        scraperConfig
      );

      if (saveResult) {
        dispatch({
          type: Types.setScraperConfig,
          payload: scraperConfig,
        });

        Store.addNotification({
          title: "Successful",
          message: "You have successfully saved [Config].",
          type: "success",
          insert: "top",
          container: "top-right",
          animationIn: ["animate__animated", "animate__fadeIn"],
          animationOut: ["animate__animated", "animate__fadeOut"],
          dismiss: {
            duration: 2000,
            onScreen: false,
          },
        });
      }
    }
  };

  const openBrowseDialog = async () => {
    const openBrowseDialogResult = await ipcRenderer.invoke(
      "dialog:openDirectory"
    );

    if (openBrowseDialogResult !== null) {
      dispatch({
        type: Types.setScraperSavePath,
        payload: openBrowseDialogResult,
      });
    }
  };

  return (
    <section className="config-wrapper">
      <div className="inp-container">
        <label htmlFor="partsCheckUsername">partscheck.com.au username</label>
        <input
          defaultValue={partsCheckUsername}
          id="partsCheckUsername"
          className="inp-default"
          type="text"
          onChange={(e) =>
            dispatch({
              type: Types.setPartsCheckUsername,
              payload: e.target.value,
            })
          }
        />
      </div>
      <div className="inp-container">
        <label htmlFor="partsCheckPassword">partscheck.com.au password</label>
        <input
          defaultValue={partsCheckPassword}
          id="partsCheckPassword"
          className="inp-default"
          type="password"
          onChange={(e) =>
            dispatch({
              type: Types.setPartsCheckPassword,
              payload: e.target.value,
            })
          }
        />
      </div>
      <div className="inp-container" onClick={openBrowseDialog}>
        <label>Save Directory</label>
        <div className="inp-with-btn">
          <input
            className="inp-default"
            type="text"
            value={scraperSavePath}
            disabled={true}
          />
          <button>
            <FolderIcon />
          </button>
        </div>
      </div>
      <div style={{ flex: 1 }}></div>
      <button onClick={saveConfig} className="btn-default config-save-btn">
        SAVE
      </button>
    </section>
  );
}

export default ConfigView;
