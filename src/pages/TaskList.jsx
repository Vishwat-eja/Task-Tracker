import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, getId } from "../api";
import useFetch from "../hooks/useFetch";
import { Spinner, ErrorMessage } from "../components/Status";

export default function TaskList() {
  const { data, loading, error, retry } = useFetch(() => api.list());
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const tasks = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.filter(
      (t) =>
        (filter === "all" || t.status === filter) &&
        (t.title || "").toLowerCase().includes(query.toLowerCase())
    );
  }, [data, filter, query]);

  if (loading) return <Spinner label="Loading tasks…" />;
  if (error) return <ErrorMessage error={error} onRetry={retry} />;

  return (
    <>
      <div className="toolbar">
        <h1>Your tasks</h1>
        <input type="search" placeholder="Search by title" value={query}
          onChange={(e) => setQuery(e.target.value)} aria-label="Search tasks" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="center">
          <p>No tasks match.</p>
          <Link to="/tasks/new" className="btn">Create a task</Link>
        </div>
      ) : (
        <ul className="grid">
          {tasks.map((t) => (
            <li key={getId(t)}>
              <Link to={`/tasks/${getId(t)}`} className="card">
                <span className={`badge badge-${t.status}`}>{t.status}</span>
                <h2>{t.title}</h2>
                <p>{t.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
