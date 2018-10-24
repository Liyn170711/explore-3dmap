<!-- 轨迹查询弹出框 -->
<template>
    <Modal v-model="showModal" :mask-closable="false" :closable="false" :footer-hide="true" :width="600">
        <div class="trackSearchModal">
            <div class="trackTitle"><div>轨迹查询</div></div>
            <div class="trackContent">
                <Form :label-width="100" label-position="left">
                    <FormItem label="轨迹类型">
                        <RadioGroup v-model="trackType">
                            <Radio v-for="(item, index) in trackTypes" :key="index" :label="item.label" :value="item.value" :disabled="item.disable">
                                <span>{{item.text}}</span>
                            </Radio>
                        </RadioGroup>
                    </FormItem>
                </Form>
            </div>
            <vehicle-form  v-if="trackType === 'vehicle'"></vehicle-form>
            <personnel-form  v-if="trackType === 'personnel'"></personnel-form>
            <patrol-form  v-if="trackType === 'patrol'"></patrol-form>
        </div>
    </Modal>
</template>

<script>
import {mapState, mapMutations} from 'vuex'
import VehicleForm from './VehicleForm'
import PersonnelForm from './PersonnelForm'
import PatrolForm from './PatrolForm'

export default {
  name: 'TrackModal',
  components: {PatrolForm, VehicleForm, PersonnelForm},
  data () {
    return {
        trackType: 'patrol',
        // 轨迹类型数据源
        trackTypes: [
            { text: '车辆轨迹', label: 'vehicle', value: 'vehicle', disable: false },
            { text: '人员轨迹', label: 'personnel', value: 'personnel', disable: false },
            { text: '巡更轨迹', label: 'patrol', value: 'patrol', disable: false },
        ]
        
    }
  },
  computed: {
      ...mapState({
          showModal: ({ trackSearch }) => trackSearch.showModal
      })
  },
  mounted () {
  },
  methods: {
      ...mapMutations(['SET_SHOWMODAL_STATUS']),
      cannelSearch () { // 取消查询
        this.SET_SHOWMODAL_STATUS(false);
      },
      confirmSearch () { // 确认查询
        this.SET_SHOWMODAL_STATUS(false);
      }
  }
}
</script>

<style scoped>
    /* 框体样式 */
    .trackSearchModal {
        margin: -16px;
        border-radius: 6px;
        background: #1b3153;
        font-size: 14px;
        color: #fff;
    }
    .trackTitle div {
        height: 32px;
        line-height: 35px;
        /* border-bottom: 2px solid #393; */
        float: left;
    }
    /* 标题样式 */
    .trackTitle {
        background: #0f2343;
        width: 100%;
        padding: 0 24px;
        height: 38px;
        border-radius: 6px;
    }
    /* 内容样式 */
    .trackContent {
        padding: 20px 60px 0 60px;
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
    /* 轨迹表单样式 */
    .trackForm {
        width: 100%;
        margin: 0;
        padding: 0;
    }
</style>
