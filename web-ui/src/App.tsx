import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-bitcoin-50">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}

export default App
