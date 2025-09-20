<template>
  <el-main>
    <TableCard
      title="我的停车费"
      :total="parms.total"
      :showSkeleton="!tableList || tableList.length === 0"
      @refresh="getList"
      @reset="resetBtn"
    >
      <el-table :height="tableHeight" :data="tableList" border stripe>
        <el-table-column prop="payParkMonth" label="缴费月份"></el-table-column>
        <el-table-column prop="payParkMoney" label="缴费金额"></el-table-column>
        <el-table-column prop="payParkStatus" label="缴费状态">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.payParkStatus == '0'" type="danger" size="normal">未缴费</el-tag>
            <el-tag v-if="scope.row.payParkStatus == '1'" type="success" size="normal">已缴费</el-tag>
          </template>
        </el-table-column>
        <template slot="empty">
          <div class="empty-state">
            <div class="empty-planet"></div>
            <div class="empty-title">暂无停车费记录</div>
            <div class="empty-subtitle">请点击右上角刷新重试</div>
          </div>
        </template>
      </el-table>
      <el-pagination
        @size-change="sizeChange"
        @current-change="currentChange"
        :current-page.sync="parms.currentPage"
        :page-sizes="[10, 20, 40, 80, 100]"
        :page-size="parms.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="parms.total"
        background
      />
    </TableCard>
  </el-main>
</template>

<script>
import { getMyParkFeeApi } from "@/api/myFee";
import { getUserId } from "@/utils/auth";
import TableCard from "@/components/common/TableCard.vue";
export default {
  components: { TableCard },
  data() {
    return {
      // 表格高度
      tableHeight: 0,
      // 表格数据
      tableList: [],
      parms: {
        currentPage: 1,
        pageSize: 10,
        userId: getUserId(),
        total: 0,
      },
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      // 统一高度计算，适配卡片页头与分页
      this.tableHeight = window.innerHeight - 210;
    });
  },
  methods: {
    // 页数改变时触发
    currentChange(val) {
      this.parms.currentPage = val;
      this.getList();
    },
    // 页容量改变时触发
    sizeChange(val) {
      this.parms.pageSize = val;
      this.getList();
    },
    // 刷新按钮/获取列表
    async getList() {
      const res = await getMyParkFeeApi(this.parms);
      if (res && res.code === 200) {
        this.tableList = res.data.records;
        this.parms.total = res.data.total;
      }
    },
    // 清空筛选（我的列表仅重置分页）
    resetBtn() {
      this.parms.currentPage = 1;
      this.parms.pageSize = 10;
      this.getList();
    },
  },
};
</script>

<style lang="scss" scoped></style>
