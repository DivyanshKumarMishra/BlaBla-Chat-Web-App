function Button({
  label = '',
  type = 'button',
  className = '',
  textColor = 'bg-indigo-500 hover:bg-indigo-700',
  ...props
}) {
  return (
    <button
      type={type}
      className={`rounded  p-2 text-md font-semibold text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${textColor} ${className}`}
      {...props}
    >
      {label}
    </button>
  );
}

export default Button;
