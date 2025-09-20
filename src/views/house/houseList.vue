<!--管理员---- 房屋管理------房屋列表 -->

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card class="search-card">
        <el-form :model="parms" ref="searchForm" :inline="true" size="small">
          <el-form-item label="楼栋名称">
            <el-input v-model="parms.buildNme" clearable placeholder="请输入楼栋名称" style="width: 180px;"></el-input>
          </el-form-item>
          <el-form-item label="单元名称">
            <el-input v-model="parms.unitName" clearable placeholder="请输入单元名称" style="width: 180px;"></el-input>
          </el-form-item>
          <el-form-item label="房屋编号">
            <el-input v-model="parms.houseNum" clearable placeholder="请输入房屋编号" style="width: 180px;"></el-input>
          </el-form-item>
          <el-form-item label="使用状态">
            <el-select v-model="parms.status" clearable placeholder="请选择状态" style="width: 180px;">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="searchBtn">查询</el-button>
            <el-button icon="el-icon-refresh" @click="resetBtn">重置</el-button>
            <el-button v-if="hasPerm('sys:house:add')" type="success" icon="el-icon-plus" @click="addBtn">新增房屋</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <div slot="header" class="card-header">
        <div class="card-titles">
          <span class="card-title">房屋列表</span>
          <span class="card-subtitle">共 {{ parms.total }} 条记录</span>
        </div>
        <div class="table-toolbar">
          <el-tooltip content="刷新" placement="top">
            <el-button circle size="mini" icon="el-icon-refresh" @click="getList"></el-button>
          </el-tooltip>
          <el-tooltip content="清空筛选" placement="top">
            <el-button circle size="mini" icon="el-icon-close" @click="resetBtn"></el-button>
          </el-tooltip>
          <el-tooltip content="导出CSV" placement="top">
            <el-button circle size="mini" icon="el-icon-download" class="is-ghost"></el-button>
          </el-tooltip>
        </div>
      </div>

      <div class="table-area">
        <div class="table-skeleton" v-if="loading">
          <div class="skeleton-row" v-for="n in 6" :key="n"></div>
        </div>
        <el-table
          v-loading="loading"
          :height="tableHeight"
          :data="tableList"
          stripe
          style="width: 100%">
          <el-table-column prop="name" label="楼栋名称" min-width="150"></el-table-column>
          <el-table-column prop="unitName" label="单元名称" min-width="120"></el-table-column>
          <el-table-column prop="houseNum" label="房屋编号" min-width="120"></el-table-column>
          <el-table-column prop="houseArea" label="使用面积(㎡)" min-width="120" align="center"></el-table-column>
          <el-table-column prop="status" label="使用状态" width="120" align="center">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status == '0'" type="info" size="mini">未使用</el-tag>
              <el-tag v-if="scope.row.status == '1'" type="success" size="mini">已使用</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" width="200" label="操作">
            <template slot-scope="scope">
              <el-button v-if="hasPerm('sys:house:edit')" icon="el-icon-edit" type="primary" size="mini"
                @click="editBtn(scope.row)">编辑</el-button>
              <el-button v-if="hasPerm('sys:house:delete')" icon="el-icon-delete" type="danger" size="mini"
                @click="deleteBtn(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <template slot="empty">
            <div class="empty-state">
              <div class="empty-planet"></div>
              <div class="empty-title">暂无房屋</div>
              <div class="empty-subtitle">请调整筛选条件或点击右上角刷新</div>
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
      </div>
    </el-card>

    <!-- 新增/编辑房屋弹框 -->
    <sys-dialog :title="addDialog.title" :height="addDialog.height" :width="addDialog.width"
      :visible="addDialog.visible" @onClose="onClose" @onConfirm="onConfirm">
      <template slot="content">
        <el-form :model="addModel" ref="addForm" :rules="rules" label-width="80px" size="small">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="buildvalue" label="所属楼栋">
                <el-select v-model="addModel.buildvalue" @change="selectBuild" placeholder="请选择楼栋" style="width: 100%;">
                  <el-option v-for="item in buildList" :key="item.buildId" :label="item.name" :value="item.buildId">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="unitId" label="所属单元">
                <el-select v-model="addModel.unitId" placeholder="请选择单元" style="width: 100%;">
                  <el-option v-for="item in unitList" :key="item.unitId" :label="item.unitName" :value="item.unitId">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item prop="houseNum" label="房屋编号">
                <el-input v-model="addModel.houseNum" clearable placeholder="请输入房屋编号"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="houseArea" label="使用面积">
                <el-input v-model="addModel.houseArea" clearable placeholder="请输入使用面积(㎡)"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item prop="status" label="使用状态">
            <el-radio-group v-model="addModel.status">
              <el-radio :label="'0'">未使用</el-radio>
              <el-radio :label="'1'">已使用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
    </sys-dialog>
  </div>
</template>

<script>
import {
  getListApi,
  getBuildApi,
  getUnitListByIdApi,
  addApi,
  editApi,
  deleteApi,
} from "@/api/houseList";
import SysDialog from "@/components/system/SysDialog.vue";
export default {
  components: { SysDialog },
  data() {
    return {
      loading: false,
      unitList: [],
      buildList: [],
      rules: {
        buildvalue: [{ trigger: "change", required: true, message: "请选择所属楼栋" }],
        unitId: [{ trigger: "change", required: true, message: "请选择所属单元" }],
        houseNum: [{ trigger: "change", required: true, message: "请填写房屋编号" }],
        houseArea: [{ trigger: "change", required: true, message: "请填写使用面积" }],
        status: [{ trigger: "change", required: true, message: "请选择使用状态" }],
      },
      addModel: {
        editType: "",
        houseId: "",
        unitId: "",
        houseNum: "",
        houseArea: "",
        status: "",
        buildvalue: "",
      },
      addDialog: { title: "", height: 280, width: 600, visible: false },
      tableHeight: 0,
      options: [
        { value: "0", label: "未使用" },
        { value: "1", label: "已使用" },
      ],
      tableList: [],
      parms: {
        buildNme: "",
        status: "",
        unitName: "",
        houseNum: "",
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
    };
  },
  created() { this.getList(); this.getBuildList(); },
  mounted() { this.$nextTick(() => { this.tableHeight = window.innerHeight - 280; }); },
  methods: {
    //选择栋数触发事件
    selectBuild(val) {
      //清空原来的数据
      this.addModel.unitId = "";
      //根据栋数id查询对应的单元
      this.getUnitListById(val);
      console.log(val);
    },
    //弹框确认
    onConfirm() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          let res = null;
          if (this.addModel.editType == "0") {
            res = await addApi(this.addModel);
          } else {
            res = await editApi(this.addModel);
          }
          if (res && res.code == 200) {
            //刷新表格
            this.getList();
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
      this.getList();
    },
    //页容量改变触发
    sizeChange(val) {
      this.parms.pageSize = val;
      this.getList();
    },
    //删除按钮
    async deleteBtn(row) {
      console.log(row);
      //信息提示
      const confirm = await this.$myconfirm("确定删除该数据吗?");
      if (confirm) {
        let res = await deleteApi({ houseId: row.houseId });
        if (res && res.code == 200) {
          //刷新列表
          this.getList();
          //信息提示
          this.$message.success(res.msg);
        }
      }
    },
    //编辑按钮
    editBtn(row) {
      //根据栋数id查询单元列表
      this.getUnitListById(row.buildId);
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置弹框属性
      this.addDialog.title = "编辑房屋";
      this.addDialog.visible = true;

      //把当前编辑的行数据设置到表单数据域
      this.$objCoppy(row, this.addModel);
      //设置编辑标志
      this.addModel.editType = "1";
      console.log(row);
      console.log(this.addModel);
      //栋数回显
      this.addModel.buildvalue = row.name;
    },
    //新增按钮
    addBtn() {
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置编辑type
      this.addModel.editType = "0";
      //设置弹框属性
      this.addDialog.title = "新增房屋";
      this.addDialog.visible = true;
    },
    //重置按钮
    resetBtn() {
      this.parms.buildNme = "";
      this.parms.unitName = "";
      this.parms.status = "";
      this.parms.houseNum = "";
      this.parms.currentPage = 1;
      this.getList();
    },
    //搜索按钮
    searchBtn() {
      this.getList();
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
    //栋数列表
    async getBuildList() {
      let res = await getBuildApi();
      console.log("返回栋数");
      console.log(res);
      if (res && res.code == 200) {
        //赋值给栋数列表
        this.buildList = res.data;
      }
    },
    //单元列表
    async getUnitListById(buildId) {
      let res = await getUnitListByIdApi({ buildId: buildId });
      console.log(res);
      if (res && res.code == 200) {
        //赋值给单元列表
        this.unitList = res.data;
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
