/**
 * 지도 위에 표시되는 툴팁 컴포넌트
 * @param {Object} tooltip - 툴팁 상태 객체 { visible, x, y, text }
 */
const MapTooltip = ({ tooltip }) => {
    return (
        <div 
            id="tooltip" 
            className="absolute bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl transition-opacity pointer-events-none z-20"
            style={{
                opacity: tooltip.visible ? 1 : 0,
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                // 말풍선을 수평 중앙에 위치, 수직은 위쪽 정렬
                transform: 'translateX(-50%)',
                transition: 'opacity 0.2s ease'
            }}
        >
            <span>{tooltip.text}</span>
            {/* 화살표: 말풍선 아래쪽 중앙에 위치 */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 bg-slate-800 rotate-45"></div>
        </div>
    );
};

export default MapTooltip;
