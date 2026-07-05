import { ConfigProvider } from "antd";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "./shared/providers/AuthProvider";
import { AppRoutes } from "./app/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfigProvider theme={neoBrutalismTheme}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
