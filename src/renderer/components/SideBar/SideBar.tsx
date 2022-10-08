import SideBarItem from "./components/SideBarItem/SideBarItem";
import "./SideBar.css";

function SideBar() {
  return (
    <aside className="sidebar">
      <SideBarItem isActive onClick={() => {}} text="Dashboard" />
      <SideBarItem onClick={() => {}} text="Storage" />
      <SideBarItem onClick={() => {}} text="Data" />
      <div style={{ flex: 1 }} />
      <SideBarItem onClick={() => {}} text="Settings" />
    </aside>
  );
}

export default SideBar;
