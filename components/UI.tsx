
import React from 'react';
import { useTheme } from './ThemeContext';

export const Card = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => {
  const { themeClasses } = useTheme();
  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${themeClasses.card} ${className}`}>
      {children}
    </div>
  );
};

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  type = 'button',
  disabled = false
}: { 
  children?: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'success'; 
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}) => {
  const { themeClasses } = useTheme();
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantStyle = "";
  if (variant === 'primary') variantStyle = themeClasses.buttonPrimary;
  else if (variant === 'secondary') variantStyle = themeClasses.buttonSecondary;
  else if (variant === 'danger') variantStyle = "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500";
  else if (variant === 'success') variantStyle = "bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-500";

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variantStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export const Input = ({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder = "",
  required = false
}: { 
  label: string; 
  value: string | number; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
  type?: string; 
  placeholder?: string;
  required?: boolean;
}) => {
  const { themeClasses, colors } = useTheme();
  return (
    <div className="flex flex-col space-y-1">
      <label className={`text-sm font-medium ${colors.textMain}`}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`px-3 py-2 border rounded-lg outline-none transition-all ${themeClasses.input}`}
      />
    </div>
  );
};

export const Select = ({
  label,
  value,
  onChange,
  options,
  required = false
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) => {
  const { themeClasses, colors, isDark } = useTheme();
  return (
    <div className="flex flex-col space-y-1">
      <label className={`text-sm font-medium ${colors.textMain}`}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`px-3 py-2 border rounded-lg outline-none transition-all ${themeClasses.input}`}
      >
        <option value="" disabled className={isDark ? "text-slate-500 bg-slate-900" : "text-gray-500"}>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className={isDark ? "text-gray-200 bg-slate-900" : "text-gray-900 bg-white"}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const PageHeader = ({ title, description }: { title: string; description?: string }) => {
  const { colors } = useTheme();
  return (
    <div className="mb-6">
      <h2 className={`text-2xl font-bold ${colors.textMain}`}>{title}</h2>
      {description && <p className={`mt-1 ${colors.textMuted}`}>{description}</p>}
    </div>
  );
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  if (!isOpen) return null;
  const { themeClasses, colors } = useTheme();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className={`rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 ${themeClasses.card} bg-white dark:bg-slate-900`}>
        <h3 className={`text-lg font-bold mb-2 ${colors.textMain}`}>{title}</h3>
        <p className={`mb-6 ${colors.textMuted}`}>{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
};
