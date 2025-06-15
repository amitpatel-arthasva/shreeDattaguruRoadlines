import React from 'react';

const Button = ({ 
  text, 
  onClick, 
  className, 
  icon, 
  iconPosition = 'before', // 'before' or 'after'
  height, 
  width, 
  bgColor = '#6FFFE9', 
  hoverBgColor = '#5aebe9', 
  rounded = 'rounded' 
}) => {
  const buttonStyle = {
    backgroundColor: bgColor,
  };

  return (
    <button 
      style={buttonStyle}
      className={`text-black font-medium py-1.5 sm:py-2 px-3 sm:px-4 ${rounded} ${height || 'h-10 sm:h-12'} ${width || 'w-full sm:w-48'} 
                  hover:shadow-md hover:-translate-y-0.5 
                  active:translate-y-0 active:shadow-sm
                  transition-all duration-300 cursor-pointer flex items-center justify-center gap-1 sm:gap-2 ${className || ''}`} 
      onClick={onClick}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = hoverBgColor}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = bgColor}
    >
      {icon && iconPosition === 'before' && <span className="inline-block">{icon}</span>}
      {text}
      {icon && iconPosition === 'after' && <span className="inline-block">{icon}</span>}
    </button>
  );
};

export default Button;
