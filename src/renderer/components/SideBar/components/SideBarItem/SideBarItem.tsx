import { NavLink } from "react-router-dom";
import "./SideBarItem.css";

function SideBarItem({ text, to }: { text: string; to: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        isActive ? "sidebar-item active" : "sidebar-item"
      }
    >
      <span>{text}</span>
    </NavLink>
  );
}

export default SideBarItem;
