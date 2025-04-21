import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import './assets/styles/global.css'; 


const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('token') 
    if (to.meta.requiresAuth && !isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  })