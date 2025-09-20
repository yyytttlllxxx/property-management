<!-- 管理员----收费管理----停车费管理 -->

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="filter-container">
      <el-card class="search-card">
        <el-form :model="parms" ref="searchForm" label-width="80px" :inline="true" size="small">
          <el-form-item label="姓名">
            <el-input v-model="parms.userName" clearable placeholder="请输入姓名" style="width: 180px;"></el-input>
          </el-form-item>
          <el-form-item label="车位名称">
            <el-input v-model="parms.parkName" clearable placeholder="请输入车位名称" style="width: 180px;"></el-input>
          </el-form-item>
          <el-form-item label="是否缴费">
            <el-radio-group v-model="parms.payParkStatus">
              <el-radio label="">全部</el-radio>
              <el-radio label="0">未缴费</el-radio>
              <el-radio label="1">已缴费</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="searchBtn">查询</el-button>
            <el-button icon="el-icon-refresh" @click="resetBtn">重置</el-button>
            <el-button v-if="hasPerm('sys:feePark:add')" type="success" icon="el-icon-plus" @click="addBtn">新增</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 表格区域：使用通用 TableCard -->
    <TableCard
      title="停车费列表"
      :total="parms.total"
      :showExport="true"
      @refresh="getList"
      @reset="resetFilters"
      @export="exportData"
    >
      <el-table 
        v-loading="loading" 
        :height="tableHeight" 
        :data="tableList" 
        stripe 
        style="width: 100%">
        <el-table-column label="姓名" prop="loginName" min-width="100"></el-table-column>
        <el-table-column label="电话" prop="phone" min-width="120"></el-table-column>
        <el-table-column label="车位" prop="parkName" min-width="120"></el-table-column>
        <el-table-column label="车位类型" prop="parkType" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.parkType == '0'" type="danger" size="small">地上</el-tag>
            <el-tag v-if="scope.row.parkType == '1'" type="success" size="small">地下</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属月份" prop="payParkMonth" min-width="120"></el-table-column>
        <el-table-column label="缴费金额" prop="payParkMoney" min-width="120"></el-table-column>
        <el-table-column label="缴费状态" prop="payParkStatus" width="100" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.payParkStatus == '0'" type="danger" size="small">未缴费</el-tag>
            <el-tag v-if="scope.row.payParkStatus == '1'" type="success" size="small">已缴费</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="270" align="center" label="操作">
          <template slot-scope="scope">
            <el-button v-if="hasPerm('sys:feePark:edit')" icon="el-icon-edit" type="primary" size="mini"
                       @click="editBtn(scope.row)">编辑</el-button>
            <el-button v-if="hasPerm('sys:feePark:delete')" icon="el-icon-delete" type="danger" size="mini"
                       @click="deleteBtn(scope.row)">删除</el-button>
            <!-- 原有缴费按钮（已注释） -->
            <!-- <el-button v-if="scope.row.payParkStatus == '0' && hasPerm('sys:feePark:pay')" icon="el-icon-money"
                       type="warning" size="mini" @click="payBtn(scope.row)">缴费</el-button> -->
            <!-- 新增支付宝支付按钮 -->
            <el-button v-if="scope.row.payParkStatus == '0' && hasPerm('sys:feePark:pay')" icon="el-icon-money"
                       type="warning" size="mini" @click="alipayBtn(scope.row)">支付宝缴费</el-button>
          </template>
        </el-table-column>

        <!-- 空状态插槽 -->
        <template slot="empty">
          <div class="empty-state">
            <div class="empty-icon">
              <i class="el-icon-parking"></i>
            </div>
            <div class="empty-text">暂无停车费记录</div>
            <div class="empty-description">还没有任何停车费记录</div>
            <el-button v-if="hasPerm('sys:feePark:add')" type="primary" icon="el-icon-plus" @click="addBtn">
              立即新增停车费
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
    </TableCard>

    <!-- 新增弹框 -->
    <sys-dialog :title="addDialog.title" :visible.sync="addDialog.visible" :height="addDialog.height" :width="addDialog.width" @onClose="onClose" @onConfirm="onConfirm">
      <template slot="content">
        <el-form :model="addModel" ref="addForm" :rules="rules" label-width="80px" :inline="true" size="small">
          <el-form-item prop="houseId" label="房屋编号">
            <el-select v-model="addModel.parkId" placeholder="请选择车位">
              <el-option v-for="item in parkList" :key="item.parkId" :label="item.parkName" :value="item.parkId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="payParkMonth" label="缴费年月">
            <el-date-picker format="yyyy-MM" value-format="yyyy-MM" v-model="addModel.payParkMonth" type="month"
                            placeholder="选择月份">
            </el-date-picker>
          </el-form-item>
          <el-form-item style="margin-left:15px;" prop="powerNum" label="缴费金额" size="small">
            <el-input v-model="addModel.payParkMoney" placeholder="请输入缴费金额"></el-input>
          </el-form-item>
          <el-form-item prop="payPowerStatus" label="缴费状态" size="small">
            <el-radio-group v-model="addModel.payParkStatus">
              <el-radio :label="'0'">未缴费</el-radio>
              <el-radio :label="'1'">已缴费</el-radio>
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
  getParkListApi,
  addApi,
  editApi,
  deleteApi,
  payApi,
} from "@/api/feePark";
import {
  createParkAlipayOrderApi,
  simulatePaySuccessApi
} from "@/api/alipay";
import SysDialog from "@/components/system/SysDialog.vue";
import {getBuildApi} from "@/api/houseList";
export default {
  components: { SysDialog },
  data() {
    return {
      loading: false,
      //表格高度
      tableHeight: 0,
      //车辆列表
      parkList: [],
      //表单验证规则
      rules: {
        parkId: [
          {
            trigger: "change",
            required: true,
            message: "请选择车位",
          },
        ],
        payParkMonth: [
          {
            trigger: "change",
            required: true,
            message: "请填写缴费月份",
          },
        ],
        payParkMoney: [
          {
            trigger: "change",
            required: true,
            message: "请填写缴费金额",
          },
        ],
        payParkStatus: [
          {
            trigger: "change",
            required: true,
            message: "请选择缴费状态",
          },
        ],
      },
      //表单数据域
      addModel: {
        parkFeeId: "",
        editType: "",
        parkId: "",
        payParkMonth: "",
        payParkMoney: "",
        payParkStatus: "",
      },
      //弹框属性
      addDialog: {
        title: "",
        height: 120,
        width: 650,
        visible: false,
      },
      //表格的数据
      tableList: [],
      //列表查询参数
      parms: {
        currentPage: 1,
        pageSize: 10,
        userName: "",
        parkName: "",
        payParkStatus: "",
        total: 0,
      },
    };
  },
  created() {
    this.getParkList();
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 280;
    });
  },
  methods: {
    // 导出数据
    exportData() {
      if (this.tableList.length === 0) {
        this.$message.warning('暂无数据可导出');
        return;
      }
      
      const headers = ['姓名', '电话', '车位', '车位类型', '所属月份', '缴费金额', '缴费状态'];
      const csvContent = [
        headers.join(','),
        ...this.tableList.map(row => [
          `"${row.loginName}"`,
          `"${row.phone}"`,
          `"${row.parkName}"`,
          row.parkType === '0' ? '地上' : '地下',
          `"${row.payParkMonth}"`,
          `"${row.payParkMoney}"`,
          row.payParkStatus === '1' ? '已缴费' : '未缴费'
        ].join(','))
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `停车费列表_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // 清空筛选
    resetFilters() {
      this.parms.userName = "";
      this.parms.parkName = "";
      this.parms.payParkStatus = "";
      this.parms.currentPage = 1;
      this.getList();
      this.$message.success('筛选条件已清空');
    },
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
            //刷新表格
            this.getList();
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
    //获取车辆列表
    async getParkList() {
      let res = await getParkListApi();
      if (res && res.code == 200) {
        console.log("车辆");
        console.log(res);
        this.parkList = res.data;
      }
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
    // 原有缴费按钮（已注释）
    // async payBtn(row) {
    //   console.log(row);
    //   //提示信息
    //   let confirm = await this.$myconfirm("确定缴费吗？");
    //   if (confirm) {
    //     let res = await payApi({ parkFeeId: row.parkFeeId });
    //     if (res && res.code == 200) {
    //       //刷新列表
    //       this.getList();
    //       //信息提示
    //       this.$message.success(res.msg);
    //     }
    //   }
    // },
    
    // 支付宝缴费按钮
    async alipayBtn(row) {
      console.log('支付宝缴费:', row);
      //提示信息
      let confirm = await this.$myconfirm("确定使用支付宝缴费吗？");
      if (confirm) {
        try {
          this.$message.info('正在创建支付订单...');
          let res = await createParkAlipayOrderApi(row.parkFeeId);
          console.log('支付宝响应:', res);
          
          // 根据项目规范，使用 code == 200 判断成功
          if (res && res.code == 200) {
            this.$message.success('支付订单创建成功!');
            
            // 这里可以将支付宝返回的HTML表单写入到新窗口中
            if (res.data) {
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.document.write(res.data);
                newWindow.document.close();
              }
            }
            
            // 提取订单号用于模拟支付成功
            const outTradeNo = `PARK_${Date.now()}_${row.parkFeeId}`;
            
            // 模拟支付成功（正常情况下是支付宝回调处理）
            setTimeout(async () => {
              try {
                this.$message.info('模拟支付中...');
                const payResult = await simulatePaySuccessApi(outTradeNo);
                if (payResult) {
                  this.getList();
                  this.$message.success('支付成功！缴费状态已更新');
                } else {
                  this.$message.error('支付状态更新失败');
                }
              } catch (error) {
                console.error('模拟支付失败:', error);
                this.$message.error('模拟支付失败');
              }
            }, 3000);
          } else {
            this.$message.error(res.msg || '创建支付订单失败');
          }
        } catch (error) {
          console.error('支付宝缴费错误:', error);
          this.$message.error('支付过程中发生错误');
        }
      }
    },
    //删除按钮
    async deleteBtn(row) {
      console.log(row);
      //提示信息
      let confirm = await this.$myconfirm("确定删除该数据吗？");
      if (confirm) {
        let res = await deleteApi({ parkFeeId: row.parkFeeId });
        if (res && res.code == 200) {
          //刷新列表
          this.getList();
          this.$message.success(res.msg);
        }
      }
    },
    //编辑按钮
    editBtn(row) {
      console.log(row);
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置弹框属性
      this.addDialog.title = "编辑停车费";
      this.addDialog.visible = true;
      //把当前有编辑的数据赋值到表单数据域
      this.$objCoppy(row, this.addModel);
      //设置编辑属性
      this.addModel.editType = "1";
    },
    //新增按钮
    addBtn() {
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置编辑属性
      this.addModel.editType = "0";
      //设置弹框属性
      this.addDialog.title = "新增停车费";
      this.addDialog.visible = true;
    },
    //重置按钮
    resetBtn() {
      this.parms.userName = "";
      this.parms.parkName = "";
      this.parms.payParkStatus = "";
      this.parms.currentPage = 1;
      this.getList();
    },
    //搜索按钮
    searchBtn() {
      this.parms.currentPage = 1;
      this.getList();
    },
    //查询列表
    async getList() {
      this.loading = true;
      try {
        let res = await getListApi(this.parms);
        console.log(res);
        if (res && res.code == 200) {
          //赋值给表格数据
          this.tableList = res.data.records;
          //分页总条数
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
