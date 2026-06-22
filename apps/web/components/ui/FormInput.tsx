"use client";
import { useController } from "react-hook-form";
import GlobalText from "./GlobalText";
import React, { useState } from "react";

interface DropdownItem {
  label: string;
  value: string;
}

interface Props {
  name: string;
  control: any;
  label?: string;
  type: "text" | "password" | "dropdown" | "textarea";
  placeholder?: string;
  dropdownItems?: DropdownItem[];
  searchable?: boolean;
  multiple?: boolean; // فقط برای dropdown
  className?: string;
}

export default function FormInput({
  name,
  control,
  label,
  type,
  placeholder,
  dropdownItems = [],
  searchable,
  multiple,
  className,
}: Props) {
  const { field, fieldState } = useController({ name, control });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredItems = dropdownItems.filter(
    (item) => !search || item.label.includes(search),
  );

  const toggleItem = (value: string) => {
    if (!multiple) {
      field.onChange(value);
      setOpen(false);
      return;
    }
    const current: string[] = field.value || [];
    if (current.includes(value)) {
      field.onChange(current.filter((v) => v !== value));
    } else {
      field.onChange([...current, value]);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <GlobalText className="text-sm font-bold mb-1">{label}</GlobalText>
      )}

      {type === "text" && (
        <input
          {...field}
          placeholder={placeholder}
          className="w-full border rounded py-2 px-3 bg-[var(--color-primary)] border-[var(--color-border)] text-[var(--color-text)]"
        />
      )}

      {type === "password" && (
        <input
          type="password"
          {...field}
          placeholder={placeholder}
          className="w-full border rounded py-2 px-3 bg-[var(--color-primary)] border-[var(--color-border)] text-[var(--color-text)] placeholder:text-gray-400"
        />
      )}

      {type === "dropdown" && (
        <div className="relative">
          {/* دکمه بازکننده */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full border rounded py-2 px-3 text-right bg-[var(--color-primary)] border-[var(--color-border)] text-[var(--color-text)]"
          >
            {multiple
              ? field.value?.length
                ? `${field.value.length} مورد انتخاب شده`
                : placeholder
              : field.value || placeholder}
          </button>

          {open && (
            <div className="absolute z-20 mt-1 w-full rounded-md bg-[var(--color-dropdownBackground)] border border-[var(--color-border)] shadow-lg">
              {searchable && (
                <input
                  autoFocus
                  placeholder="جستجو..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-2 border-b border-[var(--color-border)] bg-transparent text-[var(--color-text)] placeholder:text-gray-400"
                />
              )}
              <ul className="max-h-60 overflow-auto">
                {filteredItems.map((item) => (
                  <li
                    key={item.value}
                    onClick={() => toggleItem(item.value)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[var(--color-optionBackground)] text-[var(--color-text)]`}
                  >
                    <span>{item.label}</span>
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={field.value?.includes(item.value)}
                        readOnly
                        className="ml-2"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {type === "textarea" && (
        <textarea
          {...field}
          placeholder={placeholder}
          rows={3}
          className="w-full border rounded py-2 px-3 bg-[var(--color-textBackground)] border-[var(--color-border)] text-[var(--color-text)]"
        />
      )}

      {fieldState.error && (
        <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
      )}
    </div>
  );
}
