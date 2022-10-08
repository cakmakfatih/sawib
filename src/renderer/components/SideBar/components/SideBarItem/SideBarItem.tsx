import "./SideBarItem.css";

function SideBarItem({
  onClick,
  text,
  isActive,
}: {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  text: string;
  isActive?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`sidebar-item${isActive ? " active" : ""}`}
    >
      <span>{text}</span>
    </div>
  );
}

export default SideBarItem;
