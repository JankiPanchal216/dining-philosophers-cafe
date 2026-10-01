export default function PageHeader({ module, title, subtitle, status }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-theme-border pb-6">
      <div>
        <div className="text-sm font-bold text-theme-primary tracking-widest uppercase mb-2">
          {module}
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {title}
        </h1>
        <p className="text-theme-textMuted text-lg">
          {subtitle}
        </p>
      </div>
      
      <div className="bg-theme-bg border border-theme-border rounded-full px-4 py-2 text-sm font-mono font-medium text-theme-text flex items-center shadow-sm">
        {status}
      </div>
    </div>
  );
}
