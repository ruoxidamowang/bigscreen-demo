import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 引入 DataV
import DataV, { setClassNamePrefix } from '@dataview/datav-vue3';

const app = createApp(App)
app.use(router)
app.use(DataV, { classNamePrefix: 'dv-' });
app.mount('#app')