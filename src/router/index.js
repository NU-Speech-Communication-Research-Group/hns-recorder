import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  //history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'setup',
      component: () => import('../views/SetupView.vue'),
    },
    {
      path: '/recorder',
      name: 'recorder',
      component: () => import('../views/RecorderView.vue'),
      meta: { oneWay: true }
    },
    {
      path: '/end',
      name: 'end',
      component: () => import('../views/EndView.vue'),
    },    
  ],
})

router.afterEach(async (to) => {
  if (to.name == 'end') {
    window.onbeforeunload = null;
  } else {
    window.onbeforeunload = function () {
      return "Are you sure you want to leave?";
    };
  }
})

//"oneWay" routes are only allowed to move forward, back button is efffectively disabled
router.beforeEach(async (to, from, next) => {
  if (from.meta.oneWay == true) {
    let routes = router.getRoutes();
    let currentRoutePos;
    for (let r = 0; r < routes.length; r++) {
      if (routes[r].path == from.path) {
        currentRoutePos = r;
        break;
      }
    }
    if (routes[currentRoutePos + 1] != null && routes[currentRoutePos + 1].path == to.path) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
})

export default router
