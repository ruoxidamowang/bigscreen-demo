import {ref} from 'vue'
import request from "@/utils/request";

export const tableData = ref([])

// 加载数据
export const loadData = async (params = {}) => {
    const res = await request.get('/api/table', {params})
    tableData.value = res.rows
    return res.rows
}

// 添加数据
export const addRow = async (row) => {
    await request.post('/api/table', row)
    await loadData()
}

// 编辑数据
export const editRow = async (plate, newRow) => {
    await request.put(`/api/table/${plate}`, newRow)
    await loadData()
}

// 删除数据
export const deleteRow = async (plate) => {
    await request.delete(`/api/table/${plate}`)
    await loadData()
}