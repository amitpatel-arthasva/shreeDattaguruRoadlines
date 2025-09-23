import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const FeatureCard = ({ 
  children,
  title = "Feature Title",
  icon,
  className = "",
  bgColor = "bg-[#C599B6]",
  iconBgColor = "bg-[#FFF7F3]",
  iconTextColor = "text-[#C599B6]",
  width = "w-full max-w-xs sm:max-w-sm",
  height = "h-auto min-h-[12rem] sm:min-h-[14rem]",
  padding = "p-4 sm:p-6",
  rounded = "rounded-xl sm:rounded-2xl",
  iconSize = "w-16 h-16 sm:w-20 sm:h-20",
  onClick,
  onIconClick
}) => {
  const handleIconClick = (e) => {
    e.stopPropagation();
    if (onIconClick) {
      onIconClick();
    }
  };

  return (
    <div className={`relative ${bgColor} ${width} ${height} ${padding} ${rounded} shadow-lg ${className} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      {/* Icon Button */}
      {icon && (
        <div
          className={`absolute -top-3 -left-3 sm:-top-4 sm:-left-4 ${iconSize} ${iconBgColor} ${rounded} flex items-center justify-center shadow-md ${onIconClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
          onClick={handleIconClick}
        >
          <FontAwesomeIcon 
            icon={icon} 
            className={`text-xl sm:text-3xl ${iconTextColor}`}
          />
        </div>
      )}

      {/* Title */}
      {title && (
        <h2 className={`text-2xl sm:text-2x1 font-bold text-white text-center ${icon ? 'mt-5 sm:mt-8' : 'mt-0'} mb-3`}>
          {title}
        </h2>
      )}

      {/* Children Content */}
      <div className="text-[#47034b]/90 text-sm sm:text-base">
        {children}
      </div>
    </div>
  );
};

export default FeatureCard;
