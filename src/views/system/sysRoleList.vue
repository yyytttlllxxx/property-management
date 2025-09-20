<!-- 系统管理---角色管理 -->

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card class="search-card">
        <el-form :model="parms" ref="searchForm" :inline="true" size="small">
          <el-form-item label="角色名称">
            <el-input v-model="parms.roleName" clearable placeholder="请输入角色名称" style="width: 200px;"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="searchBtn">查询</el-button>
            <el-button icon="el-icon-refresh" @click="resetBtn">重置</el-button>
            <el-button v-if="hasPerm('sys:role:add')" type="success" icon="el-icon-plus" @click="addBtn">新增角色</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 表格区域 -->
    <TableCard
      title="角色列表"
      :total="parms.total"
      @refresh="searchBtn"
      @reset="resetBtn"
    >
      <el-table
        :height="tableHeight"
        size="small"
        :data="roleList"
        stripe
        style="width: 100%">
        <el-table-column label="角色名称" prop="roleName" min-width="250"></el-table-column>
        <el-table-column label="角色描述" prop="remark" min-width="400"></el-table-column>
        <el-table-column align="center" width="300" label="操作">
          <template slot-scope="scope">
            <div class="ops">
              <el-button v-if="hasPerm('sys:role:edit')" type="primary" icon="el-icon-edit" size="mini"
                @click="editBtn(scope.row)">编辑</el-button>
              <el-button v-if="hasPerm('sys:role:assignMenu')" type="warning" icon="el-icon-s-operation" size="mini"
                @click="assignRoleBtn(scope.row)">分配权限</el-button>
              <el-button v-if="hasPerm('sys:role:delete')" type="danger" icon="el-icon-delete" size="mini"
                @click="deleteBtn(scope.row)">删除</el-button>
            </div>
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
    </TableCard>

    <!-- 新增/编辑角色弹框 -->
    <sys-dialog :title="dialog.title" :height="dialog.height" :width="dialog.width" :visible="dialog.visible"
      @onClose="onClose" @onConfirm="onConfirm">
      <div slot="content">
        <el-form :model="addModel" ref="addForm" :rules="rules" label-width="80px" size="small">
          <el-form-item prop="roleName" label="角色名称">
            <el-input v-model="addModel.roleName" clearable placeholder="请输入角色名称"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input
              v-model="addModel.remark"
              type="textarea"
              :rows="3"
              clearable
              placeholder="请输入角色描述">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </sys-dialog>

    <!-- 分配权限弹框 -->
    <sys-dialog :title="assignDialog.title" :width="assignDialog.width" :height="assignDialog.height"
      :visible="assignDialog.visible" @onClose="assignClose" @onConfirm="assignConfirm">
      <template slot="content">
        <div class="tree-container">
          <el-tree
            ref="assignTree"
            :data="assignTreeData"
            node-key="menuId"
            :props="defaultProps"
            empty-text="暂无数据"
            :show-checkbox="true"
            default-expand-all
            :default-checked-keys="assignTreeChecked">
          </el-tree>
        </div>
      </template>
    </sys-dialog>
  </div>
</template>

<script>
import {
  getRoleListApi,
  addRoleApi,
  editRoleApi,
  deleteRoleApi,
  getAssignTreeApi,
  assignSaveApi,
} from "@/api/role";
import SysDialog from "@/components/system/SysDialog";
import { getUserId } from "@/utils/auth";

export default {
  components: { SysDialog },
  data() {
    return {
      defaultProps: { children: "children", label: "menuLabel" },
      roleId: "",
      assignTreeData: [],
      assignTreeChecked: [],
      assignDialog: { title: "", width: 400, height: 500, visible: false },
      rules: { roleName: [{ required: true, trigger: "change", message: "请填写角色名称" }] },
      addModel: { type: "", roleId: "", roleName: "", remark: "" },
      dialog: { title: "", height: 200, width: 500, visible: false },
      roleList: [],
      tableHeight: 0,
      parms: { pageSize: 10, currentPage: 1, roleName: "", total: 0 },
    };
  },
  created() { this.getRoleList(); },
  mounted() { this.$nextTick(() => { this.tableHeight = window.innerHeight - 280; }); },
  methods: {
    async assignConfirm() {
      let ids = this.$refs.assignTree.getCheckedKeys().concat(this.$refs.assignTree.getHalfCheckedKeys());
      let parm = { roleId: this.roleId, list: ids };
      let res = await assignSaveApi(parm);
      if (res && res.code == 200) { this.$message.success(res.msg); this.assignDialog.visible = false; }
    },
    assignClose() { this.assignDialog.visible = false; },
    async assignRoleBtn(row) {
      this.roleId = ""; this.assignTreeData = []; this.assignTreeChecked = []; this.roleId = row.roleId;
      this.assignDialog.title = "为【" + row.roleName + "】分配权限"; this.assignDialog.visible = true;
      let parm = { roleId: this.roleId, userId: getUserId() };
      let res = await getAssignTreeApi(parm);
      if (res && res.code == 200) {
        this.assignTreeData = res.data.listmenu; this.assignTreeChecked = res.data.checkList;
        if (this.assignTreeChecked.length > 0) {
          let newArr = [];
          this.assignTreeChecked.forEach((item) => { this.checked(item, this.assignTreeData, newArr); });
          this.assignTreeChecked = newArr;
        }
      }
    },
    checked(id, data, newArr) {
      data.forEach((item) => {
        if (item.menuId == id) {
          if (item.children && item.children.length == 0) { newArr.push(item.menuId); }
        } else {
          if (item.children && item.children.length != 0) { this.checked(id, item.children, newArr); }
        }
      });
    },
    async deleteBtn(row) {
      let confirm = await this.$myconfirm("确定删除该数据吗？");
      if (confirm) {
        let res = await deleteRoleApi({ roleId: row.roleId });
        if (res && res.code == 200) { this.getRoleList(); this.$message.success(res.msg); }
      }
    },
    editBtn(row) {
      this.$resetForm("addForm", this.addModel); this.addModel.type = "1"; this.$objCoppy(row, this.addModel);
      this.dialog.title = "编辑角色"; this.dialog.visible = true;
    },
    onConfirm() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          let res = this.addModel.type == "0" ? await addRoleApi(this.addModel) : await editRoleApi(this.addModel);
          if (res && res.code == 200) { this.getRoleList(); this.$message.success(res.msg); this.dialog.visible = false; }
        }
      });
    },
    onClose() { this.dialog.visible = false; },
    currentChange(val) { this.parms.currentPage = val; this.getRoleList(); },
    sizeChange(val) { this.parms.pageSize = val; this.getRoleList(); },
    addBtn() { this.$resetForm("addForm", this.addModel); this.addModel.type = "0"; this.dialog.title = "新增角色"; this.dialog.visible = true; },
    resetBtn() { this.parms.roleName = ""; this.getRoleList(); },
    searchBtn() { this.getRoleList(); },
    async getRoleList() {
      let res = await getRoleListApi(this.parms);
      if (res && res.code == 200) { this.roleList = res.data.records; this.parms.total = res.data.total; }
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
  /* 样式保留以兼容全局 TableCard */
}
.ops {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  vertical-align: middle;
}
</style>
