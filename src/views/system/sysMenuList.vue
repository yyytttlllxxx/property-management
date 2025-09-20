<!-- 系统管理----权限管理 -->

<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-if="hasPerm('sys:menu:add')" type="primary" icon="el-icon-plus" @click="addMenu">新增</el-button>
    </div>

    <!-- 使用通用 TableCard 包裹树形表格 -->
    <TableCard
      title="菜单列表"
      :total="(tableList && tableList.length) || 0"
      :showExport="false"
      @refresh="getMenuList"
      @reset="resetFilters"
    >
      <el-table :height="tableHeight" :data="tableList" row-key="menuId" :tree-props="{ children: 'children' }" border
        stripe default-expand-all>
        <el-table-column prop="menuLabel" label="菜单名称"></el-table-column>
        <el-table-column prop="type" label="菜单类型">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type == '0'">目录</el-tag>
            <el-tag type="success" v-if="scope.row.type == '1'">菜单</el-tag>
            <el-tag type="danger" v-if="scope.row.type == '2'">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="菜单图标">
          <template slot-scope="scope">
            <i :class="scope.row.icon"></i>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="路由名称"> </el-table-column>
        <el-table-column prop="path" label="路由地址"> </el-table-column>
        <el-table-column prop="url" label="组件路径"> </el-table-column>
        <el-table-column prop="menuCode" label="权限字段"> </el-table-column>
        <el-table-column align="center" width="200" label="操作">
          <template slot-scope="scope">
            <el-button v-if="hasPerm('sys:menu:edit')" type="primary" icon="el-icon-edit" size="small"
              @click="editMenu(scope.row)">编辑</el-button>
            <el-button v-if="hasPerm('sys:menu:delete')" type="danger" icon="el-icon-delete" size="small"
              @click="deleteMenu(scope.row)">删除</el-button>
          </template>
        </el-table-column>
        <template slot="empty">
          <div class="empty-state">
            <div class="empty-planet"></div>
            <div class="empty-title">暂无菜单</div>
            <div class="empty-subtitle">点击右上角“新增”或“刷新”获取最新数据</div>
          </div>
        </template>
      </el-table>
    </TableCard>

    <!-- 新增或编辑弹框 -->
    <sys-dialog :title="dialog.title" :width="dialog.width" :height="dialog.height" :visible="dialog.visible"
      @onClose="onClose" @onConfirm="onConfirm">
      <div slot="content">
        <el-form style="margin-left: 40px" :model="addModel" ref="addForm" :rules="rules" label-width="80px"
          :inline="true" size="normal">
          <el-row>
            <el-col :span="24">
              <el-form-item prop="type" label="菜单类型">
                <el-radio-group v-model="addModel.type">
                  <el-radio :label="'0'">目录</el-radio>
                  <el-radio :label="'1'">菜单</el-radio>
                  <el-radio :label="'2'">按钮</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item prop="parentName" label="上级菜单">
            <el-input @click.native="selectParent" v-model="addModel.parentName" placeholder="请选择上级菜单"
              size="small"></el-input>
          </el-form-item>
          <el-form-item prop="menuLabel" label="菜单名称">
            <el-input v-model="addModel.menuLabel" placeholder="请填写菜单名称" size="small"></el-input>
          </el-form-item>
          <el-form-item label="菜单图标">
            <el-input v-model="addModel.icon" placeholder="请填写菜单图标" size="small"></el-input>
          </el-form-item>
          <el-form-item prop="name" v-if="addModel.type == '1'" label="路由名称">
            <el-input v-model="addModel.name" placeholder="请填写路由名称" size="small"></el-input>
          </el-form-item>
          <el-form-item prop="path" v-if="addModel.type != '2'" label="路由地址">
            <el-input v-model="addModel.path" placeholder="请填写路由地址" size="small"></el-input>
          </el-form-item>
          <el-form-item prop="url" v-if="addModel.type == '1'" label="组件路径">
            <el-input v-model="addModel.url" placeholder="请填写组件路径" size="small"></el-input>
          </el-form-item>
          <el-form-item prop="menuCode" label="权限字段">
            <el-input v-model="addModel.menuCode" placeholder="请填写权限字段" size="small"></el-input>
          </el-form-item>
          <el-form-item label="权限备注">
            <el-input v-model="addModel.remark" placeholder="请填写权限备注" size="small"></el-input>
          </el-form-item>
          <el-form-item label="权限序号">
            <el-input v-model="addModel.orderNum" placeholder="请填写权限序号" size="small"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </sys-dialog>

    <!-- 选择上级部门弹框 -->
    <sys-dialog :title="parentDialog.title" :width="parentDialog.width" :height="parentDialog.height"
      :visible="parentDialog.visible" @onClose="onParentClose" @onConfirm="onParentConfirm">
      <div slot="content">
        <el-tree ref="parentTree" :data="parentList" node-key="menuId" :props="defaultProps" empty-text="暂无数据"
          :show-checkbox="false" :highlight-current="true" default-expand-all :expand-on-click-node="false"
          @node-click="nodeSelect">
          <div slot-scope="{ node, data }">
            <!-- 如果没有下级，显示文档图标 -->
            <span v-if="data.children.length == 0">
              <i style="margin-left: 3px" class="el-icon-document"></i>
            </span>
            <!-- 有下级，判断是否展开 -->
            <span v-else @click.stop="openBtn(data)">
              <i v-if="data.open" style="margin-left: 3px" class="iconfont icon-jia"></i>
              <i v-else style="margin-left: 3px" class="iconfont icon-jian"></i>
            </span>
            <span style="margin-left: 3px">{{ node.label }}</span>
          </div>
        </el-tree>
      </div>
    </sys-dialog>
  </div>
</template>

<script>
import { getMenuListApi, addMenuApi, getParentTreeApi, editMenuApi, deleteMenuApi } from "@/api/menu";
import SysDialog from "@/components/system/SysDialog";

export default {
  components: { SysDialog },
  data() {
    return {
      tableHeight: 0,
      defaultProps: { children: "children", label: "menuLabel" },
      parentList: [],
      parentDialog: { title: "选择上级部门", width: 300, height: 450, visible: false },
      rules: {
        type: [{ required: true, trigger: "change", message: "请选择菜单类型" }],
        parentName: [{ required: true, trigger: "change", message: "请选择上级菜单" }],
        menuLabel: [{ required: true, trigger: "change", message: "请填写菜单名称" }],
        name: [{ required: true, trigger: "change", message: "请填写路由名称" }],
        path: [{ required: true, trigger: "change", message: "请填写路由地址" }],
        url: [{ required: true, trigger: "change", message: "请填写组件路径" }],
        menuCode: [{ required: true, trigger: "change", message: "请填写权限字段" }]
      },
      addModel: {
        editType: "", menuId: "", parentId: "", menuLabel: "", menuCode: "", name: "", path: "", url: "",
        type: "", icon: "", remark: "", parentName: "", orderNum: ""
      },
      dialog: { title: "", width: 700, height: 380, visible: false },
      tableList: [],
      selectNode: { menuId: "", menuLabel: "" }
    }
  },
  created() { this.getMenuList(); },
  mounted() { this.$nextTick(() => { this.tableHeight = window.innerHeight - 180; }); },
  methods: {
    // 清空筛选（菜单无筛选条件，这里仅刷新列表以保持交互一致）
    resetFilters() { this.getMenuList(); this.$message.success('已刷新'); },
    editMenu(row) { this.$resetForm("addForm", this.addModel); this.$objCoppy(row, this.addModel); this.addModel.editType = "1"; this.dialog.title = "编辑菜单"; this.dialog.visible = true; },
    async deleteMenu(row) {
      let confirm = await this.$myconfirm("确定删除该数据吗?");
      if (confirm) { let res = await deleteMenuApi({ menuId: row.menuId }); if (res && res.code == 200) { this.getMenuList(); this.$message.success(res.msg); } }
    },
    openBtn(data) { data.open = !data.open; this.$refs.parentTree.store.nodesMap[data.menuId].expanded = !data.open; },
    nodeSelect(node) { this.selectNode.menuId = node.menuId; this.selectNode.menuLabel = node.menuLabel; },
    async selectParent() { let res = await getParentTreeApi(); if (res && res.code == 200) { this.parentList = res.data; } this.parentDialog.visible = true; },
    onParentConfirm() { this.addModel.parentId = this.selectNode.menuId; this.addModel.parentName = this.selectNode.menuLabel; this.parentDialog.visible = false; },
    onParentClose() { this.parentDialog.visible = false; },
    onConfirm() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          let res = this.addModel.editType == "0" ? await addMenuApi(this.addModel) : await editMenuApi(this.addModel);
          if (res && res.code == 200) { this.getMenuList(); this.dialog.visible = false; this.$message.success(res.msg); }
        }
      });
    },
    onClose() { this.dialog.visible = false; },
    addMenu() { this.$resetForm("addForm", this.addModel); this.dialog.title = "新增菜单"; this.addModel.editType = "0"; this.dialog.visible = true; },
    async getMenuList() { let res = await getMenuListApi(); if (res && res.code == 200) { this.tableList = res.data; } }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
}

/* TableCard 已统一外观，这里保留必要间距 */
.box-card {
  margin-top: 10px;
}

::v-deep .el-tree {
  .el-tree-node { position: relative; padding-left: 10px; }
  .el-tree-node__children { padding-left: 20px; }
  .el-tree-node :last-child:before { height: 40px; }
  .el-tree>.el-tree-node:before { border-left: none; }
  .el-tree>.el-tree-node:after { border-top: none; }
  .el-tree-node:before, .el-tree-node:after { content: ""; left: -4px; position: absolute; right: auto; border-width: 1px; }
  .tree :first-child .el-tree-node:before { border-left: none; }
  .el-tree-node:before { border-left: 1px dotted #d9d9d9; bottom: 0; height: 100%; top: -25px; width: 1px; }
  .el-tree-node:after { border-top: 1px dotted #d9d9d9; height: 20px; top: 14px; width: 24px; }
  .el-tree-node__expand-icon.is-leaf { width: 8px; }
  .el-tree-node__content { line-height: 30px; height: 30px; padding-left: 10px !important; }
}
::v-deep .el-tree>div { &::before { display: none; } &::after { display: none; } }
</style>


