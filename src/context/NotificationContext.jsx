import { createContext, useCallback, useContext, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [note, setNote] = useState(null);
  const notify = useCallback((message, type = "success") => {
    setNote({ message, type });
    setTimeout(() => setNote(null), 3500);
  }, []);
  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {note && <div className={`toast toast-${note.type}`} role="status">{note.message}</div>}
    </NotificationContext.Provider>
  );
}

export const useNotify = () => useContext(NotificationContext);
