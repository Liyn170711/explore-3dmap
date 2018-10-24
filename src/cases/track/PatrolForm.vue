<!-- 巡更轨迹查询表单 -->
<template>
    <div>
        <div class="trackContent">
            <Form :rules="validateRules" ref="patrolForm" :model="patrolForm" :label-width="100" label-position="left">
                <FormItem label="姓名" prop="name">
                    <Input v-model="patrolForm.name" placeholder="" style="width:350px;" />
                </FormItem>
                <FormItem prop="type">
                    <RadioGroup v-model="patrolForm.type">
                        <Radio v-for="(item, index) in patrolTypes" :key="index" :label="item.label" :value="item.value" :disabled="item.disable">
                            <span>{{item.text}}</span>
                        </Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="时间" prop="startTime">
                    <DatePicker type="datetime" placeholder="开始时间" v-model="patrolForm.startTime" style="width: 155px; margin-right: 10px;"></DatePicker>
                    <span>至</span> 
                    <DatePicker type="datetime" placeholder="结束时间" v-model="patrolForm.endTime" style="width: 155px; margin-left: 10px;"></DatePicker>
                </FormItem>
                <FormItem label="任务列表" prop="taskID">
                    <Select v-model="patrolForm.taskID" style="width:350px">
                        <Option v-for="item in tasks" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
            </Form>
        </div>
        <div class="trackFoot">
            <Button type="primary" @click="confirmSearch('patrolForm')">确认</Button>
            <Button type="text" @click="cannelSearch('patrolForm')">取消</Button>
        </div>
    </div>
</template>

<script>
import {mapState, mapMutations} from 'vuex'
export default {
  name: 'PatrolForm',
  data () {
    return {
        patrolForm: {
            // 巡更轨迹
            name: '', // 巡逻相关人员姓名
            type: 'realtime', // 巡更类型
            taskID: '', // 任务标识
            searchAll: true, // 是否全部查询
            searchScope: '', // 查询范围
            searchTime: { // 查询时间
                startTime: '', // 开始时间
                endTime: '' // 结束时间
            }

        },
        validateRules: {
            startTime: [{ validator: this.compareTime, trigger: 'change' }],
        },
        // 巡更类型数据源
        patrolTypes: [
            { text: '巡更轨迹', label: 'realtime', value: 'realtime', disable: false },
            { text: '历史轨迹', label: 'history', value: 'history', disable: false },
        ],
        // 巡更类型数据源
        tasks: [
            { value: 'task001', label: '巡更任务1' },
            { value: 'task002', label: '巡更任务2' },
        ]
    }
  },
  computed: {
      ...mapState({
          showModal: ({ trackSearch }) => trackSearch.showModal
      })
  },
  created () {
      this.initSearchTime(); // 初始化查询时间
  },
  mounted () {
  },
  methods: {
      ...mapMutations(['SET_SHOWMODAL_STATUS', 'SET_SHOWTRACK_STATUS']),
      cannelSearch (name) { // 取消查询
        this.$refs[name].resetFields(); // 清空查询表单
        this.initSearchTime(); // 初始化查询时间
        this.SET_SHOWMODAL_STATUS(false);
      },
      confirmSearch (name) { // 确认查询
        this.$refs[name].validate((valid) => {
            if (valid) { // 巡更轨迹查询条件表单校验通过
                console.log("巡更轨迹查询，校验通过！");
                this.initSearchTime(); // 初始化查询时间
                this.SET_SHOWMODAL_STATUS(false); // 关闭轨迹查询弹窗
                this.SET_SHOWTRACK_STATUS(true); // 显示绘制轨迹
            }else {
                console.log("巡更轨迹查询，校验未通过！");
            }
        });
      },
      initSearchTime () { // 初始化查询时间
        let now = new Date();
        now.setHours(0,0,0);
        let stime = this.$moment(now).format('YYYY-MM-DD HH:mm:ss');
        let etime = this.$moment().format('YYYY-MM-DD HH:mm:ss');
        console.log("stime: ", stime, "etime: ", etime);
        this.patrolForm.startTime = stime; // 初始化开始时间
        this.patrolForm.endTime = etime; // 初始化结束时间
      },
      compareTime (rule, value, callback) { // 查询时间校验
        let start = this.patrolForm.startTime ? this.$moment(this.patrolForm.startTime).unix(): '';
        let end = this.patrolForm.endTime ? this.$moment(this.patrolForm.endTime).unix(): '';
        if (start && end) {
            if (start > end) { // 开始时间大于结束时间
                callback(new Error('开始时间不能大于结束时间！'))
            }else if (start === end) { // 开始时间等于结束时间
                callback(new Error('开始时间不能等于结束时间！'))
            }else if ((end -start)/86400 > 30) {
                callback(new Error('时间范围不能超过30天！'))
            }
            callback();
        }
      }
  }
}
</script>

<style scoped>
    /* 内容样式 */
    .trackContent {
        padding: 0 60px;
        min-height: 100px;
        height: auto;
    }
    /* 尾部部样式 */
    .trackFoot {
        background: #0f2343;
        border-radius: 6px;
        width: 100%;
        height: 40px;
        padding: 0 24px;
    }
    .trackFoot button {
        height: 30px;
        float: right;
        margin: 5px 8px 5px 8px;
    }
    .trackFoot button:first-child {
        float: right;
        margin-right: 0;
    }
</style>
