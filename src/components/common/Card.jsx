import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6', 
  bgColor = 'bg-white', 
  rounded = 'rounded-lg',
  shadow = 'shadow-lg',
  border = '',
  width = 'w-full',
  height = 'h-auto'
}) => {
  return (
    <div className={`${bgColor} ${width} ${height} ${padding} ${rounded} ${shadow} ${border} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
