import { Link } from 'react-router-dom';

const Logo = ({isBlog}) => {
    return (
        <Link to="/" className="flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 23 23" fill="none">
                <path d="M0 0H10.5V10.5H0V0Z" fill="#F25022"/>
                <path d="M12.5 0H23V10.5H12.5V0Z" fill="#7FBA00"/>
                <path d="M0 12.5H10.5V23H0V12.5Z" fill="#00A4EF"/>
                <path d="M12.5 12.5H23V23H12.5V12.5Z" fill="#FFB900"/>
            </svg>
            <span className="text-xl font-bold tracking-tight text-slate-800">
                Microsoft <span className="font-normal text-slate-500">Elevate {isBlog ? 'Blog' : ''}</span>
            </span>
        </Link>
    );
};

export default Logo;
