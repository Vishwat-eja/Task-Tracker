import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import useFetch from "../hooks/useFetch";
import { useNotify } from "../context/NotificationContext";
import { Spinner, ErrorMessage } from "../components/Status";

const EMPTY = { title: "", description: "", status: "todo", priority: "medium" };

function validate(v) {
  const errors = {};
  const title = v.title.trim();
  if (!title) errors.title = "Enter a title.";
  else if (title.length < 3) errors.title = "Title must be at least 3 characters.";
  else if (title.length > 100) errors.title = "Title must be 100 characters or fewer.";
  if (v.description.length > 500) errors.description = "Description must be 500 characters or fewer.";
  if (!["todo", "in-progress", "done"].includes(v.status)) errors.status = "Choose a status.";
  return errors;
}

export default function TaskForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const notify = useNotify();

  const { data: existing, loading, error, retry } = useFetch(
    () => (isEdit ? api.get(id) : Promise.resolve(EMPTY)), [id]
  );
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (existing) setValues({ ...EMPTY, ...existing });
  }, [existing]);

  const change = (e) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    if (errors[e.target.name]) setErrors(validate(next));
  };

  async function submit(e) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setSubmitError("");
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      status: values.status,
      priority: values.priority,
    };
    try {
      const saved = isEdit ? await api.update(id, payload) : await api.create(payload);
      notify(isEdit ? "Changes saved" : "Task created");
      const newId = saved?.id ?? saved?._id ?? id;
      navigate(newId ? `/tasks/${newId}` : "/");
    } catch (err) {
      setSubmitError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading task…" />;
  if (error) return <ErrorMessage error={error} onRetry={retry} />;

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h1>{isEdit ? "Edit task" : "New task"}</h1>

      <label>Title
        <input name="title" value={values.title} onChange={change} aria-invalid={!!errors.title} />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </label>

      <label>Description
        <textarea name="description" rows="4" value={values.description}
          onChange={change} aria-invalid={!!errors.description} />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </label>

      <div className="row">
        <label>Status
          <select name="status" value={values.status} onChange={change}>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
          {errors.status && <span className="field-error">{errors.status}</span>}
        </label>
        <label>Priority
          <select name="priority" value={values.priority} onChange={change}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      {submitError && <div className="error-box" role="alert">{submitError}</div>}

      <div className="actions">
        <button className="btn" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create task"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </form>
  );
}
