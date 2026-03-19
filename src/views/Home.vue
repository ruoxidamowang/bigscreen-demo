<template>
  <div class="dv-root" :class="{ 'mouse-hidden': isMouseHidden }" style="display: flex;">
    <scroll-board ref="scrollBoardRef" :config="config" @click="handleClick"/>
    <scroll-board ref="scrollBoardRef2" :config="config2" @click="handleClick"/>
  </div>
</template>

<script setup>
import {ScrollBoard} from "@kjgl77/datav-vue3";
import {useTableStore} from '@/stores/tableStore.js'
import gsap from 'gsap'
import {ElMessage, ElMessageBox} from "element-plus";

defineOptions({
  name: 'Home',
})

const colorMap = {
  "已开单": "#67C23A",
  "已到达": "#409EFF",
  "未开单": "#F56C6C",
  "开单中": "#fde047",
  "传单中": "#f97316",
};

// 使用store管理表格数据
const tableStore = useTableStore()

const scrollBoardRef = ref(null)
const scrollBoardRef2 = ref(null)

const config = ref({
  header: ['序号', '车牌号', '区域', '负责人', '备注', '状态'],
  rowNum: 15,
  carousel: 'page',
  columnWidth: [70, 200],
  waitTime: 60 * 60 * 24 * 365,
  hoverPause: false,
  headerHeight: 50,
  data: []
})

const config2 = ref({...config.value})

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

const createMarqueeDom = (text, maxChars = 5) => {
  if (!text) return '-'
  if (text.length <= maxChars) return `<span style="font-size:1.6rem; white-space:nowrap;">${text}</span>`

  return `
    <div class="marquee-wrapper" style="overflow:hidden; white-space:nowrap; width:100%;">
      <div class="marquee-content" style="display:inline-block; white-space:nowrap; font-size:1.6rem;">
        <span style="padding-right:3rem;">${text}</span>
        <span style="padding-right:3rem;">${text}</span>
      </div>
    </div>
  `
}

// 初始化动画
const initMarqueeAnimation = (wrapper, speed = 50) => {
  const content = wrapper.querySelector('.marquee-content')
  if (!content) return
  if (!content._gsapTween) {
    const width = content.offsetWidth / 2
    content._gsapTween = gsap.to(content, {x: -width, duration: width / speed, ease: 'linear', repeat: -1})
  }
}

// 格式化数据
const formatData = (data, startIndex = 0) => {
  return data.map((row, i) => {
    const indexNum = startIndex + i + 1
    return [
      `<span data-id="${row.id}" style="display:inline-block;width:2rem;height:2rem;line-height:2rem;text-align:center;font-size:1rem;font-weight:bold;border-radius:0.4rem;background:#409EFF;color:#fff;">${indexNum}</span>`,
      createMarqueeDom(row.plate, 8),
      createMarqueeDom(row.area),
      createMarqueeDom(row.leader, 3),
      createMarqueeDom(row.remark),
      `<span style="font-size:1.6rem;color:${colorMap[row.status] || 'white'}">${row.status}</span>`
    ]
  })
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
  // 翻页前先清理所有监听器
  removeLongPressListeners()

  const pageData = getCurrentPageData()
  const firstBoardData = pageData.slice(0, perBoardSize)
  const secondBoardData = pageData.slice(perBoardSize, totalDisplaySize)

  if (scrollBoardRef.value) config.value.data = formatData(firstBoardData, currentPage.value * totalDisplaySize)
  if (scrollBoardRef2.value) config2.value.data = formatData(secondBoardData, currentPage.value * totalDisplaySize + perBoardSize)

  nextTick(() => {
    // 分别初始化每列动画
    const wrappers = document.querySelectorAll('.marquee-wrapper')
    wrappers.forEach((wrapper, i) => {
      initMarqueeAnimation(wrapper)
    })

    addLongPressListeners()
  })

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

const isMouseHidden = ref(false)
let inactivityTimer = null
const inactivityDelay = 2000

const hideMouse = () => {
  isMouseHidden.value = true
}

const resetInactivityTimer = () => {
  console.log('resetInactivityTimer', isMouseHidden.value)
  if (isMouseHidden.value) {
    isMouseHidden.value = false  // 鼠标原本隐藏 → 显示回来
  }
  clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(hideMouse, inactivityDelay)
}

onMounted(() => {
  refreshData()
  startAutoRefresh()

  window.addEventListener('mousemove', resetInactivityTimer)
  window.addEventListener('mousedown', resetInactivityTimer)
  window.addEventListener('keydown', resetInactivityTimer)
  window.addEventListener('touchstart', resetInactivityTimer)
  resetInactivityTimer()
})

onUnmounted(() => {
  clearInterval(intervalId)
  clearInterval(refreshIntervalId)

  removeLongPressListeners() // 组件卸载时清理

  window.removeEventListener('mousemove', resetInactivityTimer)
  window.removeEventListener('mousedown', resetInactivityTimer)
  window.removeEventListener('keydown', resetInactivityTimer)
  window.removeEventListener('touchstart', resetInactivityTimer)
  clearTimeout(inactivityTimer)
})

const extractTextFromHtml = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

const statusMap = {
  "未开单": '请在车上等待呼叫',
  "已到达": '请到办公室',
  "已开单": '请到办公室签名',
  "开单中": '正在开单中',
  "传单中": '正在传单中',
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

// 长按相关变量
const longPressTimer = ref(null)
const longPressDuration = 600 // 长按时间阈值（毫秒）
const longPressTarget = ref(null)
const longPressTriggered = ref(false)
const isLongPressProcessing = ref(false)

// 存储事件处理函数引用
const eventHandlers = ref(new Map())

// 清理长按状态
const cleanupLongPress = () => {
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }
  longPressTarget.value = null
  longPressTriggered.value = false
  isLongPressProcessing.value = false
}

// 移除所有行的事件监听器
const removeLongPressListeners = () => {
  const rows = document.querySelectorAll('.row-item')

  rows.forEach(row => {
    const handlers = eventHandlers.value.get(row)
    if (handlers) {
      row.removeEventListener('mousedown', handlers.mousedown)
      row.removeEventListener('mouseup', handlers.mouseup)
      row.removeEventListener('mouseleave', handlers.mouseleave)
      row.removeEventListener('touchstart', handlers.touchstart)
      row.removeEventListener('touchend', handlers.touchend)
      row.removeEventListener('touchcancel', handlers.touchcancel)
    }
  })

  eventHandlers.value.clear()
}

// 添加长按事件监听
const addLongPressListeners = () => {
  const rows = document.querySelectorAll('.row-item')

  rows.forEach(row => {
    // 先移除可能存在的旧监听器
    const oldHandlers = eventHandlers.value.get(row)
    if (oldHandlers) {
      row.removeEventListener('mousedown', oldHandlers.mousedown)
      row.removeEventListener('mouseup', oldHandlers.mouseup)
      row.removeEventListener('mouseleave', oldHandlers.mouseleave)
      row.removeEventListener('touchstart', oldHandlers.touchstart)
      row.removeEventListener('touchend', oldHandlers.touchend)
      row.removeEventListener('touchcancel', oldHandlers.touchcancel)
    }

    // 创建新的处理函数
    const handleMouseDown = (e) => {
      if (e.button === 0) {
        startLongPress(e, row)
      }
    }

    const handleMouseUp = (e) => {
      endLongPress(e)
    }

    const handleTouchStart = (e) => {
      startLongPress(e, row)
    }

    const handleTouchEnd = (e) => {
      endLongPress(e)
    }

    // 添加事件监听
    row.addEventListener('mousedown', handleMouseDown)
    row.addEventListener('mouseup', handleMouseUp)
    row.addEventListener('mouseleave', handleMouseUp)
    row.addEventListener('touchstart', handleTouchStart)
    row.addEventListener('touchend', handleTouchEnd)
    row.addEventListener('touchcancel', handleTouchEnd)

    // 存储处理函数引用
    eventHandlers.value.set(row, {
      mousedown: handleMouseDown,
      mouseup: handleMouseUp,
      mouseleave: handleMouseUp,
      touchstart: handleTouchStart,
      touchend: handleTouchEnd,
      touchcancel: handleTouchEnd
    })
  })
}

const handleClick = (event) => {
  // 如果长按已触发，则阻止点击事件
  if (longPressTriggered.value || isLongPressProcessing.value) {
    longPressTriggered.value = false
    return
  }

  // 正常处理点击事件
  broadcast(event)
}

// 开始长按
const startLongPress = (e, target) => {
  // 如果正在处理长按，直接返回
  if (isLongPressProcessing.value) {
    return
  }

  // 防止默认行为（如滚动、选择文本等）
  e.preventDefault()
  e.stopPropagation()

  longPressTarget.value = target

  // 设置长按计时器
  longPressTimer.value = setTimeout(() => {
    handleLongPress(target)
  }, longPressDuration)
}

// 结束长按
const endLongPress = (e) => {
  // 清除计时器
  if (longPressTimer.value) {
    clearTimeout(longPressTimer.value)
    longPressTimer.value = null
  }

  // 重置长按目标
  longPressTarget.value = null
}

// 处理长按事件
const handleLongPress = (target) => {
  // 设置处理中标志
  isLongPressProcessing.value = true
  longPressTriggered.value = true

  // 获取行数据
  const rowIndex = Array.from(target.parentNode.children).indexOf(target)

  const boardElement = target.closest('.dv-scroll-board')
  const boards = document.querySelectorAll('.dv-scroll-board')
  const boardIndex = Array.from(boards).indexOf(boardElement)

  const data = boardIndex === 0 ? config.value.data : config2.value.data

  if (rowIndex >= 0 && rowIndex < data.length) {
    const rowData = data[rowIndex]

    // 提取文本内容
    const idElement = target.querySelector('[data-id]')
    const rowId = idElement ? idElement.getAttribute('data-id') : null
    const plate = extractTextFromHtml(rowData[1])

    if (rowId && plate) {
      // 执行长按操作
      console.log('长按事件触发:', { rowId, plate })
      handleDelete({plate, id: rowId })
    } else {
      // 如果没有有效数据，清理状态
      cleanupLongPress()
    }
  } else {
    // 如果行索引无效，清理状态
    cleanupLongPress()
  }
}

const handleDelete = async (row) => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要删除车牌号为 ${row.plate} 的记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    if (result === 'confirm') {
      const deleteResult = await tableStore.deleteTableRow([row.id])
      if (deleteResult.success) {
        ElMessage.success('删除成功')
        // 删除成功后刷新数据
        await refreshData()
      } else {
        ElMessage.error('删除失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  } finally {
    // 无论成功失败，最终都要清理长按状态
    cleanupLongPress()
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

  cursor: pointer;

  &.mouse-hidden {
    cursor: none;
  }
}

.dv-root:not(.mouse-hidden) {
  :deep(.row-item:hover) {
    background-color: #0085ff !important;
  }
}
.dv-root {
  :deep(.header-item) {
    font-size: 25px;
  }
}
</style>