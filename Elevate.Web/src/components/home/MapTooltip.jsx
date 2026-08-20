/**
 * @file MapTooltip.jsx
 * @description 한국 지도 위에 표시되는 교육청 이름 툴팁 컴포넌트.
 *
 * `tooltip` prop의 `x/y` 좌표는 mapContainer 요소 기준 상대 위치이며,
 * CSS `transform: translate(-50%, -100%)`로 핀 위쪽 중앙에 정렬된다.
 */

/**
 * 지도 핀 위에 표시되는 툴팁 컴포넌트.
 *
 * @param {Object} props
 * @param {{ visible: boolean, x: number, y: number, text: string }} props.tooltip - 툴팁 표시 상태와 좌표
 * @returns {JSX.Element}
 */
const MapTooltip = ({ tooltip }) => {
    return (
        <div
            id="tooltip"
            className={`map-tooltip ${tooltip.visible ? 'is-visible' : ''}`}
            style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: 'translate(-50%, -100%)'
            }}
        >
            <div className="map-tooltip-inner">
                <div className="map-tooltip-row">
                    <span className="map-tooltip-ping">
                        <span className="map-tooltip-ping-ring"></span>
                        <span className="map-tooltip-ping-dot"></span>
                    </span>

                    <div className="map-tooltip-content">
                        <span className="map-tooltip-text">{tooltip.text}</span>
                        <span className="map-tooltip-subtext">포털 바로가기</span>
                    </div>
                </div>
            </div>

            <div className="map-tooltip-arrow" />
        </div>
    );
};

export default MapTooltip;