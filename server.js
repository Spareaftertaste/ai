const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// 状态存储
let state = { working: false, tasks: 0, lastUpdate: Date.now() };

// 内存存储 (生产环境请用 Redis/数据库)
const clients = new Set();

io.on('connection', (socket) => {
  clients.add(socket);
  // 立即发送当前状态
  socket.emit('status', state);
  
  socket.on('disconnect', () => {
    clients.delete(socket);
  });
});

// API 端点
app.get('/api/status', (req, res) => {
  res.json(state);
});

app.post('/api/work', express.json(), (req, res) => {
  state.working = true;
  state.lastUpdate = Date.now();
  // 广播给所有客户端
  io.emit('status', state);
  res.json({ success: true, state });
});

app.post('/api/sleep', express.json(), (req, res) => {
  state.working = false;
  state.lastUpdate = Date.now();
  io.emit('status', state);
  res.json({ success: true, state });
});

app.post('/api/task', express.json(), (req, res) => {
  state.tasks = (state.tasks || 0) + 1;
  state.working = true;
  state.lastUpdate = Date.now();
  io.emit('status', state);
  res.json({ success: true, state });
});

// 静态文件
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`AI Office Server running on port ${PORT}`);
});
