import React from 'react'
import AppRoutes from './Routes'
import { EuiProvider } from '@elastic/eui';
import "@elastic/eui/dist/eui_theme_light.css";

const App = () => {
  return (
    <EuiProvider colorMode="light">
      <AppRoutes />
    </EuiProvider>
  );
}

export default App;
