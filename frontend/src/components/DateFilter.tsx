interface DateFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max?: string;
  onClear: () => void;
}

export default function DateFilter({ label, value, onChange, max, onClear }: DateFilterProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 mb-1">{label}</p>
        <button className="text-blue-500 hover:underline" onClick={onClear}>
          Clear
        </button>
      </div>
      <input
        type="datetime-local"
        className="border w-full appearance-none border-gray-300 rounded-md px-2 py-2 cursor-pointer hover:bg-gray-50 transition-all focus:outline-none"
        max={max}
        onChange={(e) => onChange(e.target.value)}
        value={value}
      />
    </div>
  );
}