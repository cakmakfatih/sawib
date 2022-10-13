import "./ConfigView.css";
import { useState, useEffect } from "react";
import FolderIcon from "@mui/icons-material/Folder";
import { ipcRenderer } from "electron";
import ScraperConfig from "../../../main/features/scraper/domain/entities/ScraperConfig";
import { Store } from "react-notifications-component";

function ConfigView() {
  useEffect(() => {
    setInitialData();
  }, []);

  const [partsCheckUsername, setPartsCheckUsername] = useState<string>("");
  const [partsCheckPassword, setPartsCheckPassword] = useState<string>("");
  const [scraperSavePath, setScraperSavePath] = useState<string>("");

  const setInitialData = () => {
    const scraperConfig: ScraperConfig = ipcRenderer.sendSync(
      "usecase:getScraperConfig"
    );

    if (scraperConfig) {
      setPartsCheckUsername(scraperConfig.partsCheckCredentials.username || "");
      setPartsCheckPassword(scraperConfig.partsCheckCredentials.password || "");
      setScraperSavePath(scraperConfig.partNumberSavePath || "");
    }
  };

  const saveConfig = () => {
    if (partsCheckUsername && partsCheckPassword && scraperSavePath) {
      const scraperConfig: ScraperConfig = {
        partsCheckCredentials: {
          username: partsCheckUsername,
          password: partsCheckPassword,
        },
        partNumberSavePath: scraperSavePath,
      };

      const saveResult = ipcRenderer.sendSync(
        "usecase:setScraperConfig",
        scraperConfig
      );

      if (saveResult) {
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
      setScraperSavePath(openBrowseDialogResult);
    }
  };

  return (
    <>
      <section className="config-wrapper">
        <div className="inp-container">
          <label htmlFor="partsCheckUsername">partscheck.com.au username</label>
          <input
            defaultValue={partsCheckUsername}
            id="partsCheckUsername"
            className="inp-default"
            type="text"
            onChange={(e) => setPartsCheckUsername(e.target.value)}
          />
        </div>
        <div className="inp-container">
          <label htmlFor="partsCheckPassword">partscheck.com.au password</label>
          <input
            defaultValue={partsCheckPassword}
            id="partsCheckPassword"
            className="inp-default"
            type="password"
            onChange={(e) => setPartsCheckPassword(e.target.value)}
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
    </>
  );
}

export default ConfigView;
