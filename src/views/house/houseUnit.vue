<!--管理员---- 房屋管理----单元管理 -->

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card class="search-card">
        <el-form :model="parms" ref="searchForm" :inline="true" size="small">
          <el-form-item label="楼栋名称">
            <el-input v-model="parms.buildNme" clearable placeholder="请输入楼栋名称" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="单元名称">
            <el-input v-model="parms.unitName" clearable placeholder="请输入单元名称" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="searchBtn">查询</el-button>
            <el-button icon="el-icon-refresh" @click="resetBtn">重置</el-button>
            <el-button v-if="hasPerm('sys:houseUnit:add')" type="success" icon="el-icon-plus" @click="addBtn">新增单元</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <div slot="header" class="card-header">
        <span class="card-title">单元列表</span>
        <div class="card-actions">
          <span class="card-subtitle">共 {{ parms.total }} 条记录</span>
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
        <el-table-column prop="unitName" label="单元名称" min-width="200"></el-table-column>
        <el-table-column width="200" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-if="hasPerm('sys:houseUnit:edit')" type="primary" icon="el-icon-edit" size="mini"
              @click="editBtn(scope.row)">编辑</el-button>
            <el-button v-if="hasPerm('sys:houseUnit:delete')" type="danger" icon="el-icon-delete" size="mini"
              @click="deleteBtn(scope.row)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-state">
            <i class="el-icon-s-grid" style="font-size: 48px; color: #c0c4cc;"></i>
            <p style="margin: 12px 0 0; color: #909399;">暂无单元数据</p>
          </div>
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="sizeChange"
          @current-change="currentChange"
          :current-page.sync="parms.currentPage"
          :page-sizes="[10, 20, 40, 80, 100]"
          :page-size="parms.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="parms.total"
          background>
        </el-pagination>
      </div>
    </el-card>

    <!-- 新增/编辑单元弹框 -->
    <sys-dialog :title="addDialog.title" :height="addDialog.height" :width="addDialog.width"
      :visible="addDialog.visible" @onClose="onClose" @onConfirm="onConfirm">
      <template slot="content">
        <el-form :model="addModel" ref="addForm" :rules="rules" label-width="80px" size="small">
          <el-form-item prop="buildId" label="所属楼栋">
            <el-select v-model="addModel.buildId" placeholder="请选择楼栋" style="width: 100%;">
              <el-option v-for="item in buildTableList" :key="item.buildId" :label="item.name" :value="item.buildId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="unitName" label="单元名称">
            <el-input v-model="addModel.unitName" clearable placeholder="请输入单元名称"></el-input>
          </el-form-item>
        </el-form>
      </template>
    </sys-dialog>
  </div>
</template>

<script>
import { getListApi, addApi, unitListApi, editApi, deleteApi } from "@/api/houseUnit";
import SysDialog from "@/components/system/SysDialog.vue";

export default {
  components: { SysDialog },
  data() {
    return {
      loading: false,
      buildTableList: [],
      rules: {
        buildId: [{ trigger: "change", required: true, message: "请选择所属楼栋" }],
        unitName: [{ trigger: "change", required: true, message: "请填写单元名称" }],
      },
      addModel: { editType: "", unitId: "", buildId: "", unitName: "" },
      addDialog: { title: "", height: 180, width: 500, visible: false },
      tableHeight: 0,
      tableList: [],
      parms: { buildNme: "", unitName: "", currentPage: 1, pageSize: 10, total: 0 },
    };
  },
  created() { this.getList(); this.getBuildList(); },
  mounted() { this.$nextTick(() => { this.tableHeight = window.innerHeight - 280; }); },
  methods: {
    async getBuildList() {
      let res = await unitListApi();
      if (res && res.code == 200) { this.buildTableList = res.data; }
    },
    onConfirm() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          let res = this.addModel.editType == "0" ? await addApi(this.addModel) : await editApi(this.addModel);
          if (res && res.code == 200) { this.getList(); this.$message.success(res.msg); this.addDialog.visible = false; }
        }
      });
    },
    onClose() { this.addDialog.visible = false; },
    currentChange(val) { this.parms.currentPage = val; this.getList(); },
    sizeChange(val) { this.parms.pageSize = val; this.getList(); },
    async deleteBtn(row) {
      const confirm = await this.$myconfirm('确定删除该单元吗?');
      if (confirm) {
        let res = await deleteApi({ unitId: row.unitId });
        if (res && res.code == 200) { this.getList(); this.$message.success(res.msg); }
      }
    },
    editBtn(row) {
      this.$resetForm("addForm", this.addModel);
      this.addModel.editType = "1";
      this.addDialog.title = '编辑单元';
      this.addDialog.visible = true;
      this.$objCoppy(row, this.addModel);
    },
    addBtn() {
      this.$resetForm("addForm", this.addModel);
      this.addModel.editType = "0";
      this.addDialog.title = "新增单元";
      this.addDialog.visible = true;
    },
    resetBtn() { this.parms.buildNme = ""; this.parms.unitName = ""; this.getList(); },
    searchBtn() { this.getList(); },
    // 仅新增无副作用方法
    resetFilters() { this.parms.buildNme = ""; this.parms.unitName = ""; this.parms.currentPage = 1; this.getList(); },
    exportData() {
      if (this.tableList.length === 0) { this.$message.warning('暂无数据可导出'); return; }
      const header = '楼栋名称,单元名称\n';
      const body = this.tableList.map(r => `${r.name},${r.unitName}`).join('\n');
      const csvContent = `data:text/csv;charset=utf-8,\uFEFF${header}${body}`;
      const link = document.createElement('a');
      link.href = encodeURI(csvContent);
      link.download = `单元列表_${new Date().toLocaleDateString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    async getList() {
      this.loading = true;
      try {
        let res = await getListApi(this.parms);
        if (res && res.code == 200) {
          this.tableList = res.data.records;
          this.parms.total = res.data.total;
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
