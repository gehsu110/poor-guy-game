import { createContext } from "react";

// Keep provider and consumers on the same context during Vite Fast Refresh.
export const AppContext = createContext(null);
