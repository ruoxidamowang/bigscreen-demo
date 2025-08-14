import {defineStore} from 'pinia'
import {ref} from 'vue'
import {addRow, deleteRow, loadData as apiLoadData} from '@/api/table.js'

export const useTableStore = defineStore('table', () => {
  // 状态
  const tableData = ref([])
  const loading = ref(false)
  const lastUpdateTime = ref(null)

  // 获取数据
  const loadData = async (filters = {}) => {
    loading.value = true
    try {
      console.log('开始加载数据，过滤器:', filters)
      const response = await apiLoadData(filters)
      console.log('API响应数据:', response)
      // 检查数据是否真的发生了变化
      const newData = response || []
      const oldDataHash = JSON.stringify(tableData.value.map(item => item.plate).sort())
      const newDataHash = JSON.stringify(newData.map(item => item.plate).sort())
      
      // 后端返回的是 { total, rows } 结构，需要提取 rows
      tableData.value = newData
      console.log('设置到store的数据:', tableData.value)
      lastUpdateTime.value = new Date().toISOString()
      
      // 返回数据是否发生变化
      return {
        changed: oldDataHash !== newDataHash,
        oldHash: oldDataHash,
        newHash: newDataHash
      }
    } catch (error) {
      console.error('加载数据失败:', error)
      tableData.value = []
    } finally {
      loading.value = false
    }
  }

  // 添加数据
  const addTableRow = async (rowData) => {
    try {
      await addRow(rowData)
      // 重新加载数据以获取最新状态
      await loadData()
      return { success: true }
    } catch (error) {
      console.error('添加数据失败:', error)
      return { success: false, error }
    }
  }

  // 删除数据
  const deleteTableRow = async (plate) => {
    try {
      await deleteRow(plate)
      // 重新加载数据以获取最新状态
      await loadData()
      return { success: true }
    } catch (error) {
      console.error('删除数据失败:', error)
      return { success: false, error }
    }
  }

  // 更新数据
  const updateTableRow = async (plate, rowData) => {
    try {
      // 这里需要调用更新API，暂时用重新加载数据的方式
      await loadData()
      return { success: true }
    } catch (error) {
      console.error('更新数据失败:', error)
      return { success: false, error }
    }
  }

  // 获取数据统计
  const getDataStats = () => {
    const total = tableData.value.length
    const statusStats = tableData.value.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {})
    
    return {
      total,
      statusStats,
      lastUpdate: lastUpdateTime.value
    }
  }

  return {
    // 状态
    tableData,
    loading,
    lastUpdateTime,
    
    // 方法
    loadData,
    addTableRow,
    deleteTableRow,
    updateTableRow,
    getDataStats,
  }
})
