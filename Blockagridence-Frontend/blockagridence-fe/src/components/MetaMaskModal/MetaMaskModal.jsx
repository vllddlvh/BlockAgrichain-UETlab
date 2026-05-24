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

export default function MetaMaskModal({ isOpen, onClose, onSignSuccess, onSignError, batchId, onchainHash }) {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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

    if (!batchId || !onchainHash) {
      setError('Thiếu mã lô hàng hoặc hash để lưu lên blockchain.');
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
      const tx = await contract.storeHash(batchId, onchainHash);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      setIsSigning(false);
      onSignSuccess(receipt.hash); // Return transaction hash to the caller
      
    } catch (err) {
      console.error("MetaMask Error Object:", err);
      setIsSigning(false);
      
      let errorMsg = 'Giao dịch bị từ chối hoặc có lỗi xảy ra.';
      if (err.code === 4001) {
        errorMsg = 'Bạn đã từ chối giao dịch trong MetaMask.';
      } else if (err.error && err.error.message) {
        errorMsg = err.error.message;
      } else if (err.info && err.info.error && err.info.error.message) {
        errorMsg = err.info.error.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      // Hướng dẫn fix lỗi lệch nonce của mạng cục bộ Hardhat
      if (typeof errorMsg === 'string' && (errorMsg.includes('too many errors') || errorMsg.includes('nonce') || errorMsg.includes('could not coalesce error'))) {
        errorMsg = (
          <span>
            <b>Lỗi đồng bộ mạng cục bộ:</b> {errorMsg.substring(0, 100)}...
            <br/><br/>
            <i>Cách sửa: Mở MetaMask &gt; Cài đặt &gt; Nâng cao &gt; <b>Xóa dữ liệu hoạt động</b> (Clear activity tab data) để reset nonce, sau đó tải lại trang và thử lại.</i>
          </span>
        );
      }

      setError(errorMsg);
      if (onSignError) onSignError(err);
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
