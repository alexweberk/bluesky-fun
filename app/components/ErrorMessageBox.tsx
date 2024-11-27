export function ErrorMessageBox({ error }: { error: string }) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
      <h2 className="text-2xl font-semibold text-red-800 mb-4">
        Oops! Something went wrong
      </h2>
      <p className="text-red-600">{error}</p>
    </div>
  );
}
