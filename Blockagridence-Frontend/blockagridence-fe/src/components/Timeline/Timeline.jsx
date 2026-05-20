import { useState } from 'react';
import './Timeline.css';

export default function Timeline() {
  const [activeStep, setActiveStep] = useState(0);

  const timelineData = [
    {
      role: 'Nông dân (Farmer)',
      title: 'Khởi tạo Lô hàng',
      date: '10:00 AM - 12/05/2026',
      location: 'Nông trại Đà Lạt, Lâm Đồng',
      details: [
        { label: 'Giống', value: 'Dâu tây New Zealand' },
        { label: 'Phân bón', value: 'Hữu cơ sinh học' },
        { label: 'Chứng nhận', value: 'VietGAP (Mã: VG-2026)' }
      ],
      hash: '0x8f3c...a1b2',
      status: 'verified'
    },
    {
      role: 'Đơn vị Vận chuyển',
      title: 'Nhật ký Hành trình',
      date: '14:30 PM - 12/05/2026',
      location: 'Kho trung chuyển, Đồng Nai',
      details: [
        { label: 'Nhiệt độ', value: '4°C' },
        { label: 'Độ ẩm', value: '85%' },
        { label: 'Trạng thái', value: 'Đang vận chuyển an toàn' }
      ],
      hash: '0x2a9b...f4c1',
      status: 'verified'
    },
    {
      role: 'Nhà bán lẻ',
      title: 'Lên kệ Phân phối',
      date: '08:00 AM - 13/05/2026',
      location: 'Siêu thị CoopMart, TP.HCM',
      details: [
        { label: 'Đóng gói', value: 'Hộp 500g' },
        { label: 'Trạng thái', value: 'Sẵn sàng phục vụ' }
      ],
      hash: '0x7e1d...98b3',
      status: 'pending'
    }
  ];

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
            
            <div className="details-grid">
              {item.details.map((detail, idx) => (
                <div className="detail-item" key={idx}>
                  <span className="detail-label">{detail.label}:</span>
                  <span className="detail-value">{detail.value}</span>
                </div>
              ))}
            </div>

            <div className="tx-hash">
              <span>Tx Hash:</span>
              <code>{item.hash}</code>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
