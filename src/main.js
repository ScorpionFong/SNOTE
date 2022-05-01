import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import Storage from 'vue-ls'

import 'element-ui/lib/theme-chalk/index.css'

import '@/assets/css/public.css'
import '@/mouse'

// vue-ls 的配置
const storageOptions = {
  namespace: 'snote_', // key 键的前缀
  name: 'ls', // 使用方式：Vue.变量名称 或 this.$变量名称
  storage: 'local' // 作用范围：local、session、memory
}

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(Storage, storageOptions)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
