import { ConfigProvider } from "antd";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./features/landing/pages/LandingPage";

const neoBrutalismTheme = {
  token: {
    colorPrimary: '#F05A4A', // Coral Red
    colorInfo: '#2A8B9D', // Teal Blue
    colorTextBase: '#1D2A3A', // Dark Navy
    colorBgBase: '#F4F3EE', // Off-White
    borderRadius: 999, // Soft brutalism pill exception
    lineWidth: 3,
    colorBorder: '#000000',
    boxShadow: '6px 6px 0px 0px #000000',
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  components: {
    Button: {
      controlHeight: 48,
      fontWeight: 'bold',
      defaultBg: '#ffffff',
      defaultColor: '#1D2A3A',
      primaryColor: '#ffffff',
    },
    Input: {
      controlHeight: 48,
    }
  }
};

function App() {
  return (
    <ConfigProvider theme={neoBrutalismTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
