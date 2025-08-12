import {createRouter, createWebHashHistory} from 'vue-router'
import Home from '../views/Home.vue'
import Index from '../views/Index.vue'

const routes = [
    { path: '/', name: 'Index', component: Index },
    { path: '/home', name: 'Home', component: Home },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router