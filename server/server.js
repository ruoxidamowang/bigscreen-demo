import express from 'express'
import fs from 'fs'
import cors from 'cors'
import {dirname, join} from 'path';
import {fileURLToPath} from 'url'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_FILE = join(__dirname, 'data/tableData.json')

app.use(express.static(join(__dirname, './dist')));

app.get('*', (req, res) => {
    res.sendFile(join(__dirname, './dist/index.html'));
});

app.use(cors())
app.use(express.json()) // 支持 JSON 请求体

// 简单的内存存储登录状态（生产环境建议使用数据库和JWT）
const loggedInUsers = new Set()

// 读取数据
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return []
    const raw = fs.readFileSync(DATA_FILE)
    return JSON.parse(raw)
}

// 写入数据
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// 获取表格数据
app.get('/api/table', (req, res) => {
    const { plate, area, leader, status, sortField, sortOrder } = req.query;

    let results = readData();

    // 条件过滤
    if (plate) {
        results = results.filter(item => item.plate.includes(plate));
    }
    if (area) {
        results = results.filter(item => String(item.area) === String(area));
    }
    if (leader) {
        results = results.filter(item => String(item.leader) === String(leader));
    }
    if (status) {
        results = results.filter(item => String(item.status) === String(status));
    }

    // 排序
    if (sortField) {
        results.sort((a, b) => {
            if (a[sortField] < b[sortField]) return sortOrder === "desc" ? 1 : -1;
            if (a[sortField] > b[sortField]) return sortOrder === "desc" ? -1 : 1;
            return 0;
        });
    }

    // 分页
    const total = results.length;

    res.json({
        total,
        rows: results
    });
})

// 添加数据
app.post('/api/table', (req, res) => {
    const data = readData()
    data.push(req.body)
    writeData(data)
    res.json({ success: true })
})

// 修改数据（按车牌号唯一标识）
app.put('/api/table/:plate', (req, res) => {
    const data = readData()
    const index = data.findIndex(item => item.plate === req.params.plate)
    if (index === -1) return res.status(404).json({ error: 'Not found' })
    data[index] = req.body
    writeData(data)
    res.json({ success: true })
})

// 删除数据（按车牌号）
app.delete('/api/table/:plate', (req, res) => {
    let data = readData()
    data = data.filter(item => item.plate !== req.params.plate)
    writeData(data)
    res.json({ success: true })
})

// 登录接口
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body
    
    // 验证用户名和密码
    if (username === 'admin' && password === '123456') {
        loggedInUsers.add(username)
        res.json({ 
            success: true, 
            message: '登录成功',
            user: { username }
        })
    } else {
        res.status(401).json({ 
            success: false, 
            message: '用户名或密码错误' 
        })
    }
})

// 登出接口
app.post('/api/auth/logout', (req, res) => {
    const { username } = req.body
    if (username) {
        loggedInUsers.delete(username)
    }
    res.json({ success: true, message: '登出成功' })
})

// 检查登录状态
app.get('/api/auth/check', (req, res) => {
    const username = req.query.username
    if (username && loggedInUsers.has(username)) {
        res.json({ 
            success: true, 
            isLoggedIn: true,
            user: { username }
        })
    } else {
        res.json({ 
            success: true, 
            isLoggedIn: false 
        })
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));