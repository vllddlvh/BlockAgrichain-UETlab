import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './CheckQR.css';

export default function CheckQR() {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Tự động clear DOM nếu component unmount
    let scanner = null;
    
    // Đảm bảo DOM element #reader đã sẵn sàng
    const initScanner = () => {
      scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      }, false);

      scanner.render(success, error);
    };

    // Delay init 1 chút để DOM kịp render
    const timer = setTimeout(initScanner, 100);

    function success(result) {
      if (scanner) {
        scanner.clear();
      }
      setScanResult(result);
      
      try {
        // Kiểm tra xem kết quả có phải là một URL đầy đủ không
        const url = new URL(result);
        if (url.origin === window.location.origin) {
           navigate(url.pathname);
        } else {
           window.location.href = result;
        }
      } catch (e) {
        // Nếu không phải URL (có thể là relative path hoặc chỉ là batchId)
        if (result.startsWith('/')) {
            navigate(result);
        } else {
            navigate(`/trace/${result}`);
        }
      }
    }

    function error(err) {
      // Bỏ qua các log lỗi liên tục do không tìm thấy QR trong khung hình
    }

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(e => console.error('Failed to clear scanner', e));
      }
    };
  }, [navigate]);

  return (
    <div className="check-qr-container">
      <div className="check-qr-header">
        <h1>Quét Mã QR Lô Hàng</h1>
        <p>Hướng camera vào mã QR để truy xuất nguồn gốc</p>
      </div>
      
      {scanResult ? (
        <div className="check-qr-success">
          <p>Quét thành công! Đang chuyển hướng...</p>
        </div>
      ) : (
        <div className="scanner-wrapper">
          <div id="reader"></div>
        </div>
      )}
    </div>
  );
}
