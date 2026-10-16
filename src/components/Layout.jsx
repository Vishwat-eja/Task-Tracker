import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <header className="topbar">
        <NavLink to="/" className="brand">Task Tracker</NavLink>
        <nav>
          <NavLink to="/" end>Tasks</NavLink>
          <NavLink to="/tasks/new" className="btn btn-small">New task</NavLink>
        </nav>
      </header>
      <main className="container"><Outlet /></main>
    </>
  );
}
