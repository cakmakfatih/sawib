import DashboardButton from "renderer/components/DashboardButton/DashboardButton";
import DataObjectIcon from "@mui/icons-material/DataObject";
import CompareIcon from "@mui/icons-material/Compare";
import "./DashboardView.css";

function DashboardView() {
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
