import {defineStore} from 'pinia'
import {ref} from 'vue'
import {addRow, deleteRow, editRow, loadData as apiLoadData} from '@/api/table.js'

export const useTableStore = defineStore('table', () => {
  // 状态
  const tableData = ref([])
  const loading = ref(false)
  const lastUpdateTime = ref(null)

  const homeCb = (cb) => {
    return cb?.()
  }

  // 获取数据
  const loadData = async (filters = {}) => {
    loading.value = true
    try {
      const response = await apiLoadData(filters)
      
      // 后端返回的是 { total, rows } 结构，需要提取 rows
      tableData.value = response || []
      console.log('设置到store的数据:', tableData.value)
      lastUpdateTime.value = new Date().toISOString()

      return response
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
      await editRow(plate, rowData)
      await loadData()
      return { success: true }
    } catch (error) {
      console.error('更新数据失败:', error)
      return { success: false, error }
    }
  }

  // 获取数据统计
  const getDataStats = (data) => {
    if (!data) {
      return {
        total: 0,
        statusStats: {},
        lastUpdate: lastUpdateTime.value
      }
    }
    const total = data.length
    const statusStats = data.reduce((acc, item) => {
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
    homeCb,
    
    // 方法
    loadData,
    addTableRow,
    deleteTableRow,
    updateTableRow,
    getDataStats,
  }
})
