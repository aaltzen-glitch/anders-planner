import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import Data from './pages/Data'
import Settings from './pages/Settings'
import Instructions from './pages/Instructions'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'data', element: <Data /> },
      { path: 'settings', element: <Settings /> },
      { path: 'instructions', element: <Instructions /> },
    ],
  },
])
