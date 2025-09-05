import React from 'react'
import { Bot, Github } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-600 to-bitcoin-500 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Rada Bot</h1>
              <p className="text-sm text-gray-500">Pay Bitcoin, Get M-Pesa</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">
              How it Works
            </a>
            <a 
              href="https://github.com/MWANGAZA-LAB/Rada_Btc_Pay_bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://t.me/Rada_Btc_Pay_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Start on Telegram
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
