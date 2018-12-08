import Vue from 'vue'
import Router from 'vue-router'
import HelloMap from '@/components/HelloMap'
import HelloMap2 from '@/components/HelloMap2'
import DoParent from '@/components/DoParent'
import ApplyPopup from '@/components/ApplyPopup'
import ModelRotation from '@/components/ModelRotation'
import MapOperation from '@/components/MapOperation'
import TrackSearch from '@/cases/track/TrackSearch'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: "/applypopup"
    },
    {
      path: '/tracksearch',
      name: 'TrackSearch',
      component: TrackSearch
    },
    {
      path: '/mapoperation',
      name: 'MapOperation',
      component: MapOperation
    },
    {
      path: '/applypopup',
      name: 'ApplyPopup',
      component: ApplyPopup
    },
    {
      path: '/modelrotation',
      name: 'ModelRotaion',
      component: ModelRotation
    },
    {
      path: '/hellomap',
      name: 'HelloMap',
      component: HelloMap
    },
    {
      path: '/hellomap2',
      name: 'HelloMap2',
      component: HelloMap2
    },
    {
      path: '/doparent',
      name: 'DoParent',
      component: DoParent
    }
  ]
})
