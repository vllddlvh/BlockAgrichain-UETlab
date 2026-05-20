import { useState } from 'react';
import { ethers } from 'ethers';
import './MetaMaskModal.css';

// TODO: Replace with the actual deployed contract address on your network
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

const CONTRACT_ABI = [
  "function storeHash(string calldata batchId, string calldata dataHash) external"
];

export default function MetaMaskModal({ isOpen, onClose, onSignSuccess, batchId, onchainHash }) {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSign = async () => {
    setError('');
    
    if (!window.ethereum) {
      setError('Vui lòng cài đặt ví MetaMask trên trình duyệt của bạn!');
      return;
    }

    try {
      setIsSigning(true);
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Use ethers v6 BrowserProvider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Call the storeHash function on the Smart Contract
      const tx = await contract.storeHash(batchId, onchainHash);
      
      // Wait for the transaction to be mined
      await tx.wait();
      
      setIsSigning(false);
      onSignSuccess(tx.hash); // Return transaction hash to the caller
      
    } catch (err) {
      console.error(err);
      setIsSigning(false);
      setError(err.reason || err.message || 'Giao dịch bị từ chối hoặc có lỗi xảy ra.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="metamask-modal">
        <div className="modal-header">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
            alt="MetaMask" 
            width="32" 
            height="32"
          />
          <h3>Ký Giao Dịch (MetaMask)</h3>
        </div>
        
        <div className="modal-body">
          <p className="warning-text">Bạn đang yêu cầu ký một giao dịch để đẩy Hash của Lô hàng lên mạng lưới Blockchain.</p>
          
          <div className="tx-details">
            <div className="detail-row">
              <span>Mã Lô hàng:</span>
              <strong>{batchId}</strong>
            </div>
            <div className="detail-row">
              <span>Hành động:</span>
              <strong>storeHash()</strong>
            </div>
            <div className="detail-row hash-data">
              <span>Data Hash (SHA-256):</span>
              <code>{onchainHash}</code>
            </div>
          </div>
          
          {error && <div className="error-text" style={{color: 'red', marginTop: '10px'}}>{error}</div>}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose} disabled={isSigning}>Từ chối</button>
          <button className="btn-confirm" onClick={handleSign} disabled={isSigning}>
            {isSigning ? 'Đang Ký...' : 'Ký (Sign & Send)'}
          </button>
        </div>
      </div>
    </div>
  );
}
