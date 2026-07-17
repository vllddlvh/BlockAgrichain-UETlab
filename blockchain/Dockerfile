# Sử dụng Node.js bản nhẹ
FROM node:20-alpine
WORKDIR /app

# Copy package.json để cài đặt thư viện
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ mã nguồn hợp đồng thông minh (contracts), cấu hình (hardhat.config.js)
COPY . .

# Expose cổng mặc định của Hardhat Node (8545)
EXPOSE 8545

# Lệnh khởi chạy mạng Blockchain giả lập (Hardhat Local Node)
# Gắn địa chỉ IP 0.0.0.0 để các container khác có thể gọi vào được
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
