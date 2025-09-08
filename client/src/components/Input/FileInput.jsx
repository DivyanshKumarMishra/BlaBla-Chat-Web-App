const FileUpload = ({
  label,
  fileName = '',
  loading,
  error,
  accept = 'image/*',
  handleImageUpload = () => {},
  ...props
}) => {
  // const [fileName, setFileName] = useState('');
  const { name } = props;

  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-900 mb-2"
      >
        {label}
      </label>

      <div className="flex items-center">
        {/* Custom Choose File Button */}
        <label
          htmlFor={`${name}_file`}
          className={`cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Choose File
        </label>

        <input
          id={`${name}_file`}
          type="file"
          className="hidden"
          accept={accept}
          disabled={loading}
          onChange={handleImageUpload}
        />

        {/* Show Selected File Name */}
        <span className="ml-3 text-sm text-gray-700 truncate max-w-[200px]">
          {fileName || 'No file chosen'}
        </span>
      </div>

      {/* Hidden input for Cloudinary URL (this is what RHF tracks) */}
      <input type="hidden" {...props} />

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload;
