# Chat App Backend - Node.js + Express + Socket.io

A real-time chat application backend with JWT authentication, Socket.io integration, and comprehensive features.

## 📁 Project Structure

```
chat-app-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── socket.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── chatController.js
│   │   └── messageController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── socketAuthMiddleware.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   │   ├── RefreshToken.js
│   │   └── UserChat.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── chatRoutes.js
│   │   └── messageRoutes.js
│   ├── sockets/
│   │   ├── socketHandler.js
│   │   └── socketEvents.js
│   ├── migrations/
│   │   ├── 20240101000001-create-users.js
│   │   ├── 20240101000002-create-chats.js
│   │   ├── 20240101000003-create-messages.js
│   │   ├── 20240101000004-create-refresh-tokens.js
│   │   └── 20240101000005-create-user-chats.js
│   ├── seeders/
│   │   ├── 20240101000001-demo-users.js
│   │   └── 20240101000002-demo-chats.js
│   ├── utils/
│   │   ├── jwtUtils.js
│   │   └── validators.js
│   └── app.js
├── .env.example
├── .gitignore
├── .sequelizerc
├── package.json
├── README.md
└── server.js
```
## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env and update JWT secrets with strong random strings
```

### 3. Run Migrations
```bash
npm run migrate
```

### 4. (Optional) Seed Demo Data
```bash
npm run seed
```

This creates 3 demo users:
- **alice@example.com** / password123
- **bob@example.com** / password123
- **charlie@example.com** / password123

### 5. Start Server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Server will run on `http://localhost:3000`

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `accessToken` and `refreshToken` from the response.

### 3. Get Users (Protected Route)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Create a Chat
```bash
curl -X POST http://localhost:3000/api/chats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Chat Room",
    "isGroup": true,
    "userIds": ["USER_ID_1", "USER_ID_2"]
  }'
```

### 5. Send a Message
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "CHAT_ID",
    "content": "Hello, world!",
    "type": "text"
  }'
```

### 6. Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## 📊 Database Schema

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   users     │       │  user_chats  │       │    chats    │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │───┐   │ id (PK)      │   ┌───│ id (PK)     │
│ username    │   │   │ user_id (FK) │───│   │ name        │
│ email       │   └──→│ chat_id (FK) │───┘   │ is_group    │
│ password    │       │ role         │       │ avatar      │
│ first_name  │       │ joined_at    │       │ created_by  │
│ last_name   │       └──────────────┘       └─────────────┘
│ avatar      │                                      │
│ is_online   │                                      │
│ last_seen   │       ┌──────────────┐              │
│ socket_id   │       │   messages   │              │
└─────────────┘       ├──────────────┤              │
       │              │ id (PK)      │              │
       │              │ chat_id (FK) │──────────────┘
       └─────────────→│ user_id (FK) │
                      │ content      │
                      │ type         │
                      │ is_read      │
                      │ read_by      │
                      └──────────────┘

       ┌──────────────────┐
       │ refresh_tokens   │
       ├──────────────────┤
       │ id (PK)          │
       │ user_id (FK)     │──→ users.id
       │ token            │
       │ expires_at       │
       │ is_revoked       │
       └──────────────────┘
```

## 🔐 Security Best Practices

1. **JWT Secrets**: Use strong, random strings (minimum 32 characters) for `JWT_SECRET` and `JWT_REFRESH_SECRET`
2. **Password Hashing**: Bcrypt with salt rounds of 10 (already implemented)
3. **Token Expiration**: Short-lived access tokens (15m), longer refresh tokens (7d)
4. **CORS**: Configure `CORS_ORIGIN` to only allow trusted domains
5. **HTTPS**: Use HTTPS in production (configure your reverse proxy/load balancer)
6. **Rate Limiting**: Consider adding rate limiting middleware for production
7. **Input Validation**: Validate all user inputs (basic validation included)
8. **SQL Injection**: Protected by Sequelize ORM
9. **XSS Protection**: Sanitize user content before rendering (implement in frontend)

## 🐛 Troubleshooting

### Migration Issues
```bash
# Undo last migration
npm run migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Re-run migrations
npm run migrate
```

### Socket Connection Issues
- Verify JWT token is valid and not expired
- Check CORS configuration in `.env`
- Ensure client is sending token in `auth` object or `Authorization` header

### Database Lock (SQLite)
If you get "database is locked" errors:
```bash
# Stop the server
# Delete the database file
rm database.sqlite

# Re-run migrations
npm run migrate
npm run seed
```

## 📈 Performance Tips

1. **Database Indexing**: Indexes are already set up on frequently queried columns
2. **Socket.io Rooms**: Messages are only sent to relevant chat participants
3. **Pagination**: Implemented for messages and users endpoints
4. **Connection Pooling**: Configured in Sequelize (max: 5 connections)
5. **Message Acknowledgments**: Prevents duplicate messages

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
DB_DIALECT=sqlite
DB_STORAGE=/var/data/database.sqlite
CORS_ORIGIN=https://yourdomain.com
```

### PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name chat-app
pm2 save
pm2 startup
```

## 📚 Additional Features to Implement

- [ ] File upload for avatars and attachments
- [ ] Image/video message support
- [ ] Message search functionality
- [ ] User blocking/reporting
- [ ] Rate limiting middleware
- [ ] Email verification
- [ ] Password reset flow
- [ ] Message reactions
- [ ] Voice/video call signaling
- [ ] Push notifications
- [ ] Message encryption (E2E)
- [ ] Admin panel
- [ ] Analytics and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 💬 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the troubleshooting section

---

## 🔑 Key Features

- ✅ JWT Authentication with Access & Refresh Tokens
- ✅ Real-time messaging with Socket.io
- ✅ Socket authentication middleware
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Message acknowledgments
- ✅ Socket rooms for chat isolation
- ✅ Global error handling
- ✅ Sequelize ORM with migrations & seeders
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ ES6 modules
- ✅ Environment variables with dotenv

## 📚 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/refresh` - Refresh access token
- POST `/api/auth/logout` - Logout user

### Users
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Chats
- GET `/api/chats` - Get user's chats
- POST `/api/chats` - Create new chat
- GET `/api/chats/:id` - Get chat by ID
- PUT `/api/chats/:id` - Update chat
- DELETE `/api/chats/:id` - Delete chat

### Messages
- GET `/api/messages/:chatId` - Get chat messages
- POST `/api/messages` - Send message
- PUT `/api/messages/:id` - Update message
- DELETE `/api/messages/:id` - Delete message

## 🔌 Socket Events

### Client → Server
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `message_read` - Mark message as read

### Server → Client
- `user_online` - User came online
- `user_offline` - User went offline
- `new_message` - New message received
- `message_delivered` - Message delivered acknowledgment
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `error` - Error occurred
