<!-- 用户----反馈管理----我的反馈 -->

<template>
  <el-main>
    <!-- <div><span style="font-size: 50px;">1111111111222222222</span></div> -->
    <!-- 搜索框 -->
    <el-card class="search-card">
      <el-form :model="parms" ref="searchForm" label-width="80px" :inline="true" size="small">
        <el-form-item label="标题">
          <el-input v-model="parms.title"></el-input>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="parms.complaintContent"></el-input>
        </el-form-item>

        <el-form-item label="是否处理">
          <el-radio-group v-model="parms.status">
            <el-radio label="0">未处理</el-radio>
            <el-radio label="1">已处理</el-radio>
          </el-radio-group>
        </el-form-item>
        <div style="display: inline-block ;width:50px;height: 0px; "></div>
        <el-form-item>
          <el-button icon="el-icon-search" @click="searchBtn">查询</el-button>
          <el-button style="color: #ff7670" @click="resetBtn" icon="el-icon-close">重置</el-button>
          <el-button v-if="hasPerm('sys:myUserComplaint:add')" icon="el-icon-plus" type="primary"
            @click="addBtn">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格工具栏 -->
    <el-card class="table-card">
      <div slot="header" class="card-header">
        <span class="card-title">反馈列表</span>
        <div class="card-actions">
          <span class="card-subtitle">共 {{ parms.total }} 条记录</span>
          <el-button-group size="small" style="margin-left: 12px;">
            <el-button icon="el-icon-refresh" @click="getList">刷新</el-button>
            <el-button icon="el-icon-delete" @click="resetFilters">清空筛选</el-button>
            <el-button icon="el-icon-download" @click="exportData">导出CSV</el-button>
          </el-button-group>
        </div>
      </div>
      
      <!-- 骨架屏覆盖层 -->
      <div v-if="loading" class="skeleton-overlay">
        <el-skeleton :rows="5" animated></el-skeleton>
      </div>

      <!-- 表格 -->
      <el-table :height="tableHeight" :data="tableList" border stripe v-loading="loading">
      <el-table-column label="标题" prop="title"></el-table-column>
      <el-table-column label="内容" prop="complaintContent"></el-table-column>
      <el-table-column label="处理状态" prop="status">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status == '1'" type="success" size="small">已处理</el-tag>
          <el-tag v-if="scope.row.status == '0'" type="danger" size="small">未处理</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" width="280" label="操作">
        <template slot-scope="scope">
          <el-button v-if="hasPerm('sys:myUserComplaint:edit')" type="primary" icon="el-icon-edit" size="small"
            @click="editBtn(scope.row)">编辑</el-button>
          <el-button v-if="hasPerm('sys:myUserComplaint:delete')" type="danger" icon="el-icon-delete" size="small"
            @click="deleteBtn(scope.row)">删除</el-button>
        </template>
      </el-table-column>
        <template #empty>
          <div class="empty-state">
            <i class="el-icon-folder-opened" style="font-size: 48px; color: #c0c4cc;"></i>
            <p style="margin: 12px 0 0; color: #909399;">暂无反馈数据</p>
          </div>
        </template>
      </el-table>
    </el-card>
    
    <!-- 分页 -->
    <el-pagination @size-change="sizeChange" @current-change="currentChange" :current-page.sync="parms.currentPage"
      :page-sizes="[10, 20, 40, 80, 100]" :page-size="parms.pageSize" layout="total, sizes, prev, pager, next, jumper"
      :total="parms.total" background>
    </el-pagination>
    <!-- 新增弹框 -->
    <sys-dialog :title="addDialog.title" :height="addDialog.height" :width="addDialog.width"
      :visible="addDialog.visible" @onClose="onClose" @onConfirm="onConfirm">
      <template slot="content">
        <el-form :model="addModel" ref="addForm" :rules="rules" label-width="80px" :inline="false" size="small">
          <el-form-item prop="title" label="标题">
            <el-input v-model="addModel.title"></el-input>
          </el-form-item>
          <el-form-item prop="complaintContent" label="反馈内容">
            <el-input type="textarea" v-model="addModel.complaintContent"></el-input>
          </el-form-item>
        </el-form>
      </template>
    </sys-dialog>
  </el-main>
</template>

<script>
import { getMyListApi, addApi, editApi, deleteApi } from "@/api/userComplaint";
import { getUserId } from "@/utils/auth";
import SysDialog from "@/components/system/SysDialog.vue";
export default {
  components: {
    SysDialog,
  },
  data() {
    return {
      // 加载状态
      loading: false,
      //表单验证规则
      rules: {
        title: [
          {
            trigger: "change",
            required: true,
            message: "请填写标题",
          },
        ],
        complaintContent: [
          {
            trigger: "change",
            required: true,
            message: "请填写反馈内容",
          },
        ],
      },
      //新增意见绑定对象
      addModel: {
        complaintId: "",
        userId: "",
        editType: "",
        title: "",
        complaintContent: "",
      },
      //定义弹框属性
      addDialog: {
        title: "",
        height: 180,
        width: 650,
        visible: false,
      },
      //表格高度
      tableHeight: 0,
      //表格数据
      tableList: [],
      //列表查询参数
      parms: {
        currentPage: 1,
        pageSize: 10,
        title: "",
        complaintContent: "",
        total: 0,
        userId: "",
        status: "",
      },
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 210;
    });
  },
  methods: {
    // 导出数据为CSV
    exportData() {
      if (this.tableList.length === 0) {
        this.$message.warning('暂无数据可导出');
        return;
      }
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF标题,内容,处理状态\n" + 
        this.tableList.map(row => `${row.title},${row.complaintContent},${row.status === '1' ? '已处理' : '未处理'}`).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `反馈列表_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    // 重置筛选条件
    resetFilters() {
      this.parms.title = "";
      this.parms.complaintContent = "";
      this.parms.status = "";
      this.parms.currentPage = 1;
      this.getList();
    },
    
    //弹框确认事件
    onConfirm() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          this.addModel.userId = getUserId();
          let res = null;
          if (this.addModel.editType == "0") {
            res = await addApi(this.addModel);
          } else {
            res = await editApi(this.addModel);
          }
          if (res && res.code == 200) {
            //刷新列表
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
    //处理按钮
    async doBtn(row) {
      let parm = {
        complaintId: row.complaintId,
        status: "1",
      };
      const confirm = await this.$myconfirm("确定处理该反馈吗?");
      if (confirm) {
        let res = await editApi(parm);
        if (res && res.code == 200) {
          //刷新表格
          this.getList();
          this.$message.success(res.msg);
        }
      }
    },
    //新增按钮
    addBtn() {
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置编辑属性
      this.addModel.editType = "0";
      //设置弹框属性
      this.addDialog.title = "新增反馈";
      this.addDialog.visible = true;
    },
    //删除按钮
    async deleteBtn(row) {
      let parm = {
        complaintId: row.complaintId,
      };
      const confirm = await this.$myconfirm("确定删除该数据吗?");
      if (confirm) {
        let res = await deleteApi(parm);
        if (res && res.code == 200) {
          //刷新表格
          this.getList();
          this.$message.success(res.msg);
        }
      }
    },
    //编辑按钮
    editBtn(row) {
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置弹框属性
      this.addDialog.title = "编辑反馈";
      this.addDialog.visible = true;
      //把当前要编辑的数据复制到表单数据域
      this.$objCoppy(row, this.addModel);
      //设置编辑属性
      this.addModel.editType = "1";
    },
    //重置按钮
    resetBtn() {
      this.parms.title = "";
      this.parms.complaintContent = "";
      this.parms.status = "";
      this.getList();
    },
    //搜索按钮
    searchBtn() {
      this.getList();
    },
    //页数改变时触发
    currentChange(val) {
      this.parms.currentPage = val;
      this.getList();
    },
    //页容量改变时触发
    sizeChange(val) {
      this.parms.pageSize = val;
      this.getList();
    },

    //获取列表
    async getList() {
      this.loading = true;
      try {
        this.parms.userId = getUserId();
        let res = await getMyListApi(this.parms);
        if (res && res.code == 200) {
          console.log(res);
          //把返回的数据放到表格
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
.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: relative;
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

.card-actions {
  display: flex;
  align-items: center;
}

.card-subtitle {
  font-size: 14px;
  color: #909399;
}

.skeleton-overlay {
  position: absolute;
  top: 60px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  background: rgba(255, 255, 255, 0.9);
  z-index: 10;
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
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
</style>
