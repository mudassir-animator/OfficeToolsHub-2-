import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-2xl p-6">
        <h1 className="text-3xl font-bold mb-4">Office Tools Hub</h1>
        <p className="mb-4">Clean rebuilt starter. Add your original tool pages into <code>src/pages</code>.</p>
        <div className="space-x-2">
          <Link to="/pdf-rotate" className="px-4 py-2 bg-blue-600 text-white rounded">PDF Rotate (example)</Link>
        </div>
      </div>
    </div>
  )
}

function PDFRotate() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4">PDF Rotate (placeholder)</h2>
        <p>This page is a placeholder. Add your original tool code here.</p>
      </div>
    </div>
  )
}

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/pdf-rotate" element={<PDFRotate/>} />
    </Routes>
  )
}
