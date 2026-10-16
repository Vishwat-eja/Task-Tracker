// Single place that talks to the backend.
// Compatible with the TaskFlow REST API and standard task endpoints.
const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const RESOURCE = "/tasks";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Map status between frontend ('todo', 'in-progress', 'done') and backend ('pending', 'in_progress', 'completed')
const STATUS_TO_BACKEND = {
  todo: "pending",
  "in-progress": "in_progress",
  done: "completed",
};

const STATUS_TO_FRONTEND = {
  pending: "todo",
  in_progress: "in-progress",
  completed: "done",
};

function normalizeTask(task) {
  if (!task || typeof task !== "object") return task;
  return {
    ...task,
    status: STATUS_TO_FRONTEND[task.status] || task.status || "todo",
  };
}

function mapPayload(data) {
  if (!data || typeof data !== "object") return data;
  const mapped = { ...data };
  if (mapped.status) {
    mapped.status = STATUS_TO_BACKEND[mapped.status] || mapped.status;
  }
  return mapped;
}

let cachedToken = typeof window !== "undefined" ? localStorage.getItem("taskflow_auth_token") : null;

async function getOrFetchToken() {
  if (cachedToken) return cachedToken;
  try {
    const apiBase = BASE_URL.replace(/\/tasks$/, "");
    const loginRes = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "live_tester",
        password: "password123",
      }),
    });
    const loginData = await loginRes.json();
    if (loginData?.data?.token) {
      cachedToken = loginData.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("taskflow_auth_token", cachedToken);
      }
      return cachedToken;
    }
  } catch {
    // If backend is unreachable or not using auth
  }
  return null;
}

async function request(path = "", options = {}, retryOn401 = true) {
  const token = await getOrFetchToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}${RESOURCE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check that the API is running and VITE_API_URL is correct.", 0);
  }

  if (res.status === 401 && retryOn401) {
    cachedToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("taskflow_auth_token");
    }
    const freshToken = await getOrFetchToken();
    if (freshToken) {
      return request(path, options, false);
    }
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.message || body.error || "";
    } catch { /* body wasn't JSON */ }
    throw new ApiError(detail || `Request failed (${res.status}).`, res.status);
  }

  return res.status === 204 ? null : res.json();
}

// Accept either a bare array/object or a wrapper like { success: true, data: { tasks: [...] } } or { data: ... }
const unwrap = (body) => {
  if (!body) return body;
  if (body?.data?.tasks && Array.isArray(body.data.tasks)) {
    return body.data.tasks.map(normalizeTask);
  }
  if (body?.data?.task && typeof body.data.task === "object") {
    return normalizeTask(body.data.task);
  }
  if (Array.isArray(body?.data)) {
    return body.data.map(normalizeTask);
  }
  if (Array.isArray(body)) {
    return body.map(normalizeTask);
  }
  if (body?.data && typeof body.data === "object") {
    return normalizeTask(body.data);
  }
  return normalizeTask(body);
};

export const api = {
  list: async () => unwrap(await request()),
  get: async (id) => unwrap(await request(`/${id}`)),
  create: async (data) => unwrap(await request("", { method: "POST", body: JSON.stringify(mapPayload(data)) })),
  update: async (id, data) => unwrap(await request(`/${id}`, { method: "PUT", body: JSON.stringify(mapPayload(data)) })),
  remove: (id) => request(`/${id}`, { method: "DELETE" }),
};

// Support APIs that use `_id` (MongoDB) or `id`.
export const getId = (item) => item.id ?? item._id;
