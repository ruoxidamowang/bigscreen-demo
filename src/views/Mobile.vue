<template>
  <div class="mobile-container">
    <!-- 搜索表单 -->
    <div class="search-section">
      <el-form :model="searchForm" label-position="left" label-width="70px" class="mobile-form">
        <el-form-item label="车牌号">
          <el-input 
            v-model.trim="searchForm.plate" 
            placeholder="请输入车牌号" 
            clearable
            class="mobile-input"
          />
        </el-form-item>
        
        <el-form-item label="区域">
          <el-select 
            v-model="searchForm.area" 
            placeholder="请选择区域" 
            clearable
            class="mobile-select"
          >
            <el-option 
              v-for="(item, index) in areaArr" 
              :key="index" 
              :label="item.label" 
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="负责人">
          <el-select 
            v-model="searchForm.leader" 
            placeholder="请选择负责人" 
            clearable
            class="mobile-select"
          >
            <el-option 
              v-for="(item, index) in leaderArr" 
              :key="index" 
              :label="item.label" 
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="请选择状态" 
            clearable
            class="mobile-select"
          >
            <el-option 
              v-for="(item, index) in statusArr" 
              :key="index" 
              :label="item.label" 
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <div class="button-group">
          <el-button 
            type="primary" 
            @click="handleSearch"
            class="search-btn"
            :icon="Search"
          >
            搜索
          </el-button>
          <el-button 
            @click="handleReset"
            class="reset-btn"
            :icon="RefreshRight"
          >
            重置
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 数据展示 -->
    <div class="data-section">
      <div class="section-title">
        <span>查询结果 ({{ tableData.length }})</span>
      </div>
      
      <div v-if="tableData.length === 0" class="empty-state">
        <el-empty description="暂无数据" />
      </div>
      
      <div v-else class="data-list">
        <div 
          v-for="(item, index) in tableData" 
          :key="index"
          class="data-item"
        >
          <div class="item-header">
            <span class="plate-number">{{ item.plate }}</span>
            <el-tag 
              :type="getStatusType(item.status)" 
              size="small"
              class="status-tag"
            >
              {{ item.status }}
            </el-tag>
          </div>
          
          <div class="item-content">
            <div class="info-row">
              <span class="label">区域：</span>
              <span class="value">{{ item.area }}</span>
            </div>
            <div class="info-row">
              <span class="label">负责人：</span>
              <span class="value">{{ item.leader }}</span>
            </div>
            <div v-if="item.remark" class="info-row">
              <span class="label">备注：</span>
              <span class="value">{{ item.remark }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from 'vue'
import {RefreshRight, Search} from '@element-plus/icons-vue'
import {logout} from '@/api/auth.js'
import {useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {useTableStore} from '@/stores/tableStore.js'
import {storeToRefs} from 'pinia'

defineOptions({
  name: 'Mobile',
})

const router = useRouter()
const username = ref(localStorage.getItem('username') || '用户')

// 使用store管理表格数据
const tableStore = useTableStore()
const { tableData, loading } = storeToRefs(tableStore)

// 区域选项
const areaArr = ref([
  { label: "一区", value: "一区" },
  { label: "二区", value: "二区" },
  { label: "三区", value: "三区" },
  { label: "四区", value: "四区" },
  { label: "五区", value: "五区" }
])

// 负责人选项
const leaderArr = ref([
  { label: "叶", value: "叶" },
  { label: "敦", value: "敦" },
  { label: "吴", value: "吴" }
])

// 状态选项
const statusArr = ref([
  { label: "未出库", value: "未出库" },
  { label: "装货中", value: "装货中" },
  { label: "已出库", value: "已出库" }
])

// 搜索表单
const searchForm = ref({
  plate: '',
  area: '',
  leader: '',
  status: ''
})

// 搜索处理
const handleSearch = () => {
  tableStore.loadData(searchForm.value)
}

// 重置处理
const handleReset = () => {
  searchForm.value = {
    plate: '',
    area: '',
    leader: '',
    status: ''
  }
  tableStore.loadData()
}

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case '未出库':
      return 'danger'
    case '装货中':
      return 'warning'
    case '已出库':
      return 'success'
    default:
      return 'info'
  }
}

// 页面加载时获取数据
onMounted(() => {
  tableStore.loadData()
  // 启动自动刷新，每8秒刷新一次数据
  tableStore.startAutoRefresh(8000)
})

// 组件卸载时停止自动刷新
onUnmounted(() => {
  tableStore.stopAutoRefresh()
})

// 登出处理
const handleLogout = async () => {
  try {
    await logout()
    // 清除本地存储
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    ElMessage.success('已退出登录')
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('登出失败:', error)
    // 即使API调用失败，也清除本地存储并跳转
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.mobile-container {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.nav-section {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .user-info {
    span {
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }
  }
  
  .nav-buttons {
    display: flex;
    gap: 8px;
    
    .desktop-btn {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #dcdfe6;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 14px;
      
      &:hover {
        background: white;
        border-color: #409eff;
      }
    }
    
    .logout-btn {
      background: rgba(245, 108, 108, 0.9);
      border: 1px solid #f56c6c;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 14px;
      color: white;
      
      &:hover {
        background: #f56c6c;
        border-color: #f56c6c;
      }
    }
  }
}

.search-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-form {
  .el-form-item {
    margin-bottom: 20px;
    
    .el-form-item__label {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
  }
}

.mobile-input,
.mobile-select {
  width: 100%;
  
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    border: 1px solid #dcdfe6;
    
    &:hover {
      border-color: #c0c4cc;
    }
    
    &.is-focus {
      border-color: #409eff;
    }
  }
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
  .search-btn,
  .reset-btn {
    flex: 1;
    height: 44px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
  }
  
  .search-btn {
    background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #337ecc 0%, #2d5986 100%);
    }
  }
  
  .reset-btn {
    border: 1px solid #dcdfe6;
    color: #606266;
    
    &:hover {
      border-color: #c0c4cc;
      color: #409eff;
    }
  }
}

.data-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.empty-state {
  padding: 40px 0;
}

.data-list {
  .data-item {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fafafa;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e4e7ed;
      
      .plate-number {
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
      
      .status-tag {
        font-weight: 500;
      }
    }
    
    .item-content {
      .info-row {
        display: flex;
        margin-bottom: 8px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: #909399;
          font-size: 14px;
          min-width: 60px;
        }
        
        .value {
          color: #333;
          font-size: 14px;
          flex: 1;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 480px) {
  .mobile-container {
    padding: 12px;
  }
  
  .search-section,
  .data-section {
    padding: 16px;
  }
  
  .data-list .data-item {
    padding: 12px;
    
    .item-header .plate-number {
      font-size: 16px;
    }
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .mobile-container {
    background-color: #1a1a1a;
  }
  
  .nav-section {
    .user-info span {
      color: #e0e0e0;
    }
    
    .nav-buttons {
      .desktop-btn {
        background: rgba(45, 45, 45, 0.9);
        border-color: #404040;
        color: #e0e0e0;
        
        &:hover {
          background: #2d2d2d;
          border-color: #409eff;
        }
      }
      
      .logout-btn {
        background: rgba(245, 108, 108, 0.8);
        border-color: #f56c6c;
        color: white;
        
        &:hover {
          background: #f56c6c;
        }
      }
    }
  }
  
  .search-section,
  .data-section {
    background: #2d2d2d;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  .section-title {
    color: #e0e0e0;
    border-bottom-color: #404040;
  }
  
  .data-list .data-item {
    background: #333;
    border-color: #404040;
    
    .item-header {
      border-bottom-color: #404040;
      
      .plate-number {
        color: #e0e0e0;
      }
    }
    
    .item-content .info-row .value {
      color: #e0e0e0;
    }
  }
}
</style>