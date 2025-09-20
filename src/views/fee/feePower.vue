<!-- 管理员---- 收费管理  ----- 电费管理 -->

<template>
  <el-main>
    <!-- 搜索框 -->
    <el-card class="search-card">
      <el-form :model="parms" ref="searchForm" label-width="80px" :inline="true" size="small">
        <el-form-item label="姓名">
          <el-input v-model="parms.userName"></el-input>
        </el-form-item>
        <el-form-item label="房屋编号">
          <el-input v-model="parms.houseNum"></el-input>
        </el-form-item>
        <el-form-item label="是否缴费">
          <el-radio-group v-model="parms.payPowerStatus">
            <el-radio label="0">未缴费</el-radio>
            <el-radio label="1">已缴费</el-radio>
          </el-radio-group>
        </el-form-item>
        <div style="display: inline-block ;width:50px;height: 0px; "></div>
        <el-form-item>
          <el-button icon="el-icon-search" @click="searchBtn">查询</el-button>
          <el-button style="color: #ff7670" @click="resetBtn" icon="el-icon-close">重置</el-button>
          <el-button v-if="hasPerm('sys:feePower:add')" @click="addBtn" type="primary" icon="el-icon-plus">新增</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域：使用通用 TableCard -->
    <TableCard
      title="电费管理"
      :total="parms.total"
      :showExport="false"
      @refresh="getList"
      @reset="resetBtn"
    >
      <!-- 表格容器 -->
      <el-table 
        :height="tableHeight" 
        :data="powerList" 
        border 
        stripe
        v-loading="loading"
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading">
        <el-table-column prop="loginName" label="姓名"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="name" label="栋数"></el-table-column>
        <el-table-column prop="unitName" label="单元"></el-table-column>
        <el-table-column prop="houseNum" label="房屋编号"></el-table-column>
        <el-table-column prop="payPowerMoney" label="缴费金额"></el-table-column>
        <el-table-column prop="payPowerMonth" label="所属月份"></el-table-column>
        <el-table-column label="表显" prop="powerNum"></el-table-column>
        <el-table-column prop="payPowerStatus" label="缴费状态">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.payPowerStatus == '0'" type="danger" size="small">未缴费</el-tag>
            <el-tag v-if="scope.row.payPowerStatus == '1'" type="success" size="small">已缴费</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="270" align="center" label="操作">
          <template slot-scope="scope">
            <div class="ops">
              <el-button v-if="hasPerm('sys:feePower:edit')" icon="el-icon-edit" type="primary" size="mini"
                @click="editBtn(scope.row)">编辑</el-button>
              <el-button v-if="hasPerm('sys:feePower:delete')" icon="el-icon-delete" type="danger" size="mini"
                @click="deleteBtn(scope.row)">删除</el-button>
              <!-- 原有缴费按钮（已注释） -->
              <!-- <el-button v-if="scope.row.payPowerStatus == '0' && hasPerm('sys:feePower:pay')" icon="el-icon-delete"
                type="warning" size="mini" @click="payBtn(scope.row)">缴费</el-button> -->
              <!-- 新增支付宝支付按钮 -->
              <el-button v-if="scope.row.payPowerStatus == '0' && hasPerm('sys:feePower:pay')" icon="el-icon-money"
                type="warning" size="mini" @click="alipayBtn(scope.row)">支付宝缴费</el-button>
            </div>
          </template>
        </el-table-column>

        <!-- 空状态插槽 -->
        <template slot="empty">
          <div class="table-empty">
            <div class="empty-icon">📊</div>
            <div class="empty-text">暂无电费数据</div>
            <div class="empty-subtext">请检查筛选条件或添加新的电费记录</div>
          </div>
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination @size-change="sizeChange" @current-change="currentChange" :current-page.sync="parms.currentPage"
          :page-sizes="[10, 20, 40, 80, 100]" :page-size="parms.pageSize" layout="total, sizes, prev, pager, next, jumper"
          :total="parms.total" background>
        </el-pagination>
      </div>
    </TableCard>

    <!-- 弹框 -->
    <sys-dialog :title="addDialog.title" :height="addDialog.height" :width="addDialog.width"
      :visible="addDialog.visible" @onClose="onClose" @onConfirm="onConfirm">
      <template slot="content">
        <el-form :model="addModel" ref="addForm" :rules="rules" label-width="80px" :inline="true" size="small">
          <el-form-item prop="buildId" label="栋数">
            <el-select v-model="addModel.buildId" @change="selectBuild">
              <el-option v-for="item in buildList" :key="item.buildId" :label="item.name" :value="item.buildId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="unitId" label="单元">
            <el-select v-model="addModel.unitId" @change="selectUnit">
              <el-option v-for="item in unitList" :key="item.unitId" :label="item.unitName" :value="item.unitId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="houseId" label="房屋编号">
            <el-select v-model="addModel.houseId">
              <el-option v-for="item in houseList" :key="item.houseId" :label="item.houseNum" :value="item.houseId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="payPowerMonth" label="所属月份">
            <el-date-picker format="yyyy-MM" value-format="yyyy-MM" v-model="addModel.payPowerMonth" type="month"
              placeholder="选择月份">
            </el-date-picker>
          </el-form-item>
          <el-form-item prop="payPowerMoney" label="缴费金额" size="small">
            <el-input v-model="addModel.payPowerMoney"></el-input>
          </el-form-item>
          <el-form-item style="margin-left:15px;" prop="powerNum" label="表显" size="small">
            <el-input v-model="addModel.powerNum"></el-input>
          </el-form-item>
          <el-form-item prop="payPowerStatus" label="缴费状态" size="small">
            <el-radio-group v-model="addModel.payPowerStatus">
              <el-radio :label="'0'">未缴费</el-radio>
              <el-radio :label="'1'">已缴费</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
    </sys-dialog>
  </el-main>
</template>

<script>
import SysDialog from "@/components/system/SysDialog.vue";
import {
  getBuildApi,
  getUnitListByIdApi
} from "@/api/houseList";
import {
  getHouseByUnitIdApi,
  addPowerApi,
  getListApi,
  editPowerApi,
  deletePowerApi,
  payPowerApi
} from "@/api/feePower";
import {
  createPowerAlipayOrderApi,
  simulatePaySuccessApi
} from "@/api/alipay";
export default {
  //注册组件
  components: {
    SysDialog
  },
  data() {
    return {
      //表格高度
      tableHeight: 0,
      //列表数据
      powerList: [],
      //表单验证规则
      rules: {
        buildId: [{
          trigger: "change",
          required: true,
          message: "请选择栋数",
        },],
        unitId: [{
          trigger: "change",
          required: true,
          message: "请选择单元",
        },],
        houseId: [{
          trigger: "change",
          required: true,
          message: "请选择房屋编号",
        },],
        payPowerMonth: [{
          trigger: "change",
          required: true,
          message: "请选择所属月份",
        },],
        payPowerMoney: [{
          trigger: "change",
          required: true,
          message: "请填写缴费金额",
        },],
        powerNum: [{
          trigger: "change",
          required: true,
          message: "请填写表显",
        },],
        payPowerStatus: [{
          trigger: "change",
          required: true,
          message: "请选择缴费状态",
        },],
      },
      //新增表单绑定数据源
      addModel: {
        houseId: "",
        unitId: "",
        buildId: "",
        editType: "",
        powerId: "",
        payPowerMonth: "",
        payPowerMoney: "",
        powerNum: "",
        payPowerStatus: "",
      },
      houseList: [],
      unitList: [],
      buildList: [],
      //弹框属性
      addDialog: {
        title: "",
        height: 250,
        width: 650,
        visible: false,
      },
      //搜索参数
      parms: {
        userName: "",
        houseNum: "",
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
    };
  },
  created() {
    this.getBuildList();
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 210;
    });
  },
  methods: {
    // 原有缴费按钮（已注释）
    // async payBtn(row) {
    //   console.log(row)
    //   //提示信息
    //   const confirm = await this.$myconfirm('确定缴费吗？');
    //   if (confirm) {
    //     let parm = {
    //       powerId: row.powerId,
    //       payPowerStatus: "1"
    //     }
    //     let res = await payPowerApi(parm)
    //     if (res && res.code == 200) {
    //       this.$message.success(res.msg)
    //       //刷新列表
    //       this.getList();
    //     }
    //   }
    // },
    
    // 支付宝缴费按钮
    async alipayBtn(row) {
      console.log('支付宝缴费:', row);
      //提示信息
      const confirm = await this.$myconfirm('确定使用支付宝缴费吗？');
      if (confirm) {
        try {
          this.$message.info('正在创建支付订单...');
          let res = await createPowerAlipayOrderApi(row.powerId);
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
            const outTradeNo = `POWER_${Date.now()}_${row.powerId}`;
            
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
    //搜索按钮
    searchBtn() {
      this.getList();
    },
    //重置按钮
    resetBtn() {
      this.parms.userName = '';
      this.parms.houseNum = '';
      this.parms.payPowerStatus = '';
      this.getList();
    },
    //删除按钮
    async deleteBtn(row) {
      console.log(row)
      //信息提示
      const confirm = await this.$myconfirm('确定删除该数据吗？');
      if (confirm) {
        let res = await deletePowerApi({
          powerId: row.powerId
        })
        if (res && res.code == 200) {
          //刷新表格
          this.$message.success(res.msg)
          this.getList();
        }
      }
    },
    //编辑按钮
    editBtn(row) {
      console.log(row)
      //查询单元列表
      this.getUnitList(row.buildId);
      //查询房屋列表
      this.getHouseByUnitId(row.unitId);
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置编辑属性
      this.addModel.editType = "1";
      //设置弹框属性
      this.addDialog.title = "编辑电费";
      this.addDialog.visible = true;
      //把当前要编辑的数据设置到表单数据域
      this.$objCoppy(row, this.addModel)

    },
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
      let res = await getListApi(this.parms);
      if (res && res.code == 200) {
        console.log("列表");
        console.log(res);
        //赋值到列表
        this.powerList = res.data.records;
        this.parms.total = res.data.total;
      }
    },
    //单元选择事件
    selectUnit(val) {
      console.log(val);
      this.getHouseByUnitId(val);
    },
    //栋数选择事件
    selectBuild(val) {
      this.addModel.unitId = '';
      this.addModel.houseId = '';
      console.log(val);
      this.getUnitList(val);
    },
    //新增按钮
    addBtn() {
      //清空表单
      this.$resetForm("addForm", this.addModel);
      //设置编辑属性
      this.addModel.editType = "0";
      //设置弹框属性
      this.addDialog.title = "新增电费";
      this.addDialog.visible = true;
    },
    //弹框确认
    onConfirm() {
      this.$refs.addForm.validate(async (valid) => {
        if (valid) {
          let res = null;
          if (this.addModel.editType == "0") {
            res = await addPowerApi(this.addModel);
          } else {
            res = await editPowerApi(this.addModel)
          }
          if (res && res.code == 200) {
            //刷新列表
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
    async getBuildList() {
      let res = await getBuildApi();
      console.log(res);
      this.buildList = res.data;
    },
    //根据栋数id获取单元列表
    async getUnitList(buildId) {
      let res = await getUnitListByIdApi({
        buildId: buildId
      });
      console.log(res);
      if (res && res.data) {
        this.unitList = res.data;
      }
    },
    //根据单元id获取房屋列表
    async getHouseByUnitId(val) {
      let res = await getHouseByUnitIdApi({
        unitId: val
      });
      if (res && res.code == 200) {
        console.log(res);
        this.houseList = res.data;
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
</style>
