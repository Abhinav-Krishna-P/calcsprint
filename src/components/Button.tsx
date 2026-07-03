import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = "primary", 
  children, 
  className = "", 
  ...props 
}) => {
  let baseStyles = "inline-flex items-center justify-center px-6 py-3 font-semibold text-sm rounded-app tracking-wide transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-app-primary disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantStyles = "";
  if (variant === "primary") {
    // Light mode: Deep Navy with white text. Dark mode: Sky blue with dark text.
    variantStyles = "bg-app-primary text-app-on-primary hover:opacity-90";
  } else if (variant === "secondary") {
    // Transparent with outline border.
    variantStyles = "border border-app-outline text-app-text bg-transparent hover:bg-app-surface-container";
  } else if (variant === "danger") {
    variantStyles = "bg-app-error text-white hover:opacity-90";
  }

  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
