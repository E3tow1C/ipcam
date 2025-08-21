interface FormInputProps {
  id: string;
  label: string;
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function FormInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  className = ''
}: FormInputProps) {
  return (
    <>
      <label className="block text-gray-500 text-sm mb-1 mt-4 ml-1" htmlFor={id}>
        {label}
      </label>
      <input
        className={`bg-gray-50 border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${className}`}
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
      />
    </>
  );
}