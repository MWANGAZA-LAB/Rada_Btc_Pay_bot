import React from 'react'
import { MessageCircle, CreditCard, Bitcoin, CheckCircle } from 'lucide-react'

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: MessageCircle,
      title: 'Start Chat',
      description: 'Open Rada Bot on Telegram and select a service',
      color: 'bg-primary-100 text-primary-600',
    },
    {
      icon: CreditCard,
      title: 'Pay with M-Pesa',
      description: 'Complete your payment via M-Pesa STK Push or QR code',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Bitcoin,
      title: 'Get Bitcoin',
      description: 'Receive Bitcoin instantly in your wallet',
      color: 'bg-bitcoin-100 text-bitcoin-600',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-primary-50 to-bitcoin-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, secure, and fast. Get Bitcoin for your everyday M-Pesa transactions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${step.color} mb-6 shadow-lg`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-300 to-bitcoin-300 transform translate-x-8"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose Rada Bot?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make Bitcoin accessible to everyone through familiar M-Pesa payments
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Non-Custodial</h4>
              <p className="text-sm text-gray-600">
                You control your Bitcoin keys
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant</h4>
              <p className="text-sm text-gray-600">
                Bitcoin received immediately
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-bitcoin-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-bitcoin-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure</h4>
              <p className="text-sm text-gray-600">
                Bank-grade security
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Easy</h4>
              <p className="text-sm text-gray-600">
                Simple Telegram interface
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
