function FormField({ label, hint, error, children }) {
  return (
    <div className="space-y-1.5 flex flex-col">
      <label className="text-sm font-semibold text-neutral-800">{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-[#d13438] flex items-center gap-1 mt-1">
          <span className="font-bold">⚠</span> {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-neutral-500 mt-1">{hint}</p>
      ) : null}
    </div>
  )
}

export default FormField
