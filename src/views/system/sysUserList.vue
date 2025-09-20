<!-- 系统管理----员工管理  -->

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card class="search-card">
        <el-form :model="parms" ref="searchForm" :inline="true" size="small">
          <el-form-item label="姓名">
            <el-input v-model="parms.loginName" clearable placeholder="请输入姓名" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="parms.phone" clearable placeholder="请输入电话" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchBtn" icon="el-icon-search">查询</el-button>
            <el-button @click="resetBtn" icon="el-icon-refresh">重置</el-button>
            <el-button v-if="hasPerm('sys:user:add')" @click="addUser" type="success" icon="el-icon-plus">新增员工</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 表格区域 -->
    <TableCard
      title="员工列表"
      :total="parms.total"
      @refresh="searchBtn"
      @reset="resetBtn"
    >
      <div class="table-area">
        <div class="table-skeleton" v-if="loading">
          <div class="skeleton-row" v-for="n in 6" :key="n"></div>
        </div>
        <el-table
          v-loading="loading"
          :data="tableList"
          :height="tableHeight"
          size="small"
          empty-text="暂无数据"
          stripe
          style="width: 100%">
          <el-table-column prop="loginName" label="姓名" min-width="150"></el-table-column>
          <el-table-column prop="phone" label="电话" min-width="160"></el-table-column>
          <el-table-column prop="idCard" label="身份证" min-width="200"></el-table-column>
          <el-table-column align="center" prop="sex" label="性别" width="100">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.sex == '1'" type="primary" size="mini">男</el-tag>
              <el-tag v-if="scope.row.sex == '0'" type="success" size="mini">女</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="status" label="在职状态" width="120">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :active-value="'0'"
                :inactive-value="'1'"
                active-text="在职"
                inactive-text="离职"
                @change="changeStatus(scope.row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="isUsed" label="启用状态" width="120">
            <template slot-scope="scope">
              <el-switch
                v-if="scope.row.isAdmin != '1'"
                v-model="scope.row.isUsed"
                :active-value="'0'"
                :inactive-value="'1'"
                active-text="启用"
                inactive-text="禁用"
                @change="changeUsed(scope.row)">
              </el-switch>
              <el-tag v-else type="warning" size="mini">管理员</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" width="300">
            <template slot-scope="scope">
              <el-button v-if="hasPerm('sys:user:edit')" type="primary" icon="el-icon-edit" size="mini"
                @click="editUser(scope.row)">编辑</el-button>
              <el-button v-if="hasPerm('sys:user:assignRole')" type="warning" icon="el-icon-user" size="mini"
                @click="assignRole(scope.row)">分配角色</el-button>
              <el-button v-if="hasPerm('sys:user:delete')" type="danger" icon="el-icon-delete" size="mini"
                @click="deleteUser(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <template slot="empty">
            <div class="empty-state">
              <div class="empty-planet"></div>
              <div class="empty-title">暂无数据</div>
              <div class="empty-subtitle">调整筛选条件或点击刷新重试</div>
              <el-button type="primary" size="mini" @click="searchBtn">刷新</el-button>
            </div>
          </template>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="sizeChange"
          @current-change="currentChange"
          :current-page.sync="parms.curentPage"
          :page-sizes="[10, 20, 40, 80, 100]"
          :page-size="parms.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="parms.total"
          background>
        </el-pagination>
      </div>
    </TableCard>

    <!-- 新增或编辑弹框 -->
    <sys-dialog :title="dialog.title" :visible="dialog.visible" :height="dialog.height" :width="dialog.width"
      @onClose="onClose" @onConfirm="onConfirm">
      <div slot="content">
        <el-form :model="addModel" ref="addForm" :rules="rules" label-width="80px" size="small">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="username" label="姓名">
                <el-input v-model="addModel.username" clearable placeholder="请输入姓名"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="sex" label="性别">
                <el-radio-group v-model="addModel.sex">
                  <el-radio :label="'1'">男</el-radio>
                  <el-radio :label="'0'">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="phone" label="电话">
                <el-input v-model="addModel.phone" clearable placeholder="请输入电话"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="idCard" label="身份证">
                <el-input v-model="addModel.idCard" clearable placeholder="请输入身份证"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="登录名">
                <el-input v-model="addModel.loginName" clearable placeholder="请输入登录名"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="密码">
                <el-input type="password" v-model="addModel.password" placeholder="请输入密码"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="status" label="在职状态">
                <el-radio-group v-model="addModel.status">
                  <el-radio :label="'0'">在职</el-radio>
                  <el-radio :label="'1'">离职</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="isUsed" label="启用状态">
                <el-radio-group v-model="addModel.isUsed">
                  <el-radio :label="'0'">启用</el-radio>
                  <el-radio :label="'1'">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </sys-dialog>

    <!-- 分配角色弹框 -->
    <sys-dialog :title="roleDialog.title" :height="roleDialog.height" :width="roleDialog.width"
      :visible="roleDialog.visible" @onClose="roleClose" @onConfirm="roleConfirm">
      <template slot="content">
        <el-table :height="roleHeight * 2.2" :data="roleList" stripe>
          <el-table-column width="50" align="center" label="选择">
            <template slot-scope="scope">
              <el-radio v-model="radio" :label="scope.row.roleId" @change="getCurrentRow(scope.row)"></el-radio>
            </template>
          </el-table-column>
          <el-table-column prop="roleName" label="角色名称"></el-table-column>
          <el-table-column prop="remark" label="角色备注"></el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination @size-change="roleSizeChange" @current-change="roleCurrentChange"
            :current-page.sync="roleParm.currentPage" :page-sizes="[10, 20, 40, 80, 100]" :page-size="roleParm.pageSize"
            layout="total, sizes, prev, pager, next, jumper" :total="roleParm.total" background>
          </el-pagination>
        </div>
      </template>
    </sys-dialog>
  </div>
</template>

<script>
import {
  getUserListApi,
  addUserApi,
  editUserApi,
  deleteUserApi,
  getRoleByUserIdApi,
  assignSaveApi
} from "@/api/user";
import SysDialog from "@/components/system/SysDialog";
import { getRoleListApi } from "@/api/role";

export default {
  components: { SysDialog },
  data() {
    return {
      loading: false,
      assignParm: { roleId: "", userId: "" },
      radio: "",
      roleHeight: 0,
      roleList: [],
      roleParm: { pageSize: 10, currentPage: 1, total: 0 },
      roleDialog: { title: "", height: 400, width: 800, visible: false },
      rules: {
        username: [{ required: true, trigger: "change", message: "请填写姓名" }],
        phone: [{ required: true, trigger: "change", message: "请填写电话" }],
        idCard: [{ required: true, trigger: "change", message: "请填写身份证" }],
        sex: [{ required: true, trigger: "change", message: "请选择性别" }],
        status: [{ required: true, trigger: "change", message: "请选择在职状态" }],
        isUsed: [{ required: true, trigger: "change", message: "请选择启用状态" }]
      },
      addModel: {
        userId: "",
        username: "",
        loginName: "",
        password: "",
        sex: "1",
        phone: "",
        idCard: "",
        status: "0",
        isUsed: "0"
      },
      dialog: { title: "", height: 300, width: 700, visible: false },
      tableHeight: 0,
      tableList: [],
      parms: { pageSize: 10, curentPage: 1, loginName: "", phone: "", total: 0 }
    };
  },
  created() { this.getUserList(); },
  mounted() { this.$nextTick(() => { this.tableHeight = window.innerHeight - 300; }); },
  methods: {
    async changeStatus(row) {
      if (row.status == "0") { row.status = "1"; } else { row.status = "0"; }
      let res = await editUserApi(row); if (res && res.code == 200) { this.$message.success(res.msg); this.getUserList(); }
    },
    async changeUsed(row) {
      if (row.isUsed == "0") { row.isUsed = "1"; } else { row.isUsed = "0"; }
      let res = await editUserApi(row); if (res && res.code == 200) { this.$message.success(res.msg); this.getUserList(); }
    },
    roleConfirm() {
      this.assignParm.userId = this.radio;
      if (this.assignParm.roleId == "") { this.$message.warning("请选择角色"); return; }
      if (this.assignParm.userId == "") { this.$message.warning("请选择需要分配的员工"); return; }
      assignSaveApi(this.assignParm).then((res) => { if (res && res.code == 200) { this.$message.success(res.msg); this.roleDialog.visible = false; } });
    },
    roleClose() { this.roleDialog.visible = false; },
    getCurrentRow(row) { this.assignParm.roleId = row.roleId; },
    async assignRole(row) {
      this.radio = row.userId; this.roleDialog.title = row.username + "——角色列表"; this.roleDialog.visible = true;
      let res = await getRoleListApi(this.roleParm); if (res && res.code == 200) { this.roleList = res.data.records; this.roleParm.total = res.data.total; }
    },
    editUser(row) {
      this.$resetForm("addForm", this.addModel); this.$objCoppy(row, this.addModel); this.dialog.title = "编辑员工"; this.dialog.visible = true;
    },
    async deleteUser(row) {
      let confirm = await this.$myconfirm("确定删除该数据吗？");
      if (confirm) { let res = await deleteUserApi({ userId: row.userId }); if (res && res.code == 200) { this.getUserList(); this.$message.success(res.msg); } }
    },
    addUser() { this.$resetForm("addForm", this.addModel); this.dialog.title = "新增员工"; this.dialog.visible = true; },
    searchBtn() { this.getUserList(); },
    resetBtn() { this.parms.loginName = ""; this.parms.phone = ""; this.getUserList(); },
    async getUserList() {
      this.loading = true;
      try {
        let res = await getUserListApi(this.parms);
        if (res.code == 200) { this.tableList = res.data.records; this.parms.total = res.data.total; }
      } finally {
        this.loading = false;
      }
    },
    sizeChange(val) { this.parms.pageSize = val; this.getUserList(); },
    currentChange(val) { this.parms.curentPage = val; this.getUserList(); }
  }
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
  /* 保持与通用组件样式一致 */
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

.card-subtitle {
  font-size: 14px;
  color: #909399;
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
