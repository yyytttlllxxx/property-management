<!--管理员---- 房屋管理-----楼栋管理 -->

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card class="search-card">
        <el-form :model="parm" ref="searchForm" :inline="true" size="small">
          <el-form-item label="楼栋名称">
            <el-input v-model="parm.name" clearable placeholder="请输入楼栋名称" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="楼栋类型">
            <el-select v-model="parm.type" placeholder="请选择楼栋类型" clearable filterable style="width: 200px;">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="searchBtn">查询</el-button>
            <el-button icon="el-icon-refresh" @click="cancelBtn">重置</el-button>
            <el-button v-if="hasPerm('sys:houseBuilding:add')" type="success" icon="el-icon-plus"
              @click="addBtn">新增楼栋</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <div slot="header" class="card-header">
        <span class="card-title">楼栋列表</span>
        <div class="card-actions">
          <span class="card-subtitle">共 {{ parm.total }} 条记录</span>
          <el-button-group size="small" style="margin-left: 12px;">
            <el-button icon="el-icon-refresh" @click="getList">刷新</el-button>
            <el-button icon="el-icon-delete" @click="resetFilters">清空筛选</el-button>
            <el-button icon="el-icon-download" @click="exportData">导出CSV</el-button>
          </el-button-group>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :height="tableHeight"
        :data="tableList"
        stripe
        style="width: 100%">
        <el-table-column prop="name" label="楼栋名称" min-width="200"></el-table-column>
        <el-table-column prop="orderNum" label="序号" width="100" align="center"></el-table-column>
        <el-table-column prop="type" label="楼栋类型" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type == '0'" type="success" size="mini">普通房</el-tag>
            <el-tag v-if="scope.row.type == '1'" type="warning" size="mini">电梯房</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="200" label="操作" align="center">
          <template slot-scope="scope">
            <el-button v-if="hasPerm('sys:houseBuilding:edit')" icon="el-icon-edit" type="primary"
              @click="editBtn(scope.row)" size="mini">编辑</el-button>
            <el-button v-if="hasPerm('sys:houseBuilding:delete')" icon="el-icon-delete" type="danger"
              @click="deleteBtn(scope.row)" size="mini">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-state">
            <i class="el-icon-office-building" style="font-size: 48px; color: #c0c4cc;"></i>
            <p style="margin: 12px 0 0; color: #909399;">暂无楼栋数据</p>
          </div>
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="sizeChange"
          @current-change="currentChange"
          :current-page.sync="parm.currentPage"
          :page-sizes="[10, 20, 40, 80, 100]"
          :page-size="parm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="parm.total"
          background>
        </el-pagination>
      </div>
    </el-card>

    <!-- 新增/编辑楼栋弹框 -->
    <sys-dialog :title="addDialog.title" :height="addDialog.height" :width="addDialog.width"
      :visible="addDialog.visible" @onClose="onClose" @onConfirm="onConfirm">
      <template slot="content">
        <el-form :model="addModle" ref="addRef" :rules="rules" label-width="80px" size="small">
          <el-form-item prop="name" label="楼栋名称">
            <el-input v-model="addModle.name" clearable placeholder="请输入楼栋名称"></el-input>
          </el-form-item>
          <el-form-item prop="type" label="楼栋类型">
            <el-select v-model="addModle.type" placeholder="请选择楼栋类型" style="width: 100%;">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="楼栋序号">
            <el-input type="number" v-model="addModle.orderNum" clearable placeholder="请输入楼栋序号"></el-input>
          </el-form-item>
        </el-form>
      </template>
    </sys-dialog>
  </div>
</template>

<script>
import { getListApi, addApi, editApi, deleteApi } from "@/api/building";
import SysDialog from "@/components/system/SysDialog.vue";

export default {
  components: { SysDialog },
  data() {
    return {
      loading: false,
      rules: {
        name: [{ trigger: "change", required: true, message: "请填写楼栋名称" }],
        type: [{ trigger: "change", required: true, message: "请选择楼栋类型" }],
      },
      addModle: {
        buildId: "",
        editType: "", //0新增 1：编辑
        type: "", //0：普通房 1：电梯房
        name: "",
        orderNum: "",
      },
      addDialog: { title: "", height: 220, width: 500, visible: false },
      tableHeight: 0,
      options: [
        { value: "0", label: "普通房" },
        { value: "1", label: "电梯房" },
      ],
      tableList: [],
      parm: { name: "", type: "", pageSize: 10, currentPage: 1, total: 0 },
    };
  },
  created() { this.getList(); },
  mounted() { this.$nextTick(() => { this.tableHeight = window.innerHeight - 280; }); },
  methods: {
    onConfirm() {
      this.$refs.addRef.validate(async (valid) => {
        if (valid) {
          let res = this.addModle.editType == "0" ? await addApi(this.addModle) : await editApi(this.addModle);
          if (res && res.code == 200) {
            this.$message.success(res.msg);
            this.addDialog.visible = false;
            this.getList();
          }
        }
      });
    },
    onClose() { this.addDialog.visible = false; },
    addBtn() {
      this.$resetForm("addRef", this.addModle);
      this.addModle.editType = "0";
      this.addDialog.title = "新增楼栋";
      this.addDialog.visible = true;
    },
    cancelBtn() { this.parm.name = ""; this.parm.type = ""; this.getList(); },
    sizeChange(val) { this.parm.pageSize = val; this.getList(); },
    currentChange(val) { this.parm.currentPage = val; this.getList(); },
    async deleteBtn(row) {
      const confirm = await this.$myconfirm("确定删除该楼栋吗？");
      if (confirm) {
        let res = await deleteApi({ buildId: row.buildId });
        if (res && res.code == 200) { this.$message.success(res.msg); this.getList(); }
      }
    },
    editBtn(row) {
      this.$resetForm("addRef", this.addModle);
      this.addModle.editType = "1";
      this.addDialog.title = "编辑楼栋";
      this.addDialog.visible = true;
      this.$objCoppy(row, this.addModle);
    },
    searchBtn() { this.getList(); },
    // 仅新增无副作用方法
    resetFilters() { this.parm.name = ""; this.parm.type = ""; this.parm.currentPage = 1; this.getList(); },
    exportData() {
      if (this.tableList.length === 0) { this.$message.warning('暂无数据可导出'); return; }
      const header = '楼栋名称,序号,楼栋类型\n';
      const body = this.tableList.map(r => `${r.name},${r.orderNum},${r.type === '1' ? '电梯房' : '普通房'}`).join('\n');
      const csvContent = `data:text/csv;charset=utf-8,\uFEFF${header}${body}`;
      const link = document.createElement('a');
      link.href = encodeURI(csvContent);
      link.download = `楼栋列表_${new Date().toLocaleDateString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    async getList() {
      this.loading = true;
      try {
        let res = await getListApi(this.parm);
        if (res && res.code == 200) {
          this.tableList = res.data.records;
          this.parm.total = res.data.total;
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.filter-container {
  margin-bottom: 20px;
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-actions { display: flex; align-items: center; }

.card-subtitle {
  font-size: 14px;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0 0;
}

.empty-state { text-align: center; padding: 40px 0; }

::v-deep .el-card__body { padding: 20px; }
::v-deep .el-table { border-radius: 4px; }
::v-deep .el-table th { background-color: #fafafa; color: #606266; font-weight: 600; }
::v-deep .el-button--mini { padding: 5px 8px; font-size: 12px; }
::v-deep .el-form-item { margin-bottom: 18px; }
</style>
