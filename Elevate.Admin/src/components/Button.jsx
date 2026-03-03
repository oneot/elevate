const styles = {
  primary: 'bg-ms-blue text-white hover:bg-[#005a9e] shadow-elevation-2 hover:shadow-elevation-4',
  success: 'bg-ms-green text-white hover:bg-[#0b5a0b] shadow-elevation-2 hover:shadow-elevation-4',
  secondary: 'bg-white text-neutral-900 border border-black/10 hover:bg-black/5 shadow-elevation-2',
  ghost: 'text-neutral-700 bg-transparent hover:bg-black/5 hover:text-neutral-900',
}

function Button({ variant = 'primary', type = 'button', className = '', disabled = false, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ms-blue focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  )
}

export default Button
