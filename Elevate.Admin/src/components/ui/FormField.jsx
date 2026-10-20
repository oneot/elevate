function FormField({ label, hint, error, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13.5px] font-semibold text-[#424245]">{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-[#c50f1f]" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-[12.5px] leading-relaxed text-[#86868b]">{hint}</p>
      ) : null}
    </div>
  )
}

export default FormField
