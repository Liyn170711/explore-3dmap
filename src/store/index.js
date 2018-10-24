import Vue from 'vue'
import Vuex from 'vuex'

import trackSearch from './modules/trackSearch'

Vue.use(Vuex)

export default new Vuex.Store({
	modules: {
		trackSearch
	}
})