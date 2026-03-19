import request from "@/utils/request";

// 加载数据
export const loadData = async (params = {}) => {
    const res = await request.get('/api/table', {params})
    return res.rows
}

// 添加数据
export const addRow = async (row) => {
    return await request.post('/api/table', row)
}

// 编辑数据
export const editRow = async (id, newRow) => {
    await request.put(`/api/table/${id}`, newRow)
    await loadData()
}

// 删除数据
export const deleteRow = async (ids) => {
    await request.post(`/api/remove`, {ids})
    await loadData()
}