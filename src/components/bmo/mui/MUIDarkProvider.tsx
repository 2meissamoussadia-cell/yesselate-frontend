"use client";

/**
 * MUIDarkProvider — ThemeProvider MUI en mode sombre pour les zones BMO utilisant MUI.
 */

import { useState, createContext, useContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const DarkModeContext = createContext<{ toggle: () => void }>({ toggle: () => {} });

export function useDarkModeToggle() {
  return useContext(DarkModeContext);
}

export function MUIDarkProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);

  const theme = createTheme({
    palette: {
      mode: dark ? "dark" : "light",
    },
  });

  return (
    <DarkModeContext.Provider value={{ toggle: () => setDark((d) => !d) }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </DarkModeContext.Provider>
  );
}
