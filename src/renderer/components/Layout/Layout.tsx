import SideBar from "../SideBar/SideBar";
import "./Layout.css";

function Layout({ children }: { children: JSX.Element[] | JSX.Element }) {
  return (
    <div className="layout">
      <SideBar />
      <main>{children}</main>
    </div>
  );
}

export default Layout;
