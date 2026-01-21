const Card = ({ children, className = '', hover = true, glass = false }) => {
    const baseClasses = glass ? 'card-glass' : 'card';
    const hoverClasses = hover ? 'hover:transform hover:-translate-y-1' : '';

    return (
        <div className={`${baseClasses} ${hoverClasses} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
