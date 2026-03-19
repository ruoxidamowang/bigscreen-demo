import express from 'express'
import fs from 'fs'
import cors from 'cors'
import path from 'path'
import {fileURLToPath} from 'url'
import {nanoid} from "nanoid";
import {dayjs} from "element-plus";

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, 'data/tableData.json')

app.use(express.static(path.join(__dirname, '../dist')));

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
    const {plate, area, leader, status, sortField, sortOrder} = req.query;

    let results = readData();

    // 条件过滤
    if (plate) {
        results = results.filter(item => item.plate.includes(plate));
    }
    if (area) {
        results = results.filter(item => item.area.includes(area));
    }
    if (leader) {
        results = results.filter(item => item.leader.includes(leader));
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
    const newPlate = req.body.plate.toUpperCase()

    const existsData = data.find(item => item.plate.toUpperCase() === newPlate)

    if (existsData) {
        res.json({ success: false, message: '车牌号已存在!' })
    } else {
        // 删除已有 plate 相同的记录
        const filtered = data.filter(item => item.plate.toUpperCase() !== newPlate)

        // 添加新的记录
        filtered.push({
            ...req.body,
            id: existsData ? existsData.id : nanoid(10),
            plate: newPlate,
            createddate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            // remark: existsData ? existsData.remark + '+' + req.body.remark : req.body.remark,
            // area: existsData ? existsData.area : req.body.area,
            // leader: existsData ? existsData.leader : req.body.leader,
        })

        writeData(filtered)
        res.json({ success: true })
    }
})

// 修改数据
app.put('/api/table/:id', (req, res) => {
    const data = readData()
    const index = data.findIndex(item => item.id === req.params.id)
    if (index === -1) return res.status(404).json({error: 'Not found'})
    data[index] = req.body
    writeData(data)
    res.json({success: true})
})

// 删除数据（按车牌号）
app.post('/api/remove', (req, res) => {
    const {ids}= req.body
    console.log(ids)
    let data = readData()
    data = data.filter(item => !ids.includes(item.id))
    writeData(data)
    res.json({success: true})
})

// 登录接口
app.post('/api/auth/login', (req, res) => {
    const {username, password} = req.body

    // 验证用户名和密码
    if (username === 'admin' && password === '123456') {
        loggedInUsers.add(username)
        res.json({
            success: true,
            message: '登录成功',
            user: {username}
        })
    } else {
        res.status(200).json({
            success: false,
            message: '用户名或密码错误'
        })
    }
})

// 登出接口
app.post('/api/auth/logout', (req, res) => {
    const {username} = req.body
    if (username) {
        loggedInUsers.delete(username)
    }
    res.json({success: true, message: '登出成功'})
})

// 检查登录状态
app.get('/api/auth/check', (req, res) => {
    const username = req.query.username
    if (username && loggedInUsers.has(username)) {
        res.json({
            success: true,
            isLoggedIn: true,
            user: {username}
        })
    } else {
        res.json({
            success: true,
            isLoggedIn: false
        })
    }
})

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

