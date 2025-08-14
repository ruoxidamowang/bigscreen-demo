import {createRouter, createWebHashHistory} from 'vue-router'
import Home from '../views/Home.vue'
import Index from '../views/Index.vue'
import Mobile from '../views/Mobile.vue'
import Login from '../views/Login.vue'

const routes = [
    { path: '/login', name: 'Login', component: Login },
    { path: '/', name: 'Index', component: Index, meta: { requiresAuth: true } },
    { path: '/home', name: 'Home', component: Home },
    { path: '/mobile', name: 'Mobile', component: Mobile },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    
    if (to.meta.requiresAuth && !isLoggedIn) {
        // 需要登录但未登录，重定向到登录页
        next('/login')
    } else if (to.path === '/login' && isLoggedIn) {
        // 已登录用户访问登录页，重定向到首页
        next('/')
    } else {
        next()
    }
})

export default router