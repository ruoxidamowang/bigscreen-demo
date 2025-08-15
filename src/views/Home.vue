<template>
  <div class="dv-root">
    <!-- 实时统计信息 -->
    <div class="stats-overlay">
      <div class="stats-header">
        <span>实时数据统计</span>
        <div class="header-controls">
          <el-button
            type="primary"
            size="small"
            :icon="RefreshRight"
            @click="refreshData"
          >
            刷新
          </el-button>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-label">总数量:</span>
        <span class="stat-value">{{ stats.total }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">未出库:</span>
        <span class="stat-value danger">{{ stats.statusStats['未出库'] || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">装货中:</span>
        <span class="stat-value warning">{{ stats.statusStats['装货中'] || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">已出库:</span>
        <span class="stat-value success">{{ stats.statusStats['已出库'] || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">更新时间:</span>
        <span class="stat-value">{{ formatTime(stats.lastUpdate) }}</span>
      </div>
    </div>

    <scroll-board ref="scrollBoardRef" :config="config" @mouseenter="pauseAutoRefresh" @mouseleave="resumeAutoRefresh"/>
  </div>
</template>

<script setup>
import {ScrollBoard} from "@kjgl77/datav-vue3";
import {useTableStore} from '@/stores/tableStore.js'
import {RefreshRight} from '@element-plus/icons-vue'

defineOptions({
  name: 'Home',
})

const colorMap = {
  "未出库": "red",
  "装货中": "orange",
  "已出库": "green",
};

// 使用store管理表格数据
const tableStore = useTableStore()

const scrollBoardRef = ref(null)

const config = ref({
  header: ['车牌号', '区域', '负责人', '备注', '状态'],
  rowNum: 20,
  index: true,
  indexHeader: '序号',
  columnWidth: [60],
  waitTime: 2000,
  data: []
})

// 计算统计数据
const stats = computed(() => tableStore.getDataStats())

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '--'
  const date = new Date(timeStr)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const refreshData = async () => {
  const rows = await tableStore.loadData({})
  tableStore.getDataStats(rows)
  const data = rows.map(row => {
    const color = colorMap[row.status] || "black";
    return [
      row.plate,
      row.area,
      row.leader,
      row.remark,
      `<span style="color:${color}">${row.status}</span>`,
    ];
  });
  scrollBoardRef.value.updateRows(data)
}

let intervalId = null
let isPaused = false

const startAutoRefresh = () => {
  clearInterval(intervalId)
  intervalId = setInterval(() => {
    if (!isPaused) {
      refreshData()
    }
  }, 10 * 1000)
}

const pauseAutoRefresh = () => {
  isPaused = true
}

const resumeAutoRefresh = () => {
  isPaused = false
}

onMounted(() => {
  refreshData()
  startAutoRefresh()
})

onUnmounted(() => {
  clearInterval(intervalId)
})

</script>

<style scoped lang="scss">
.dv-root {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  transform-origin: left top;
  z-index: 999;
}

.stats-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 16px;
  color: white;
  z-index: 1000;
  min-width: 200px;

  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);

    span {
      font-size: 16px;
      font-weight: 600;
      color: white;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 12px;

      .scroll-indicator {
        font-size: 12px;
        color: #67c23a;
        background: rgba(103, 194, 58, 0.2);
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid rgba(103, 194, 58, 0.3);
      }

      .el-button {
        background: rgba(64, 158, 255, 0.8);
        border: none;
        color: white;

        &:hover {
          background: rgba(64, 158, 255, 1);
        }
      }
    }
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .stat-label {
      color: #ccc;
      font-size: 14px;
    }

    .stat-value {
      font-weight: 600;
      font-size: 16px;

      &.danger {
        color: #f56c6c;
      }

      &.warning {
        color: #e6a23c;
      }

      &.success {
        color: #67c23a;
      }
    }
  }
}
</style>