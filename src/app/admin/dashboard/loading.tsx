export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="h-8 bg-muted rounded-lg w-64" />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>

      {/* Table */}
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded-lg w-48" />
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    </div>
  );
}