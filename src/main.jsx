// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

const router = createBrowserRouter([
  {
    path: '/*',
    element: <App />,
  },
]);

createRoot(document.getElementById('root')).render(
  <>
    <>
      <RouterProvider router={router} />
    </>
  </>,
);
