import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
          imports: ['vue', 'vue-router'], // 这里加上 vue 之后，就不用手动 import ref 等
          resolvers: [ElementPlusResolver()],
          dts: 'src/auto-imports.d.ts', // 自动生成类型声明文件
          eslintrc: {
            enabled: true, // 生成 eslint 配置
            filepath: './.eslintrc-auto-import.json',
            globalsPropValue: true
          }
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),],
    server: {
        host: true,
    },
    base: '/bigscreen-demo/'
})
