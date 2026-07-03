import { Button } from "antd";
import { Smile } from "lucide-react";

function App() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          LeLa Frontend
        </h1>
        <p className="text-gray-500">
          Vite + React + TailwindCSS 4 + Ant Design + Lucide React
        </p>
        <div className="flex justify-center py-4">
          <Smile className="h-12 w-12 text-blue-500" />
        </div>
        <Button type="primary" size="large" className="w-full">
          Bắt đầu
        </Button>
      </div>
    </div>
  );
}

export default App;
