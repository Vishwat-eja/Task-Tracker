# Task Tracker – React frontend

React + Vite + React Router client for a REST API (tasks resource). Features: list / detail / create / edit pages, loading and error states, client-side form validation, responsive layout, light/dark theme.

## Run it

```bash
npm install
cp .env.example .env     # then edit VITE_API_URL
npm run dev              # http://localhost:5173
npm run build            # production build in dist/
```

## Pointing it at your API

1. Set `VITE_API_URL` in `.env` to your API's base URL (e.g. `http://localhost:3000/api`). Restart `npm run dev` after changing it.
2. In `src/api.js`, set `RESOURCE` to your collection path (default `/tasks`).
3. Your API needs: `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`. Responses may be bare JSON or wrapped as `{ "data": ... }`; ids may be `id` or `_id`.
4. The default fields are `title`, `description`, `status` (`todo` | `in-progress` | `done`) and `priority`. To use different fields, edit `src/pages/TaskForm.jsx` (form + `validate`), and the display in `TaskList.jsx` / `TaskDetail.jsx`.
5. If the browser reports a CORS error, enable CORS on your API for `http://localhost:5173`.

## Structure

```
src/
  api.js                      fetch wrapper + ApiError
  hooks/useFetch.js           loading / error / data hook
  context/NotificationContext toast messages (useContext)
  components/                 Layout, Spinner, ErrorMessage
  pages/                      TaskList, TaskDetail, TaskForm (create + edit), NotFound
```

## Testing failure states

Stop your backend and reload: the list page shows an error message with a "Try again" button instead of a blank screen.
