// Vercel Serverless 函数 - 状态 API
let state = { working: false, tasks: 0, lastUpdate: Date.now() };

// 使用 KV 存储需要 Vercel KV，这里用内存演示
// 生产环境请使用 Redis 或数据库

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    return res.json(state);
  }
  
  if (req.method === 'POST') {
    const { action } = req.body;
    
    if (action === 'work') {
      state.working = true;
    } else if (action === 'sleep') {
      state.working = false;
    } else if (action === 'task') {
      state.tasks++;
      state.working = true;
    }
    
    state.lastUpdate = Date.now();
    return res.json({ success: true, state });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
};
