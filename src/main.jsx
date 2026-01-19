import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Loader } from './components/Loader'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
            <Loader /> {/* This sits on top of everything */}
        </ErrorBoundary>
    </React.StrictMode>,
)
