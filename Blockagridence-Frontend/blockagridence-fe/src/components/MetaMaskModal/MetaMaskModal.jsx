import { useState } from 'react';
import { ethers } from 'ethers';
import './MetaMaskModal.css';

const CONTRACT_ADDRESS = import.meta.env.VITE_HASH_STORAGE_ADDRESS;
const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 31337);
const CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`;
const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME || 'Hardhat Local';
const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545';

const CONTRACT_ABI = [
  "function storeHash(string calldata batchId, string calldata dataHash) external"
];

export default function MetaMaskModal({ isOpen, onClose, onSignSuccess, batchId, onchainHash }) {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Fallback values in case props are not passed
  const displayBatchId = batchId || 'BATCH-UNKNOWN';
  const displayHash = onchainHash || '...';

  const ensureCorrectNetwork = async () => {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId === CHAIN_ID_HEX) {
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAIN_ID_HEX }],
      });
    } catch (switchError) {
      if (switchError.code !== 4902) {
        throw switchError;
      }

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: CHAIN_ID_HEX,
          chainName: CHAIN_NAME,
          rpcUrls: [RPC_URL],
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        }],
      });
    }
  };

  const handleSign = async () => {
    setError('');
    
    if (!window.ethereum) {
      setError('Vui lòng cài đặt ví MetaMask trên trình duyệt của bạn!');
      return;
    }

    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === ethers.ZeroAddress) {
      setError('Thiếu địa chỉ HashStorage contract. Hãy cấu hình VITE_HASH_STORAGE_ADDRESS.');
      return;
    }

    try {
      setIsSigning(true);
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await ensureCorrectNetwork();
      
      // Use ethers v6 BrowserProvider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Call the storeHash function on the Smart Contract
      const tx = await contract.storeHash(displayBatchId, displayHash);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      setIsSigning(false);
      onSignSuccess(receipt.hash); // Return transaction hash to the caller
      
    } catch (err) {
      console.error(err);
      setIsSigning(false);
      if (err.code === 4001) {
        setError('Bạn đã từ chối giao dịch trong MetaMask.');
      } else {
        setError(err.reason || err.message || 'Giao dịch bị từ chối hoặc có lỗi xảy ra.');
      }
    }
  };

  const handleBypass = () => {
    // Demo mode: Fake a successful transaction
    const fakeTxHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
    onSignSuccess(fakeTxHash);
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
              <strong>{displayBatchId}</strong>
            </div>
            <div className="detail-row">
              <span>Hành động:</span>
              <strong>storeHash()</strong>
            </div>
            <div className="detail-row hash-data">
              <span>Data Hash (SHA-256):</span>
              <code style={{ wordBreak: 'break-all' }}>{displayHash}</code>
            </div>
          </div>
          
          {error && (
            <div className="error-text" style={{ color: 'red', marginTop: '16px', background: '#fff2f0', padding: '12px', borderRadius: '8px', border: '1px solid #ffccc7' }}>
              <strong>Lỗi:</strong> {error}
              <div style={{ marginTop: '8px' }}>
                <p style={{ color: '#d9363e', fontSize: '0.9em', marginBottom: '8px' }}>
                  Nếu mạng lưới Blockchain (Hardhat) chưa chạy hoặc gặp lỗi cấu hình, bạn có thể sử dụng tính năng giả lập (Demo) để tiếp tục luồng hệ thống.
                </p>
                <button 
                  onClick={handleBypass}
                  style={{ background: '#d9363e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9em' }}
                >
                  Giả lập Ký thành công (Demo Mode)
                </button>
              </div>
            </div>
          )}
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
