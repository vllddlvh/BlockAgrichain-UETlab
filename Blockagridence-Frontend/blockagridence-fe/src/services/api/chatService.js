const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `Bạn là trợ lý AI của hệ thống BlockAgrichain — nền tảng truy xuất nguồn gốc nông sản sử dụng công nghệ blockchain.

PHẠM VI TRẢ LỜI: Bạn CHỈ trả lời các câu hỏi thuộc các chủ đề sau:
1. Hướng dẫn sử dụng hệ thống BlockAgrichain (đăng ký tổ chức, tạo lô hàng, cập nhật trạng thái)
2. Blockchain: txHash, block, smart contract, hash dữ liệu, on-chain verification
3. MetaMask: cách kết nối ví, ký giao dịch, import tài khoản
4. Truy xuất nguồn gốc nông sản: quy trình từ nông trại → vận chuyển → bán lẻ
5. Trạng thái lô hàng: CREATED, GROWING, READY_FOR_SALE, IN_TRANSIT, DISTRIBUTED, DELIVERED, DEPLETED, EXPIRED
6. Xác minh tính toàn vẹn dữ liệu trên blockchain (computedHash, blockchainVerified)
7. IPFS và lưu trữ hình ảnh phi tập trung

NẾU câu hỏi không liên quan đến các chủ đề trên, hãy lịch sự từ chối và gợi ý các chủ đề bạn có thể hỗ trợ.

PHONG CÁCH: Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu cho người dùng không chuyên kỹ thuật. Dùng ví dụ thực tế khi cần thiết.`;

const RISK_PROMPT = `Cảnh báo vòng đời lô hàng là rule-based từ hệ thống với riskStatus SAFE, AT_RISK, EXPIRED; riskReasons; riskRecommendation.

VỀ CẢNH BÁO RỦI RO: Bạn KHÔNG tự tính risk, KHÔNG chấm điểm uy tín, KHÔNG quy kết trách nhiệm pháp lý, và KHÔNG đề xuất tự động đổi trạng thái lô hàng. Nếu có context riskStatus/riskReasons/riskRecommendation từ hệ thống, chỉ giải thích lại bằng ngôn ngữ dễ hiểu và gợi ý người dùng kiểm tra thêm.`;

// Rate limiting: max 10 requests per 60 seconds
const RATE_LIMIT_COUNT = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const requestTimestamps = [];

function checkRateLimit() {
  const now = Date.now();
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT_COUNT) {
    const waitSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - requestTimestamps[0])) / 1000);
    throw new Error(`Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau ${waitSec} giây.`);
  }
  requestTimestamps.push(now);
}

async function callGeminiWithRetry(apiMessages, retries = 2) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chưa cấu hình VITE_GEMINI_API_KEY. Vui lòng liên hệ quản trị viên.');
  }

  const contents = apiMessages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const body = {
    contents,
    systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\n${RISK_PROMPT}` }] },
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('API đang quá tải. Vui lòng thử lại sau ít phút.');
        }
        if (response.status === 400) {
          throw new Error('Yêu cầu không hợp lệ. Vui lòng thử câu hỏi khác.');
        }
        throw new Error(errData?.error?.message || `Lỗi kết nối API (${response.status}).`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Không nhận được phản hồi từ AI.');
      return text;

    } catch (err) {
      if (attempt === retries) throw err;
      // Exponential backoff: 1s, 2s
      await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
    }
  }
}

/**
 * @param {{ role: 'user' | 'assistant', content: string }[]} messages
 * @returns {Promise<string>}
 */
export async function sendMessage(messages) {
  checkRateLimit();
  return callGeminiWithRetry(messages);
}
