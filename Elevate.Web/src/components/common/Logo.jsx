/**
 * @file Logo.jsx
 * @description Microsoft Elevate 로고 컴포넌트.
 *
 * Microsoft 사각형 로고 SVG와 브랜드명을 표시하며, 클릭 시 홈(`/`)으로 이동한다.
 * `isBlog`가 true이면 브랜드명 뒤에 'Blog'가 추가된다.
 */
import { Link } from 'react-router-dom';

/**
 * 홈 링크가 포함된 Microsoft Elevate 로고.
 *
 * @param {Object} props
 * @param {boolean} [props.isBlog=false] - true이면 'Blog' 텍스트를 브랜드명 뒤에 표시
 * @returns {JSX.Element}
 */
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
