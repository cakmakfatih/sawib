import DashboardButton from "renderer/components/DashboardButton/DashboardButton";
import DataObjectIcon from "@mui/icons-material/DataObject";
import "./DashboardView.css";
import { useNavigate } from "react-router-dom";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";

function DashboardView() {
  const navigate = useNavigate();

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
            icon={<DonutLargeIcon />}
            onClick={() => {
              navigate("/config");
            }}
            text="Config"
          />
          <DashboardButton
            icon={<DataObjectIcon />}
            onClick={() => {
              navigate("/scraper");
            }}
            text="Scraper"
          />
        </div>
      </section>
    </>
  );
}

export default DashboardView;
