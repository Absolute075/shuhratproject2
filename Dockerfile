# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM golang:1.22-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/go.mod ./
COPY backend/ ./

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/server .


FROM alpine:3.20
WORKDIR /app

RUN adduser -D -H -s /sbin/nologin appuser

RUN mkdir -p /data && chown -R appuser:appuser /data

COPY --from=backend-builder /out/server /app/server
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

ENV BACKEND_ADDR=0.0.0.0:8090
ENV FRONTEND_DIST=/app/frontend/dist
ENV APPLICATION_STORE_PATH=/data

EXPOSE 8090
USER appuser

ENTRYPOINT ["/app/server"]
