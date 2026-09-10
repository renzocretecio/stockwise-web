export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">
          You&apos;re offline
        </h1>

        <p className="mt-2 text-muted-foreground">
          This page isn&apos;t available offline yet.
          You can still navigate to previously loaded StockWise pages.
        </p>
      </div>
    </div>
  );
}