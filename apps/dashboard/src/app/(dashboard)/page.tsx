"use client"
import { CategoryMenu } from "@/components/ui/category-menu";

export default function DashboardPage() {
  return (
    <main className="flex-1 bg-[var(--bg-main)]">
      {/* Header */}
      <div className="border-b border-[var(--border-color)]">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Dashboard</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Total Emails</h3>
              <span className="text-emerald-400 bg-emerald-500/10 text-xs px-2 py-1 rounded-full">
                +12.5%
              </span>
            </div>
            <p className="text-3xl font-semibold text-[var(--text-primary)] mt-2">2,543</p>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Active Users</h3>
              <span className="text-emerald-400 bg-emerald-500/10 text-xs px-2 py-1 rounded-full">
                +8.2%
              </span>
            </div>
            <p className="text-3xl font-semibold text-[var(--text-primary)] mt-2">1,825</p>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)]">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Teams</h3>
              <span className="text-emerald-400 bg-emerald-500/10 text-xs px-2 py-1 rounded-full">
                +5.4%
              </span>
            </div>
            <p className="text-3xl font-semibold text-[var(--text-primary)] mt-2">12</p>
          </div>
        </div>
        <CategoryMenu />

        {/* Recent Activity */}
        <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
          <div className="px-6 py-4 border-b border-[var(--border-color)]">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[var(--text-tertiary)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      New email campaign created
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Campaign "Summer Newsletter" was created by John Doe
                    </p>
                  </div>
                  <div className="text-sm text-[var(--text-tertiary)]">2h ago</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}