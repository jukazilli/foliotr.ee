import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  multiline?: boolean;
  className?: string;
};

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  multiline,
  className,
}: FieldProps) {
  const inputClasses =
    "mt-2 w-full rounded-lg border border-[rgba(15,17,21,0.12)] bg-white px-4 py-3 text-sm font-medium text-[var(--ft-neutral-900)] outline-none transition placeholder:text-[rgba(15,17,21,0.38)] focus:border-[var(--ft-blue-500)] focus:ring-4 focus:ring-blue-500/10";

  return (
    <label className={cn("block font-ui text-sm font-semibold", className)}>
      {label}
      {multiline ? (
        <textarea
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          rows={5}
          className={inputClasses}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={inputClasses}
        />
      )}
    </label>
  );
}
