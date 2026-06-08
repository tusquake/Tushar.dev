import { Link } from 'react-router-dom';
import Logo from './Logo';

/**
 * Canonical brand lockup used consistently across the entire app.
 * 
 * Usage:
 *   <BrandLogo />                    — default size, links to /
 *   <BrandLogo size="sm" />          — smaller variant (auth pages)
 *   <BrandLogo as="div" />           — render as non-link div (e.g. footer)
 *   <BrandLogo className="mb-4" />   — extra wrapper classes
 */
const BrandLogo = ({ size = 'md', as: Tag = 'link', className = '', ...props }) => {
    const sizeMap = {
        sm: { icon: 'w-7 h-7',    text: 'text-xl' },
        md: { icon: 'w-8 h-8',    text: 'text-2xl' },
        lg: { icon: 'w-10 h-10',  text: 'text-3xl' },
    };
    const { icon, text } = sizeMap[size] || sizeMap.md;

    const inner = (
        <>
            <Logo className={`${icon} flex-shrink-0`} />
            <span className={`${text} font-display font-bold tracking-tight`}>
                <span className="text-dark-900 dark:text-white">CodeForge</span>
                <span className="gradient-text">.dev</span>
            </span>
        </>
    );

    const sharedClass = `inline-flex items-center gap-2 ${className}`;

    if (Tag === 'link') {
        return (
            <Link to="/" className={sharedClass} {...props}>
                {inner}
            </Link>
        );
    }

    return (
        <Tag className={sharedClass} {...props}>
            {inner}
        </Tag>
    );
};

export default BrandLogo;
