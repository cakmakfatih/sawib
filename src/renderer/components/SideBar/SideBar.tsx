import SideBarItem from "./components/SideBarItem/SideBarItem";
import "./SideBar.css";

function SideBar() {
  return (
    <aside className="sidebar">
      <SideBarItem to="/" text="Dashboard" />
      <SideBarItem to="/scraper" text="Scraper" />
      <SideBarItem to="/config" text="Config" />
      <div style={{ flex: 1 }} />
      <SideBarItem to="/settings" text="Settings" />
    </aside>
  );
}

export default SideBar;
