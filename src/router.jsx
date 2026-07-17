import { createBrowserRouter } from 'react-router-dom'
import CreatorPage from './pages/CreatorPage.jsx'
import ReceiverPage from './pages/ReceiverPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CreatorPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/b/:id',
    element: <ReceiverPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
