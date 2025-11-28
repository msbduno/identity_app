# --- Pour le DEV ---
FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste des fichiers
COPY . .

EXPOSE 3000

# Hot reload activé par défaut avec 'npm run dev'
CMD ["npm", "run", "dev"]

# --- Pour la PROD ---
# # Stage builder
# FROM node:20-alpine AS builder
# WORKDIR /app
# RUN apk add --no-cache python3 make g++
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build
#
# # Stage runner
# FROM node:20-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production
# COPY --from=builder /app/package*.json ./
# RUN npm install --omit=dev
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# EXPOSE 3000
# CMD ["npm", "run", "start"]
