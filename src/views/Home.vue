<template>
  <div class="dv-root" style="display: flex;">
    <scroll-board ref="scrollBoardRef" :config="config" @click="broadcast"/>
    <scroll-board ref="scrollBoardRef2" :config="config2" @click="broadcast"/>
  </div>
</template>

<script setup>
import {ScrollBoard} from "@kjgl77/datav-vue3";
import {useTableStore} from '@/stores/tableStore.js'

defineOptions({
  name: 'Home',
})

const colorMap = {
  "未出库": "#F56C6C",
  "已到达": "#409EFF",
  "已出库": "#67C23A",
};

// 使用store管理表格数据
const tableStore = useTableStore()

const scrollBoardRef = ref(null)
const scrollBoardRef2 = ref(null)

const config = ref({
  header: ['序号', '车牌号', '区域', '负责人', '备注', '状态'],
  rowNum: 15,
  index: false,
  carousel: 'page',
  indexHeader: '序号',
  columnWidth: [80],
  waitTime: 60 * 60 * 24 * 365,
  hoverPause: false,
  data: []
})

const config2 = ref({
  header: ['序号', '车牌号', '区域', '负责人', '备注', '状态'],
  rowNum: 15,
  index: false,
  carousel: 'page',
  indexHeader: '序号',
  columnWidth: [80],
  waitTime: 60 * 60 * 24 * 365,
  hoverPause: false,
  data: []
})

// 存储所有数据
const allData = ref([])
// 当前页码
const currentPage = ref(0)
// 每页显示条数
const perBoardSize = 15

// 总共显示条数
const totalDisplaySize = perBoardSize * 2

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(allData.value.length / totalDisplaySize)
})

// 格式化数据为滚动看板需要的格式
const formatData = (data, startIndex = 0) => {
  return data.map((row, i) => [
    `<span style="display:inline-block;
        width: 2rem;
        height: 2rem;
        line-height: 2rem;
        text-align:center;
        font-size: 1rem;
        font-weight: bold;
        border-radius: 0.4rem;
        background:#409EFF;
        color:#fff;">${startIndex + i + 1}</span>`,
    `<span style="font-size: 1.6rem">${row.plate}</span>`,
    `<span style="font-size: 1.6rem">${row.area}</span>`,
    `<span style="font-size: 1.6rem">${row.leader}</span>`,
    `<span style="font-size: 1.6rem">${row.remark || '-'}</span>`,
    `<span style="font-size: 1.6rem; color:${colorMap[row.status] || "black"}">${row.status}</span>`,
  ])
}

// 获取当前页的数据
const getCurrentPageData = () => {
  const start = currentPage.value * totalDisplaySize
  const end = start + totalDisplaySize
  let pageData = allData.value.slice(start, end)

  // 如果不足一页，补充空行
  while (pageData.length < totalDisplaySize) {
    pageData.push({
      plate: '',
      area: '',
      leader: '',
      remark: '',
      status: ''
    })
  }

  return pageData
}

function throttle(fn, delay) {
  let lastTime = 0
  let timer = null

  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    } else {
      clearTimeout(timer)
      timer = setTimeout(() => {
        lastTime = Date.now()
        fn.apply(this, args)
      }, delay - (now - lastTime))
    }
  }
}

const updateScrollBoards = () => {
  const pageData = getCurrentPageData()

  const firstBoardData = pageData.slice(0, perBoardSize)
  const secondBoardData = pageData.slice(perBoardSize, totalDisplaySize)

  if (scrollBoardRef.value) {
    config.value.data = formatData(firstBoardData, currentPage.value * totalDisplaySize)
  }
  if (scrollBoardRef2.value) {
    config2.value.data = formatData(secondBoardData, currentPage.value * totalDisplaySize + perBoardSize)
  }

  currentPage.value = (currentPage.value + 1) % totalPages.value
}

// 包装成节流函数（比如 500ms 内最多执行一次）
const throttledUpdateScrollBoards = throttle(updateScrollBoards, 1000)

// 刷新数据
const refreshData = async () => {
  try {
    const rows = await tableStore.loadData({})
    if (rows && rows.length > 0) {
      allData.value = rows
      if (currentPage.value === 0 && config.value.data.length === 0) {
        updateScrollBoards()
      }
    }
  } catch (error) {
    console.error('刷新数据失败:', error)
  }
}

let intervalId = null
let refreshIntervalId = null

// 启动自动刷新
const startAutoRefresh = () => {
  // 先清除之前的定时器
  clearInterval(refreshIntervalId)
  clearInterval(intervalId)

  // 每10秒刷新一次数据
  refreshIntervalId = setInterval(refreshData, 5 * 1000)

  // 每20秒翻页一次
  intervalId = setInterval(throttledUpdateScrollBoards, 15 * 1000)
}

onMounted(() => {
  refreshData()
  startAutoRefresh()
})

onUnmounted(() => {
  clearInterval(intervalId)
  clearInterval(refreshIntervalId)
})

const extractTextFromHtml = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

const statusMap = {
  "未出库": '请在车上等待呼叫',
  "已到达": '请到办公室',
  "已出库": '请到办公室签名',
}

const broadcast = ({row, ceil, rowIndex, columnIndex}) => {
  const licensePlate = extractTextFromHtml(row[1]);
  const status = extractTextFromHtml(row[row.length - 1]);

  if (licensePlate && status) {
    // 检查浏览器是否支持
    if ('speechSynthesis' in window) {
      // 创建语音合成对象
      const utterance = new SpeechSynthesisUtterance();

      // 设置文本
      utterance.text = licensePlate.replaceAll('X', 'X ') + statusMap[status];

      // 设置语言 (可选)
      utterance.lang = 'zh-CN';

      // 设置语速 (0.1-10, 默认1)
      utterance.rate = 1;

      // 设置音高 (0-2, 默认1)
      utterance.pitch = 1;

      // 开始播报
      window.speechSynthesis.speak(utterance);
    } else {
      ElMessage.error("您的浏览器不支持语音合成");
    }
  }
}

</script>

<style scoped lang="scss">
.dv-root {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
}

:deep(.row-item) {
  cursor: pointer;

  &:hover {
    background-color: #0085ff !important;
  }
}
</style>