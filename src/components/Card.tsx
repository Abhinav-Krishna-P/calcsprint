import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <div 
      className={`border border-app-outline-variant bg-app-surface p-6 md:p-8 rounded-app shadow-sm transition-all duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
