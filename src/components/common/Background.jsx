const Background = ({ 
  children, 
  className = "", 
  bgColor = "bg-gradient-to-br from-primary-50 to-primary-100",
  fullHeight = true
}) => {
  return (
    <div 
      className={`w-full relative z-0 ${bgColor} bg-cover bg-center ${fullHeight ? 'min-h-screen' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default Background;