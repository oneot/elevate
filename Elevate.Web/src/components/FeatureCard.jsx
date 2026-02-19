import { Link } from 'react-router-dom';

/**
 * 주요 기능을 소개하는 재사용 가능한 카드 컴포넌트
 * 
 * @param {Object} props
 * @param {string} props.title - 카드 제목
 * @param {string} props.description - 카드 설명
 * @param {string} props.icon - 아이콘 이미지 경로 또는 emoji 문자열
 * @param {('image'|'emoji')} props.iconType - 아이콘 타입 ('image' 또는 'emoji')
 * @param {string} props.to - 라우팅 경로
 * @param {('orange'|'blue'|'indigo'|'green'|'emerald'|'violet'|'slate')} props.colorScheme - 색상 테마
 * @param {string} [props.ctaLabel='더 알아보기 →'] - CTA 버튼 텍스트
 * @param {string} props.ariaLabel - 접근성을 위한 aria-label
 * @param {string} [props.iconSize='w-10 h-10'] - 이미지 아이콘 크기 (iconType이 'image'일 때만 적용)
 */
const FeatureCard = ({ 
    title, 
    description, 
    icon, 
    iconType = 'image',
    to, 
    colorScheme, 
    ctaLabel = '더 알아보기 →', 
    ariaLabel,
    iconSize = 'w-10 h-10'
}) => {
    // 색상 스키마 매핑 (Tailwind JIT를 위해 전체 클래스명 사용)
    const colorSchemes = {
        orange: {
            gradient: 'bg-gradient-to-br from-white to-orange-50',
            shadow: 'shadow-orange-100',
            titleColor: 'text-slate-800',
            ctaColor: 'text-orange-600'
        },
        blue: {
            gradient: 'bg-gradient-to-br from-white to-blue-50',
            shadow: 'shadow-blue-100',
            titleColor: 'text-slate-900',
            ctaColor: 'text-ms-blue'
        },
        indigo: {
            gradient: 'bg-gradient-to-br from-white to-indigo-50',
            shadow: 'shadow-indigo-100',
            titleColor: 'text-indigo-700',
            ctaColor: 'text-indigo-600'
        },
        green: {
            gradient: 'bg-gradient-to-br from-white to-green-50',
            shadow: 'shadow-green-100',
            titleColor: 'text-green-700',
            ctaColor: 'text-green-600'
        },
        emerald: {
            gradient: 'bg-gradient-to-br from-white to-emerald-50',
            shadow: 'shadow-emerald-100',
            titleColor: 'text-emerald-700',
            ctaColor: 'text-emerald-600'
        },
        violet: {
            gradient: 'bg-gradient-to-br from-white to-violet-50',
            shadow: 'shadow-violet-100',
            titleColor: 'text-violet-700',
            ctaColor: 'text-violet-600'
        },
        slate: {
            gradient: 'bg-gradient-to-br from-white to-slate-100',
            shadow: 'shadow-md',
            titleColor: 'text-slate-800',
            ctaColor: 'text-slate-500'
        }
    };

    const colors = colorSchemes[colorScheme] || colorSchemes.blue;

    return (
        <Link 
            to={to} 
            aria-label={ariaLabel} 
            className="card-link block h-full touch-manipulation col-span-1 row-span-1"
        >
            <div className={`reveal-card clean-card rounded-[2rem] p-5 sm:p-6 group fade-in-section h-full flex flex-col justify-between ${colors.gradient} shadow-soft hover:shadow-hover transition-all duration-300`}>
                <div>
                    <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg ${colors.shadow} border border-white ${iconType === 'emoji' ? 'text-3xl' : ''} transition-all duration-300 ease-out group-hover:scale-105 sm:group-hover:scale-110 ${iconType === 'emoji' ? 'group-hover:-translate-y-0.5 group-hover:bg-slate-50' : ''}`}>
                        {iconType === 'emoji' ? (
                            icon
                        ) : (
                            <img 
                                src={icon} 
                                alt={title} 
                                className={`${iconSize} group-hover:scale-110 transition-transform`} 
                            />
                        )}
                    </div>
                    <h3 className={`text-xl font-bold ${colors.titleColor}`}>{title}</h3>
                    <p className="text-sm text-slate-500" dangerouslySetInnerHTML={{ __html: description }} />
                </div>
                <div className={`card-cta mt-4 sm:mt-0 ${colors.ctaColor} text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0`}>
                    {ctaLabel}
                </div>
            </div>
        </Link>
    );
};

export default FeatureCard;
