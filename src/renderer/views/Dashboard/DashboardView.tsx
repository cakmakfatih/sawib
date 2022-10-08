import React from "react";
import DashboardButton from "renderer/components/DashboardButton/DashboardButton";
import DataObjectIcon from "@mui/icons-material/DataObject";
import CompareIcon from "@mui/icons-material/Compare";
import LaunchIcon from "@mui/icons-material/Launch";
import "./DashboardView.css";
import { ipcRenderer } from "electron";

function DashboardView() {
  const launchBrowser = () => {
    ipcRenderer.send("launch-browser");
  };

  return (
    <>
      <section className="dashboard-wrapper">
        <header className="dashboard-header">
          <h1 className="title">Welcome to SAWIB</h1>
          <span className="subtitle">
            From dashboard you can quickly access to features
          </span>
        </header>
        <div className="dashboard-body">
          <DashboardButton
            icon={<LaunchIcon />}
            onClick={launchBrowser}
            text="Launch"
          />
          <DashboardButton
            icon={<DataObjectIcon />}
            onClick={() => {
              console.log("test");
            }}
            text="Scrape"
          />
          <DashboardButton
            icon={<CompareIcon />}
            onClick={() => {
              console.log("test");
            }}
            text="Compare"
          />
        </div>
      </section>
    </>
  );
}

export default DashboardView;
