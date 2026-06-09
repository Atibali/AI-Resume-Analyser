import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import { HomePage } from './pages/HomePage'
import { UploadPage } from './pages/UploadPage'
import { ResumePage } from './pages/ResumePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'upload',
        element: <UploadPage />,
      },
      {
        path: 'resume/:id',
        element: <ResumePage />,
      },
    ],
  },
])
