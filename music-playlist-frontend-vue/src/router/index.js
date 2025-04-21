import { createRouter, createWebHistory } from 'vue-router'

// Views
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/playlists/:id',
    name: 'PlaylistView',
    component: () => import('../views/PlayListView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
