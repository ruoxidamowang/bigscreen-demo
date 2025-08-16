<template>
  <div class="dv-root" style="display: flex;">
    <scroll-board ref="scrollBoardRef" :config="config" @mouseenter="pauseAutoRefresh" @mouseleave="resumeAutoRefresh"/>
    <scroll-board ref="scrollBoardRef2" :config="config" @mouseenter="pauseAutoRefresh" @mouseleave="resumeAutoRefresh"/>
  </div>
</template>

<script setup>
import {ScrollBoard} from "@kjgl77/datav-vue3";
import {useTableStore} from '@/stores/tableStore.js'

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
const scrollBoardRef2 = ref(null)

const config = ref({
  header: ['车牌号', '区域', '负责人', '备注', '状态'],
  rowNum: 15,
  index: true,
  carousel: 'page',
  indexHeader: '序号',
  columnWidth: [60],
  waitTime: 10 * 1000,
  hoverPause: false,
  data: []
})

const refreshData = async () => {
  const rows = await tableStore.loadData({})
  if (rows) {
    const data = []
    const data2 = []
    rows.forEach((row, idx) => {
      const color = colorMap[row.status] || "black";
      if (idx % 2 === 0) {
        data.push([
          `<span style="font-size: 26px">${row.plate}</span>`,
          `<span style="font-size: 26px">${row.area}</span>`,
          `<span style="font-size: 26px">${row.leader}</span>`,
          `<span style="font-size: 26px">${row.remark}</span>`,
          `<span style="font-size: 26px; color:${color}">${row.status}</span>`,
        ])
      } else {
        data2.push([
          `<span style="font-size: 26px">${row.plate}</span>`,
          `<span style="font-size: 26px">${row.area}</span>`,
          `<span style="font-size: 26px">${row.leader}</span>`,
          `<span style="font-size: 26px">${row.remark}</span>`,
          `<span style="font-size: 26px; color:${color}">${row.status}</span>`,
        ])
      }
    });
    console.log(data, data2)
    scrollBoardRef.value.updateRows(data)
    scrollBoardRef2.value.updateRows(data2)
  }
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
  width: 90.4vw;
  position: fixed;
  top: 0;
  left: 0;
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