// AI润色功能前端使用示例
// 在公告编辑组件中的使用方法

import { polishContentApi } from '@/api/notice'

export default {
  data() {
    return {
      // 表单数据
      form: {
        title: '',
        content: ''
      },
      // 润色状态
      polishing: false
    }
  },
  methods: {
    // AI润色方法
    async polishContent() {
      // 验证输入
      if (!this.form.title || !this.form.title.trim()) {
        this.$message.warning('请输入标题')
        return
      }
      if (!this.form.content || !this.form.content.trim()) {
        this.$message.warning('请输入内容')
        return
      }

      this.polishing = true
      
      try {
        // 调用AI润色接口
        const response = await polishContentApi({
          title: this.form.title,
          content: this.form.content
        })
        
        if (response.code === 20000) {
          // 润色成功，更新内容
          this.$confirm('润色完成，是否替换当前内容？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }).then(() => {
            this.form.content = response.data
            this.$message.success('内容已更新')
          })
        } else {
          this.$message.error(response.message || '润色失败')
        }
      } catch (error) {
        console.error('AI润色调用失败:', error)
        this.$message.error('润色服务暂时不可用，请稍后重试')
      } finally {
        this.polishing = false
      }
    }
  }
}

/* 
在模板中的使用示例：

<template>
  <el-form :model=\"form\" label-width=\"80px\">
    <el-form-item label=\"标题\">
      <el-input v-model=\"form.title\" placeholder=\"请输入公告标题\"></el-input>
    </el-form-item>
    
    <el-form-item label=\"内容\">
      <el-input 
        type=\"textarea\" 
        v-model=\"form.content\" 
        :rows=\"8\"
        placeholder=\"请输入公告内容\">
      </el-input>
    </el-form-item>
    
    <el-form-item>
      <el-button 
        type=\"primary\" 
        :loading=\"polishing\" 
        @click=\"polishContent\">
        <i class=\"el-icon-magic-stick\"></i>
        {{ polishing ? 'AI润色中...' : 'AI润色' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>
*/