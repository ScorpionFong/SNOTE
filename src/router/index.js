import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '@/views/index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Index
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
