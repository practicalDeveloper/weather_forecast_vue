import ForecastNow from "@/pages/ForecastNow";
import ForecastToday from "@/pages/ForecastToday";
import ForecastFiveDays from "@/pages/ForecastFiveDays";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        name: 'Now',
        path: '/ForecastNow',
        component: ForecastNow,
        props: true
    },
    {
        name: 'Today',
        path: '/ForecastToday',
        component: ForecastToday,
        props: true
    },
    {
        name: 'FiveDays',
        path: '/ForecastFiveDays',
        component: ForecastFiveDays,
        props: true
    },
]

const router = createRouter({
    routes,
    history: createWebHistory(process.env.BASE_URL)
})

export default router;