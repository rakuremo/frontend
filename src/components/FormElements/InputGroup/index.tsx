"use client";
import React, { ChangeEvent, useState } from "react";

interface InputGroupProps {
  customClasses?: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  name: string;
  value?: string; 
  icon?: React.ReactNode;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const InputGroup: React.FC<InputGroupProps> = ({
  customClasses,
  label,
  type,
  placeholder,
  required,
  disabled,
  name,
  value, 
  icon, 
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={customClasses}>
      <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {label}
        {required && <span className="text-red">*</span>}
      </label>
      <div className="relative">
        {icon && <span className="absolute left-4 top-3.5">{icon}</span>}
        <input
          type={type === "password" && showPassword ? "text" : type}
          placeholder={placeholder}
          name={name}
          value={value} // Sử dụng value
          onChange={onChange}
          className={`w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${icon ? 'pl-12' : ''}`}
          required={required}
          disabled={disabled}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-4 top-3.5"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-dark dark:text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13.875 18.825A8.12 8.12 0 0112 19c-5 0-9-5-9-7.5 0-1.01 1.388-2.71 3.627-4.217M20.372 5.785A9.892 9.892 0 0121 9.5c0 2.5-4 7.5-9 7.5a9.956 9.956 0 01-2.162-.255" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M4.271 4.271l15.458 15.458" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-dark dark:text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7S1 12 1 12z" />
                <path d="M12 5a7 7 0 110 14 7 7 0 010-14z" />
                <path d="M12 9a3 3 0 110 6 3 3 0 010-6z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputGroup;
