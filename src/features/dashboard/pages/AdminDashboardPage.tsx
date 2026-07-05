import { Users, CreditCard, Layers, Hash } from 'lucide-react';

export function AdminDashboardPage() {
  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-geist-gray-1000">
          Dashboard
        </h1>
        <p className="text-geist-gray-700 mt-2 text-sm">
          System overview and high-level metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="flex flex-col p-5 border border-geist-gray-400 rounded-lg bg-geist-bg-100 shadow-sm">
          <div className="flex items-center gap-2 text-geist-gray-700 mb-3">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Total Users</span>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-geist-gray-1000">
            1,250
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col p-5 border border-geist-gray-400 rounded-lg bg-geist-bg-100 shadow-sm">
          <div className="flex items-center gap-2 text-geist-gray-700 mb-3">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Monthly Revenue</span>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-geist-gray-1000">
            45M <span className="text-xl text-geist-gray-700 font-normal">VND</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex flex-col p-5 border border-geist-gray-400 rounded-lg bg-geist-bg-100 shadow-sm">
          <div className="flex items-center gap-2 text-geist-gray-700 mb-3">
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">System Decks</span>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-geist-gray-1000">
            142
          </div>
        </div>

        {/* Metric 4 */}
        <div className="flex flex-col p-5 border border-geist-gray-400 rounded-lg bg-geist-bg-100 shadow-sm">
          <div className="flex items-center gap-2 text-geist-gray-700 mb-3">
            <Hash className="w-4 h-4" />
            <span className="text-sm font-medium">Flashcards</span>
          </div>
          <div className="text-3xl font-semibold tracking-tight text-geist-gray-1000">
            15,200
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col border border-geist-gray-400 rounded-lg bg-geist-bg-100 shadow-sm p-6 min-h-[400px]">
          <h2 className="text-base font-semibold text-geist-gray-1000 mb-6">User Activity (Last 7 Days)</h2>
          <div className="flex-1 rounded-md bg-geist-gray-200 border border-geist-gray-400 border-dashed flex items-center justify-center">
            <span className="text-sm text-geist-gray-700">Chart Placeholder</span>
          </div>
        </div>
        <div className="flex flex-col border border-geist-gray-400 rounded-lg bg-geist-bg-100 shadow-sm p-6 min-h-[400px]">
          <h2 className="text-base font-semibold text-geist-gray-1000 mb-6">Subscription Distribution</h2>
          <div className="flex-1 rounded-md bg-geist-gray-200 border border-geist-gray-400 border-dashed flex items-center justify-center">
            <span className="text-sm text-geist-gray-700">Chart Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
}
