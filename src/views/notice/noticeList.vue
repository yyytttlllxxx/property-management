<!-- 公告管理----公告列表 -->

<template>
  <el-main>
    <!-- 搜索框 -->
    <div class="filter-container">
      <el-card class="search-card">
        <el-form :model="parms" ref="searchForm" label-width="80px" :inline="true" size="small">
          <el-form-item label="标题">
            <el-input v-model="parms.title"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" @click="searchBtn">查询</el-button>
            <el-button style="color: #ff7670" @click="resetBtn" icon="el-icon-close">重置</el-button>
            <el-button v-if="hasPerm('sys:noticeList:add')" icon="el-icon-plus" type="primary"
              @click="addBtn">新增</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <!-- 表格 -->
    <el-card class="table-card">
      <div slot="header" class="card-header">
        <div class="card-titles">
          <span class="card-title">公告列表</span>
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
        <div class="table-skeleton" v-if="!tableList || tableList.length === 0">
          <div class="skeleton-row" v-for="n in 6" :key="n"></div>
        </div>
        <el-table :height="tableHeight" :data="tableList" border stripe>
          <el-table-column label="标题" prop="title"></el-table-column>
          <el-table-column label="内容" prop="noticeContent"></el-table-column>
          <el-table-column label="时间" prop="createTime"></el-table-column>
          <el-table-column align="center" width="180" label="操作">
            <template slot-scope="scope">
              <div class="ops">
                <el-button v-if="hasPerm('sys:noticeList:edit')" type="primary" icon="el-icon-edit" size="mini"
                  @click="editBtn(scope.row)">编辑</el-button>
                <el-button v-if="hasPerm('sys:noticeList:delete')" type="danger" icon="el-icon-delete" size="mini"
                  @click="deleteBtn(scope.row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
          <template slot="empty">
            <div class="empty-state">
              <div class="empty-planet"></div>
              <div class="empty-title">暂无公告</div>
              <div class="empty-subtitle">请调整筛选条件或点击右上角刷新</div>
            </div>
          </template>
        </el-table>
        <!-- 分页 -->
        <el-pagination @size-change="sizeChange" @current-change="currentChange" :current-page.sync="parms.currentPage"
          :page-sizes="[10, 20, 40, 80, 100]" :page-size="parms.pageSize" layout="total, sizes, prev, pager, next, jumper"
          :total="parms.total" background>
        </el-pagination>
      </div>
    </el-card>
    <!-- 弹框定义 -->
    <sys-dialog :title="addDialog.title" :height="addDialog.height * 2" :width="addDialog.width"
      :visible="addDialog.visible" @onClose="onClose" @onConfirm="onConfirm">
      <template slot="content">
        <el-form :model="addModel" ref="addForm" :rules="rules" label-width="80px" :inline="false" size="small">
          <el-form-item prop="title" label="标题">
            <el-input v-model="addModel.title"></el-input>
          </el-form-item>
          <el-form-item prop="noticeContent" label="内容">
            <div class="content-input-wrapper">
              <el-input rows="10" type="textarea" v-model="addModel.noticeContent" placeholder="请输入公告内容..."></el-input>
              <div class="ai-polish-actions">
                <el-button 
                  type="primary" 
                  size="mini" 
                  :loading="polishing" 
                  @click="polishContent"
                  icon="el-icon-magic-stick">
                  {{ polishing ? 'AI润色中...' : 'AI润色' }}
                </el-button>
                <el-tooltip content="使用AI智能优化公告内容，让表达更加专业规范" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </template>
    </sys-dialog>
  </el-main>
</template>

<script>
import { getListApi, addApi, editApi, deleteApi, polishContentApi } from "@/api/notice";
import SysDialog from "@/components/system/SysDialog.vue";
export default {
  components: {
    SysDialog,
  },
  data() {
    return {
      //表单验证规则
      rules: {
        title: [
          {
            trigger: "change",
            required: true,
            message: "请填标题",
          },
        ],
        noticeContent: [
          {
            trigger: "change",
            required: true,
            message: "请填写公告内容",
          },
        ],
      },
      //表单绑定的数据域
      addModel: {
        editType: "",
        noticeId: "",
        userId: "",
        title: "",
        noticeContent: "",
      },
      //AI润色状态
      polishing: false,
      //设置弹框属性
      addDialog: {
        title: "",
        height: 180,
        width: 620,
        visible: false,
      },
      //表格高度
      tableHeight: 0,
      //表格数据
      tableList: [],
      parms: {
        currentPage: 1,
        pageSize: 10,
        title: "",
        total: 0,
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
    //弹框确定事件
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
    //删除按钮
    async deleteBtn(row) {
      //信息提示
      let confirm = await this.$myconfirm("确定删除该数据吗?");
      if (confirm) {
        let res = await deleteApi({ noticeId: row.noticeId });
        if (res && res.code == 200) {
          //刷新列表
          this.getList();
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
      this.addDialog.title = "编辑公告";
      this.addDialog.visible = true;
    },
    //新增按钮
    addBtn() {
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置编辑属性
      this.addModel.editType = "0";
      //设置弹框属性
      this.addDialog.title = "新增公告";
      this.addDialog.visible = true;
    },
    //重置按钮
    resetBtn() {
      this.parms.title = "";
      this.getList();
    },
    //查询按钮
    searchBtn() {
      this.getList();
    },
    //获取列表
    async getList() {
      let res = await getListApi(this.parms);
      if (res && res.code == 200) {
        //给表格赋值
        console.log(res);
        this.tableList = res.data.records;
        this.parms.total = res.data.total;
      }
    },
    
    //AI润色内容
    async polishContent() {
      // 验证输入
      if (!this.addModel.title || !this.addModel.title.trim()) {
        this.$message.warning('请先输入标题');
        return;
      }
      if (!this.addModel.noticeContent || !this.addModel.noticeContent.trim()) {
        this.$message.warning('请先输入公告内容');
        return;
      }

      this.polishing = true;
      
      try {
        // 调用AI润色接口
        const response = await polishContentApi({
          title: this.addModel.title.trim(),
          content: this.addModel.noticeContent.trim()
        });
        
        if (response && response.code == 200) {
          // 润色成功，询问是否替换
          this.$confirm('AI润色已完成，内容已优化！是否替换当前内容？', '润色完成', {
            confirmButtonText: '替换内容',
            cancelButtonText: '保留原文',
            type: 'success',
            customClass: 'polish-confirm-dialog'
          }).then(() => {
            this.addModel.noticeContent = response.data;
            this.$message({
              type: 'success',
              message: '内容已更新为润色版本！',
              duration: 3000
            });
          }).catch(() => {
            this.$message({
              type: 'info', 
              message: '已保留原始内容',
              duration: 2000
            });
          });
        } else {
          this.$message.error(response.message || '润色失败，请稍后重试');
        }
      } catch (error) {
        console.error('AI润色调用失败:', error);
        this.$message.error('润色服务暂时不可用，请检查网络连接后重试');
      } finally {
        this.polishing = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.ops {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  vertical-align: middle;
}

.content-input-wrapper {
  position: relative;
  
  .ai-polish-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    padding: 8px 0;
    
    .el-button {
      border-radius: 4px;
      font-size: 12px;
      
      &.is-loading {
        position: relative;
        pointer-events: none;
        
        &::before {
          pointer-events: none;
          content: '';
          position: absolute;
          left: -1px;
          top: -1px;
          right: -1px;
          bottom: -1px;
          border-radius: inherit;
          background-color: hsla(0,0%,100%,.35);
        }
      }
    }
    
    .el-icon-question {
      color: #909399;
      font-size: 14px;
      cursor: help;
      
      &:hover {
        color: #409eff;
      }
    }
  }
}

// AI润色确认弹窗样式
::v-deep .polish-confirm-dialog {
  .el-message-box__message {
    font-size: 14px;
    color: #606266;
  }
  
  .el-message-box__btns {
    .el-button--primary {
      background-color: #67c23a;
      border-color: #67c23a;
      
      &:hover {
        background-color: #85ce61;
        border-color: #85ce61;
      }
    }
  }
}

// 加载状态样式
.ai-polish-loading {
  .el-button {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -7px;
      margin-top: -7px;
      width: 14px;
      height: 14px;
      border: 2px solid transparent;
      border-top-color: #fff;
      border-radius: 50%;
      animation: button-loading-circular 2s infinite linear;
    }
  }
}

@keyframes button-loading-circular {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
