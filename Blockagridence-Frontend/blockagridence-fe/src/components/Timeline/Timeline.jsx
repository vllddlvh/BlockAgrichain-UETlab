import { useState } from 'react';
import './Timeline.css';

export default function Timeline({ events = [], batch }) {
  const [activeStep, setActiveStep] = useState(0);

  if (!events || events.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d', background: '#f8f9fa', borderRadius: '8px' }}>Chưa có nhật ký/sự kiện nào được ghi nhận cho lô hàng này.</div>;
  }

  // Format events to timelineData
  const timelineData = events.map(event => {
    let details = [];
    if (event.metadata) {
       try {
         const metaObj = typeof event.metadata === 'string' ? JSON.parse(event.metadata) : event.metadata;
         details = Object.entries(metaObj).map(([key, value]) => ({ 
           // Convert key to display friendly (optional, for now just capitalize)
           label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), 
           value: String(value) 
         }));
       } catch(e) {
         console.warn("Could not parse metadata");
       }
    }
    
    // Xử lý tọa độ
    let locationStr = 'Chưa xác định tọa độ GPS';
    if (event.gpsLatitude && event.gpsLongitude) {
        locationStr = `${event.gpsLatitude}, ${event.gpsLongitude}`;
    }

    // Mapping Event Type ra tiếng Việt
    const eventTypeMap = {
      'PLANTING': 'Khởi tạo / Xuống giống',
      'HARVEST': 'Thu hoạch',
      'PACKAGE': 'Đóng gói',
      'TRANSPORT': 'Vận chuyển',
      'RECEIVE': 'Nhập kho',
      'SELL': 'Lên kệ xuất bán'
    };

    return {
      role: event.createdByOrg?.name || 'Hệ thống',
      title: eventTypeMap[event.eventType] || event.eventType,
      date: new Date(event.createdAt).toLocaleString('vi-VN'),
      location: locationStr,
      details: details,
      hash: event.onchainHash || 'Đang chờ block...',
      status: event.onchainHash ? 'verified' : 'pending',
      imageCids: event.imageCids || []
    };
  });

  return (
    <div className="timeline-container">
      {timelineData.map((item, index) => (
        <div 
          key={index} 
          className={`timeline-item ${activeStep === index ? 'active' : ''}`}
          onClick={() => setActiveStep(index)}
        >
          <div className="timeline-marker">
            <div className={`marker-circle ${item.status}`}></div>
            {index < timelineData.length - 1 && <div className="marker-line"></div>}
          </div>
          
          <div className="timeline-content card-panel">
            <div className="item-header">
              <span className="role-badge">{item.role}</span>
              <span className="date-text">{item.date}</span>
            </div>
            <h4>{item.title}</h4>
            <div className="location-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{item.location}</span>
            </div>
            
            {item.details && item.details.length > 0 && (
              <div className="details-grid">
                {item.details.map((detail, idx) => (
                  <div className="detail-item" key={idx}>
                    <span className="detail-label">{detail.label}:</span>
                    <span className="detail-value">{detail.value}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Hiển thị hình ảnh nếu có */}
            {item.imageCids && item.imageCids.length > 0 && (
              <div className="event-images" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                {item.imageCids.map((cid, idx) => (
                  <img 
                    key={idx}
                    src={`https://ipfs.io/ipfs/${cid}`} 
                    alt="Event" 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                ))}
              </div>
            )}

            <div className="tx-hash" style={{ marginTop: '15px' }}>
              <span>Tx Hash:</span>
              <code style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{item.hash}</code>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
