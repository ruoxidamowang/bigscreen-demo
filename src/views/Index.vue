<template>
  <div style="margin: 0; padding: 20px; box-sizing: border-box;">
    <!-- 页面导航 -->
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="color: #666; font-size: 14px;">
          欢迎，{{ username }}
        </span>
      </div>
      <div>
        <el-button
          type="danger"
          size="small"
          @click="handleLogout"
          :icon="SwitchButton"
        >
          退出登录
        </el-button>
      </div>
    </div>

    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="车牌号">
        <el-input class="search-item" v-model.trim="searchForm.plate" placeholder="请输入车牌号" clearable/>
      </el-form-item>
      <el-form-item label="区域">
        <el-select class="search-item" v-model="searchForm.area" placeholder="请选择区域" clearable>
          <el-option v-for="(item, index) in areaArr" :key="index" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="负责人">
        <el-select class="search-item" v-model="searchForm.leader" placeholder="请选择负责人" clearable>
          <el-option v-for="(item, index) in leaderArr" :key="index" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select class="search-item" v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option v-for="(item, index) in statusArr" :key="index" :label="item.label" :value="item.value"/>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button :icon="Search" type="primary" @click="handleSearch">搜索</el-button>
        <el-button :icon="RefreshRight" @click="handleReset">重置</el-button>
        <el-button :icon="CirclePlus" type="success" @click="handleDetail(null)">添加</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" highlight-current-row border show-overflow-tooltip stripe style="height: 80vh">
      <el-table-column header-align="center" type="index" width="60" label="序号"/>
      <el-table-column header-align="center" prop="plate" label="车牌号" width="180"/>
      <el-table-column header-align="center" prop="area" label="区域" width="180"/>
      <el-table-column header-align="center" prop="leader" label="负责人" width="120"/>
      <el-table-column header-align="center" align="center" prop="status" label="状态" width="120">
        <template #default="{row}">
          <el-text v-if="row.status === '未出库'" type="danger">{{ row.status }}</el-text>
          <el-text v-else-if="row.status === '装货中'" type="warning">{{ row.status }}</el-text>
          <el-text v-else-if="row.status === '已出库'" type="primary">{{ row.status }}</el-text>
        </template>
      </el-table-column>
      <el-table-column header-align="center" prop="remark" label="备注"/>
      <el-table-column header-align="center" label="操作" width="160">
        <template #default="{ row }">
          <el-button text type="primary" size="small" @click="handleDetail(row)">编辑</el-button>
          <el-button text type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" align-center :title="title" append-to-body @close="close">
      <div style="height: 60vh; overflow-x: scroll">
        <el-form :model="form" :rules="rules" label-width="100px" ref="formRef">
          <el-form-item label="车牌号" prop="plate">
            <el-input v-model.trim="form.plate" placeholder="请输入车牌号" clearable/>
          </el-form-item>
          <el-form-item label="区域" prop="area">
            <el-select v-model="form.area" placeholder="请选择区域" clearable style="width: 100%">
              <el-option v-for="(item, index) in areaArr" :key="index" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="负责人" prop="leader">
            <el-select v-model="form.leader" placeholder="请选择负责人" clearable style="width: 100%">
              <el-option v-for="(item, index) in leaderArr" :key="index" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" clearable style="width: 100%">
              <el-option v-for="(item, index) in statusArr" :key="index" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model.trim="form.remark" type="textarea" :rows="3" placeholder="请输入备注信息" clearable/>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="close">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {CirclePlus, RefreshRight, Search, SwitchButton} from '@element-plus/icons-vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {logout} from '@/api/auth.js'
import {useRouter} from 'vue-router'
import {useTableStore} from '@/stores/tableStore.js'
import {storeToRefs} from 'pinia'

defineOptions({
  name: 'Index',
})

const router = useRouter()
const username = ref(localStorage.getItem('username') || '用户')

// 使用store管理表格数据
const tableStore = useTableStore()
const {tableData} = storeToRefs(tableStore)

const areaArr = ref([{
  label: "一区",
  value: "一区"
}, {
  label: "二区",
  value: "二区"
}, {
  label: "三区",
  value: "三区"
}, {
  label: "五区",
  value: "五区"
}, {
  label: "展厅区",
  value: "展厅区"
}, {
  label: "正一方区",
  value: "正一方区"
},])
const leaderArr = ref([{
  label: "叶",
  value: "叶"
}, {
  label: "敦",
  value: "敦"
}, {
  label: "吴",
  value: "吴"
}])
const statusArr = ref([{
  label: "未出库",
  value: "未出库"
}, {
  label: "装货中",
  value: "装货中"
}, {
  label: "已出库",
  value: "已出库"
}])

const searchForm = ref({
  plate: '',
  area: '',
  leader: '',
  status: ''
})

const handleSearch = () => {
  tableStore.loadData(searchForm.value)
}

const handleReset = () => {
  searchForm.value = {
    plate: '',
    area: '',
    leader: '',
    status: ''
  }
  tableStore.loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除车牌号为 ${row.plate} 的记录吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    const result = await tableStore.deleteTableRow(row.plate)
    if (result.success) {
      ElMessage.success('删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

onMounted(() => {
  tableStore.loadData()
})

const dialogVisible = ref(false)
const title = ref('')
const form = ref({
  plate: '',
  area: '',
  leader: '',
  remark: '',
  status: ''
})
const formRef = ref(null)

const rules = ref({
  plate: [
    {required: true, message: '请输入车牌号', trigger: 'blur'},
    {
      pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{4}[A-Z0-9挂学警港澳]$/,
      message: '请输入正确的车牌号格式',
      trigger: 'blur'
    }
  ],
  area: [
    {required: true, message: '请选择区域', trigger: 'change'}
  ],
  leader: [
    {required: true, message: '请选择负责人', trigger: 'change'}
  ],
  status: [
    {required: true, message: '请选择状态', trigger: 'change'}
  ],
  remark: [
    {max: 200, message: '备注信息不能超过200个字符', trigger: 'blur'}
  ]
})

const handleDetail = (row) => {
  if (row) {
    title.value = '编辑'
    form.value = {...row}
  } else {
    title.value = '新增'
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    if (title.value === '新增') {
      const result = await tableStore.addTableRow(form.value)
      if (result.success) {
        ElMessage.success('保存成功')
        close()
      } else {
        ElMessage.error('保存失败')
      }
    } else {
      const result = await tableStore.updateTableRow(form.value.plate, form.value)
      if (result.success) {
        ElMessage.success('更新成功')
        close()
      } else {
        ElMessage.error('更新失败')
      }
    }

  } catch (error) {
    console.log('表单验证失败:', error)
  }
}

const close = () => {
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.value = {
    plate: '',
    area: '',
    leader: '',
    remark: '',
    status: ''
  }
  dialogVisible.value = false
}

// 登出处理
const handleLogout = async () => {
  try {
    await logout()
    // 清除本地存储
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    ElMessage.success('已退出登录')
    // 跳转到登录页
    await router.push('/login')
  } catch (error) {
    console.error('登出失败:', error)
    // 即使API调用失败，也清除本地存储并跳转
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    await router.push('/login')
  }
}

</script>

<style scoped lang="scss">
.search-item {
  width: 200px;
}
</style>