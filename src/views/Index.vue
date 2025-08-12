<template>
  <div style="width: 100%; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="车牌号">
        <el-input class="search-item" v-model.trim="searchForm.plate" placeholder="请输入车牌号" clearable />
      </el-form-item>
      <el-form-item label="区域">
        <el-select class="search-item" v-model="searchForm.area" placeholder="请选择区域" clearable>
          <el-option label="一区" value="一区" />
          <el-option label="二区" value="二区" />
          <el-option label="三区" value="三区" />
          <el-option label="四区" value="四区" />
          <el-option label="五区" value="五区" />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人">
        <el-select class="search-item" v-model="searchForm.leader" placeholder="请选择负责人" clearable>
          <el-option label="叶" value="叶" />
          <el-option label="敦" value="敦" />
          <el-option label="吴" value="吴" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select class="search-item" v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option label="未出库" value="未出库" />
          <el-option label="装货中" value="装货中" />
          <el-option label="已出库" value="已出库" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="success" @click="handleAdd">添加</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" highlight-current-row border show-overflow-tooltip stripe style="height: 80vh">
      <el-table-column header-align="center" type="index" width="60" label="序号"/>
      <el-table-column header-align="center" prop="plate" label="车牌号" width="180"/>
      <el-table-column header-align="center" prop="area" label="区域" width="180"/>
      <el-table-column header-align="center" prop="leader" label="负责人" width="120"/>
      <el-table-column header-align="center" align="center" prop="status" label="状态" width="120"/>
      <el-table-column header-align="center" prop="remark" label="备注"/>
      <el-table-column header-align="center" label="操作" width="160">
        <template #default="{ row }">
          <el-button text type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button text type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>

defineOptions({
  name: 'Index',
})

const tableData = [
  {"plate": "川A1FJVL", "area": "三区", "leader": "吴", "remark": "易碎品", "status": "已出库"},
  {"plate": "蒙GDUA82", "area": "一区", "leader": "吴", "remark": "需加急处理", "status": "已出库"},
  {"plate": "桂K5PJYG", "area": "四区", "leader": "吴", "remark": "冷链运输", "status": "未出库"},
  {"plate": "苏CXP8BL", "area": "五区", "leader": "吴", "remark": "急单", "status": "未出库"},
  {"plate": "新YUCQGY", "area": "四区", "leader": "吴", "remark": "需加急处理", "status": "装货中"},
  {"plate": "赣ASE5UU", "area": "五区", "leader": "吴", "remark": "急单", "status": "装货中"},
  {"plate": "鄂ZPZLEX", "area": "三区", "leader": "吴", "remark": "大件", "status": "未出库"},
  {"plate": "渝OR6FOX", "area": "四区", "leader": "吴", "remark": "无", "status": "装货中"},
  {"plate": "青D3QC44", "area": "二区", "leader": "吴", "remark": "客户自提", "status": "已出库"},
  {"plate": "湘F8S28X", "area": "一区", "leader": "吴", "remark": "冷链运输", "status": "未出库"},
  {"plate": "川QHKF22", "area": "五区", "leader": "吴", "remark": "无", "status": "装货中"},
  {"plate": "吉5GFPF4", "area": "四区", "leader": "吴", "remark": "易碎品", "status": "装货中"},
  {"plate": "桂NUC5R5", "area": "三区", "leader": "吴", "remark": "需加急处理", "status": "未出库"},
  {"plate": "蒙9D5XTG", "area": "一区", "leader": "吴", "remark": "无", "status": "未出库"},
  {"plate": "京M51JHL", "area": "五区", "leader": "吴", "remark": "无", "status": "未出库"},
  {"plate": "赣ESWMT6", "area": "二区", "leader": "吴", "remark": "无", "status": "装货中"},
  {"plate": "皖P9T62H", "area": "四区", "leader": "吴", "remark": "冷链运输", "status": "装货中"},
  {"plate": "桂RO7A4M", "area": "三区", "leader": "叶", "remark": "易碎品", "status": "未出库"},
  {"plate": "川G1DKP4", "area": "三区", "leader": "叶", "remark": "普通货物", "status": "已出库"},
  {"plate": "黑Q2F9RE", "area": "三区", "leader": "叶", "remark": "危险品", "status": "装货中"},
  {"plate": "苏HZRHM9", "area": "二区", "leader": "叶", "remark": "易碎品", "status": "装货中"},
  {"plate": "新UKXFZY", "area": "一区", "leader": "叶", "remark": "大件", "status": "装货中"},
  {"plate": "川QFJHMN", "area": "三区", "leader": "叶", "remark": "普通货物", "status": "装货中"},
  {"plate": "赣J9T8X3", "area": "四区", "leader": "叶", "remark": "普通货物", "status": "已出库"},
  {"plate": "鄂4XQW7Z", "area": "一区", "leader": "叶", "remark": "无", "status": "未出库"},
  {"plate": "京X9LHWV", "area": "五区", "leader": "叶", "remark": "客户自提", "status": "未出库"},
  {"plate": "皖C7H5P1", "area": "三区", "leader": "叶", "remark": "需加急处理", "status": "装货中"},
  {"plate": "渝EK59M1", "area": "四区", "leader": "叶", "remark": "无", "status": "装货中"},
  {"plate": "湘FKY6RL", "area": "二区", "leader": "叶", "remark": "急单", "status": "装货中"},
  {"plate": "蒙OZ7RKP", "area": "五区", "leader": "叶", "remark": "无", "status": "未出库"},
  {"plate": "黑VCQ8KA", "area": "四区", "leader": "叶", "remark": "冷链运输", "status": "装货中"},
  {"plate": "鄂WUS29M", "area": "三区", "leader": "叶", "remark": "危险品", "status": "装货中"},
  {"plate": "晋L9M7ZX", "area": "二区", "leader": "敦", "remark": "普通货物", "status": "已出库"},
  {"plate": "黑GKVMC7", "area": "三区", "leader": "敦", "remark": "危险品", "status": "未出库"},
  {"plate": "赣MTB2WQ", "area": "五区", "leader": "敦", "remark": "客户自提", "status": "装货中"},
  {"plate": "苏X3FHMY", "area": "四区", "leader": "叶", "remark": "急单", "status": "未出库"},
  {"plate": "川P8ZVNG", "area": "一区", "leader": "叶", "remark": "易碎品", "status": "装货中"},
  {"plate": "蒙ULFW83", "area": "五区", "leader": "叶", "remark": "无", "status": "已出库"},
  {"plate": "宁XZV9JP", "area": "三区", "leader": "叶", "remark": "需加急处理", "status": "装货中"},
  {"plate": "京FY1H8O", "area": "四区", "leader": "叶", "remark": "危险品", "status": "已出库"},
  {"plate": "皖SJTCL4", "area": "二区", "leader": "叶", "remark": "普通货物", "status": "装货中"},
  {"plate": "鄂XJ7UPY", "area": "一区", "leader": "叶", "remark": "客户自提", "status": "未出库"},
  {"plate": "赣Q4M8KP", "area": "五区", "leader": "叶", "remark": "无", "status": "装货中"},
  {"plate": "新CB2JYO", "area": "四区", "leader": "叶", "remark": "冷链运输", "status": "装货中"},
  {"plate": "湘VKRW1M", "area": "三区", "leader": "叶", "remark": "急单", "status": "未出库"},
  {"plate": "冀MYZW3F", "area": "一区", "leader": "叶", "remark": "大件", "status": "装货中"},
  {"plate": "桂U1WZYJ", "area": "二区", "leader": "叶", "remark": "普通货物", "status": "未出库"},
  {"plate": "京M6JOPV", "area": "三区", "leader": "叶", "remark": "无", "status": "已出库"},
  {"plate": "川FD9YHV", "area": "四区", "leader": "叶", "remark": "需加急处理", "status": "装货中"},
  {"plate": "蒙C4P8UY", "area": "五区", "leader": "叶", "remark": "易碎品", "status": "已出库"},
  {"plate": "京MX4QYB", "area": "四区", "leader": "叶", "remark": "急单", "status": "已出库"},
  {"plate": "川5FVB9N", "area": "五区", "leader": "叶", "remark": "危险品", "status": "装货中"},
  {"plate": "蒙ZG9VHE", "area": "三区", "leader": "叶", "remark": "需加急处理", "status": "已出库"},
  {"plate": "渝OPJ9TV", "area": "一区", "leader": "叶", "remark": "无", "status": "未出库"},
  {"plate": "宁QFJY81", "area": "四区", "leader": "叶", "remark": "大件", "status": "装货中"},
  {"plate": "湘ZYW5TJ", "area": "五区", "leader": "叶", "remark": "客户自提", "status": "已出库"},
  {"plate": "黑V1KY4M", "area": "三区", "leader": "叶", "remark": "普通货物", "status": "装货中"},
  {"plate": "赣JMQKYN", "area": "二区", "leader": "叶", "remark": "急单", "status": "未出库"},
  {"plate": "苏XZ3FPK", "area": "一区", "leader": "叶", "remark": "需加急处理", "status": "装货中"},
  {"plate": "京LMOVRX", "area": "四区", "leader": "叶", "remark": "无", "status": "装货中"}
]

const searchForm = ref({
  plate: '',
  area: ''
})

const filteredData = computed(() => {
  return tableData.value.filter(item => {
    const matchPlate = !searchForm.value.plate || item.plate.includes(searchForm.value.plate)
    const matchArea = !searchForm.value.area || item.area === searchForm.value.area
    return matchPlate && matchArea
  })
})

const handleSearch = () => {
  // 因为 filteredData 是 computed，这里不需要额外操作
  console.log('搜索条件：', searchForm.value)
}

const handleAdd = () => {
  tableData.value.push({
    plate: '新车牌',
    area: '一区',
    leader: '新负责人',
    remark: '备注',
    status: '未出库'
  })
}

const handleEdit = (row) => {
  console.log('编辑行：', row)
  // 这里可以弹出一个编辑表单
}

const handleDelete = (row) => {
  tableData.value = tableData.value.filter(item => item !== row)
}

</script>

<style scoped lang="scss">
  .search-item {
    width: 200px;
  }
</style>