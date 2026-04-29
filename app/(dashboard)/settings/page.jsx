"use client";
export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-header">Settings</h1>
      <div className="card">
        <p className="text-gray-600">Organization details, currency, and receipt footer can be configured here.</p>
        <p className="text-sm text-gray-400 mt-2">A full Settings UI is wired through the <code>Settings</code> Mongoose model — extend with form fields as needed.</p>
      </div>
    </div>
  );
}
