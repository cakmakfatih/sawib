import { MouseEventHandler } from "react";
import "./DashboardButton.css";

function DashboardButton({
  onClick,
  icon,
  text,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  icon: JSX.Element;
  text: string;
}) {
  return (
    <button className="dashboard-btn" onClick={onClick}>
      <>{icon}</>
      <div style={{ height: 10 }} />
      <span>{text}</span>
    </button>
  );
}

export default DashboardButton;
