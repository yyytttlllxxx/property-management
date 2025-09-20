<!-- 用户----维修管理----我的维修 -->

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card class="search-card">
        <el-form :model="parms" ref="searchParm" label-width="80px" :inline="true" size="small">
          <el-form-item label="报修内容">
            <el-input v-model="parms.repairContent" clearable placeholder="请输入报修内容" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="是否处理">
            <el-radio-group v-model="parms.status">
              <el-radio label="">全部</el-radio>
              <el-radio label="0">未处理</el-radio>
              <el-radio label="1">已处理</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="searchBtn">查询</el-button>
            <el-button icon="el-icon-refresh" @click="resetBtn">重置</el-button>
            <el-button v-if="hasPerm('sys:myRepair:add')" type="success" icon="el-icon-plus" @click="addBtn">新增</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <div slot="header" class="card-header">
        <span class="card-title">我的维修列表</span>
        <span class="card-subtitle">共 {{ parms.total }} 条记录</span>
      </div>
      
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button icon="el-icon-refresh" size="mini" @click="getMyList" :loading="loading">刷新</el-button>
          <el-button icon="el-icon-delete" size="mini" @click="resetFilters">清空筛选</el-button>
          <el-button icon="el-icon-download" size="mini" @click="exportData">导出CSV</el-button>
        </div>
        <div class="toolbar-right">
          <el-tooltip content="刷新列表" placement="top">
            <el-button icon="el-icon-refresh" circle size="mini" @click="getMyList"></el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 骨架屏覆盖层 -->
      <div v-if="loading" class="skeleton-overlay">
        <div class="skeleton-table">
          <div class="skeleton-header">
            <div class="skeleton-cell" v-for="i in 5" :key="i"></div>
          </div>
          <div class="skeleton-row" v-for="j in 5" :key="j">
            <div class="skeleton-cell" v-for="k in 5" :key="k"></div>
          </div>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :height="tableHeight"
        :data="tableList"
        stripe
        style="width: 100%">
        <el-table-column label="报修内容" prop="repairContent" min-width="200"></el-table-column>
        <el-table-column label="报修地址" prop="repairAddress" min-width="200"></el-table-column>
        <el-table-column label="联系电话" prop="phone" min-width="120"></el-table-column>
        <el-table-column label="处理状态" prop="status" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == '1'" type="success" size="small">已处理</el-tag>
            <el-tag v-if="scope.row.status == '0'" type="danger" size="small">未处理</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" width="200" label="操作">
          <template slot-scope="scope">
            <el-button v-if="hasPerm('sys:myRepair:edit')" type="primary" icon="el-icon-edit" size="mini"
              @click="editBtn(scope.row)">编辑</el-button>
            <el-button v-if="hasPerm('sys:myRepair:delete')" type="danger" icon="el-icon-delete" size="mini"
              @click="deleteBtn(scope.row)">删除</el-button>
          </template>
        </el-table-column>

        <!-- 空状态插槽 -->
        <template slot="empty">
          <div class="empty-state">
            <div class="empty-icon">
              <i class="el-icon-document"></i>
            </div>
            <div class="empty-text">暂无维修记录</div>
            <div class="empty-description">您还没有提交过维修申请</div>
            <el-button v-if="hasPerm('sys:myRepair:add')" type="primary" icon="el-icon-plus" @click="addBtn">
              立即提交维修申请
            </el-button>
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

    <!-- 新增弹框 -->
    <sys-dialog :title="addDialog.title" :height="addDialog.height" :width="addDialog.width"
      :visible="addDialog.visible" @onClose="onClose" @onConfirm="onConfirm">
      <template slot="content">
        <el-form :model="addModel" ref="addForm" :rules="rules" label-width="80px" :inline="false" size="small">
          <el-form-item prop="repairContent" label="维修内容">
            <el-input type="textarea" v-model="addModel.repairContent" placeholder="请详细描述需要维修的问题"></el-input>
          </el-form-item>
          <el-form-item prop="repairAddress" label="维修地点">
            <el-input v-model="addModel.repairAddress" placeholder="请输入具体的维修地址"></el-input>
          </el-form-item>
          <el-form-item prop="phone" label="联系电话">
            <el-input v-model="addModel.phone" placeholder="请输入您的联系电话"></el-input>
          </el-form-item>
        </el-form>
      </template>
    </sys-dialog>
  </div>
</template>

<script>
import { getMyListApi, addApi, editApi, deleteApi } from "@/api/repair";
import { getUserId } from "@/utils/auth";
import SysDialog from "@/components/system/SysDialog.vue";
export default {
  components: {
    SysDialog,
  },
  data() {
    return {
      loading: false,
      //表单验证规则
      rules: {
        repairContent: [
          {
            trigger: "change",
            required: true,
            message: "请填写维修内容",
          },
        ],
        repairAddress: [
          {
            trigger: "change",
            required: true,
            message: "请填写维修地址",
          },
        ],
        phone: [
          {
            trigger: "change",
            required: true,
            message: "请填写联系电话",
          },
        ],
      },
      //表单数据域
      addModel: {
        editType: "",
        repairId: "",
        userId: "",
        phone: "",
        repairAddress: "",
        repairContent: "",
      },
      //弹框属性定义
      addDialog: {
        title: "",
        height: 200,
        width: 650,
        visible: false,
      },
      //表格高度
      tableHeight: 0,
      //表格数据
      tableList: [],
      parms: {
        total: 0,
        currentPage: 1,
        pageSize: 10,
        userId: "",
        repairContent: "",
        status: "",
      },
    };
  },
  created() {
    this.getMyList();
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 280;
    });
  },
  methods: {
    // 导出数据
    exportData() {
      // 简单的CSV导出实现
      if (this.tableList.length === 0) {
        this.$message.warning('暂无数据可导出');
        return;
      }
      
      const headers = ['报修内容', '报修地址', '联系电话', '处理状态'];
      const csvContent = [
        headers.join(','),
        ...this.tableList.map(row => [
          `"${row.repairContent}"`,
          `"${row.repairAddress}"`,
          `"${row.phone}"`,
          row.status === '1' ? '已处理' : '未处理'
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `我的维修列表_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // 清空筛选
    resetFilters() {
      this.parms.repairContent = "";
      this.parms.status = "";
      this.parms.currentPage = 1;
      this.getMyList();
      this.$message.success('筛选条件已清空');
    },
    //弹框确认事件
    onConfirm() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          //设置用户id
          this.addModel.userId = getUserId();
          let res = null;
          if (this.addModel.editType == "0") {
            res = await addApi(this.addModel);
          } else {
            res = await editApi(this.addModel);
          }
          if (res && res.code == 200) {
            //刷新表格
            this.getMyList();
            //信息提示
            this.$message.success(res.msg);
            this.addDialog.visible = false;
          }
        }
      });
    },
    //弹框关闭
    onClose() {
      this.addDialog.visible = false;
    },
    //页数改变时触发
    currentChange(val) {
      this.parms.currentPage = val;
      this.getMyList();
    },
    //页容量改变时触发
    sizeChange(val) {
      this.parms.pageSize = val;
      this.getMyList();
    },
    //删除按钮
    async deleteBtn(row) {
      //信息提示
      let confirm = await this.$myconfirm("确定删除该数据吗?");
      if (confirm) {
        let res = await deleteApi({ repairId: row.repairId });
        if (res && res.code == 200) {
          //刷新列表
          this.getMyList();
          this.$message.success(res.msg);
        }
      }
    },
    //编辑按钮
    editBtn(row) {
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //把当前要编辑的数据复制到表单数据域
      this.$objCoppy(row, this.addModel);
      //设置编辑属性
      this.addModel.editType = "1";
      //设置弹框属性
      this.addDialog.title = "编辑维修";
      this.addDialog.visible = true;
    },
    //新增按钮
    addBtn() {
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置编辑属性
      this.addModel.editType = "0";
      //设置弹框属性
      this.addDialog.title = "新增维修";
      this.addDialog.visible = true;
    },
    //重置按钮
    resetBtn() {
      this.parms.repairContent = "";
      this.parms.status = "";
      this.parms.currentPage = 1;
      this.getMyList();
    },
    //搜索按钮
    searchBtn() {
      this.parms.currentPage = 1;
      this.getMyList();
    },
    //获取列表
    async getMyList() {
      this.loading = true;
      try {
        this.parms.userId = getUserId();
        let res = await getMyListApi(this.parms);
        if (res && res.code == 200) {
          //表格数据赋值
          console.log(res);
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
}

.filter-container {
  margin-bottom: 20px;
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-subtitle {
  font-size: 14px;
  color: #909399;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.skeleton-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-table {
  width: 100%;
  max-width: 800px;
}

.skeleton-header,
.skeleton-row {
  display: flex;
  margin-bottom: 12px;
}

.skeleton-cell {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  margin-right: 20px;
  border-radius: 4px;
  flex: 1;
}

.skeleton-header .skeleton-cell {
  height: 24px;
  background: #e0e0e0;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #dcdfe6;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #909399;
  margin-bottom: 24px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 20px 0 0;
}

::v-deep .el-card__body {
  padding: 20px;
}

::v-deep .el-table {
  border-radius: 4px;
}

::v-deep .el-table th {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

::v-deep .el-button--mini {
  padding: 5px 8px;
  font-size: 12px;
}

::v-deep .el-form-item {
  margin-bottom: 18px;
}
</style>
