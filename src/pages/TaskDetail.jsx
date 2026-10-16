import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import useFetch from "../hooks/useFetch";
import { useNotify } from "../context/NotificationContext";
import { Spinner, ErrorMessage } from "../components/Status";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useNotify();
  const { data: task, loading, error, retry } = useFetch(() => api.get(id), [id]);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this task? This can't be undone.")) return;
    setDeleting(true);
    try {
      await api.remove(id);
      notify("Task deleted");
      navigate("/");
    } catch (err) {
      notify(err.message, "error");
      setDeleting(false);
    }
  }

  if (loading) return <Spinner label="Loading task…" />;
  if (error) {
    return error.status === 404
      ? <ErrorMessage error={{ message: "That task doesn't exist." }} />
      : <ErrorMessage error={error} onRetry={retry} />;
  }

  return (
    <article className="detail">
      <Link to="/">← Back to tasks</Link>
      <span className={`badge badge-${task.status}`}>{task.status}</span>
      <h1>{task.title}</h1>
      <p>{task.description || "No description."}</p>
      {task.priority && <p><strong>Priority:</strong> {task.priority}</p>}
      <div className="actions">
        <Link to={`/tasks/${id}/edit`} className="btn">Edit task</Link>
        <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Deleting…" : "Delete task"}
        </button>
      </div>
    </article>
  );
}
