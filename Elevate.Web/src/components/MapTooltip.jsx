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