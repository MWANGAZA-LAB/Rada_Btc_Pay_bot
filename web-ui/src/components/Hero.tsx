import React from 'react'
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react'

const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Seamless Bitcoin Payments
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-bitcoin-500">
                via M-Pesa
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Convert your M-Pesa payments to Bitcoin instantly. Buy airtime, pay bills, 
              and purchase goods while earning Bitcoin rewards.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a
                href="https://t.me/Rada_Btc_Pay_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 group"
              >
                <span>Start on Telegram</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <a
                href="#how-it-works"
                className="btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up">
            <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Conversion</h3>
              <p className="text-gray-600 text-center">
                Convert M-Pesa payments to Bitcoin in seconds
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-bitcoin-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-bitcoin-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Non-Custodial</h3>
              <p className="text-gray-600 text-center">
                You control your Bitcoin keys, we never hold your funds
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kenya First</h3>
              <p className="text-gray-600 text-center">
                Built specifically for Kenyan M-Pesa users
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-bitcoin-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
      </div>
    </section>
  )
}

export default Hero
