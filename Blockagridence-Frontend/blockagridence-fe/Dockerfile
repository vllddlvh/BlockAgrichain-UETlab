# Stage 1: Build ứng dụng Vite Frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy các file cấu hình npm trước để tận dụng cache của Docker
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ mã nguồn và tiến hành build
COPY . .
RUN npm run build

# Stage 2: Serve bằng Nginx (Chỉ lấy thư mục dist đã build xong)
FROM nginx:alpine
# Xóa cấu hình mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy thư mục dist từ Stage 1 sang thư mục phục vụ web của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Mở cổng 80 cho web
EXPOSE 80

# Chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
