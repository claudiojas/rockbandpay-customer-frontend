import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './routes/__root.tsx'
import { Index } from './routes/index.lazy.tsx'

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Index,
})

export const routeTree = rootRoute.addChildren([indexRoute])