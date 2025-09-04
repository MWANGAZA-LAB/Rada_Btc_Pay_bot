import React from 'react'
import { 
  Smartphone, 
  Building2, 
  ShoppingCart, 
  Send, 
  Wallet, 
  QrCode,
  ArrowRight
} from 'lucide-react'

const Features: React.FC = () => {
  const features = [
    {
      icon: Smartphone,
      title: 'Buy Airtime',
      description: 'Top up your phone with Bitcoin rewards',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Building2,
      title: 'Pay Bills',
      description: 'Pay utility bills and earn Bitcoin',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: ShoppingCart,
      title: 'Buy Goods',
      description: 'Purchase goods and receive Bitcoin',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Send,
      title: 'Send Money',
      description: 'Send money and get Bitcoin rewards',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Wallet,
      title: 'Lipa na Pochi',
      description: 'Use Pochi and earn Bitcoin',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: QrCode,
      title: 'Scan QR Codes',
      description: 'Scan QR codes for Bitcoin payments',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Use Rada Bot for all your M-Pesa transactions and earn Bitcoin with every payment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="feature-card group cursor-pointer"
                onClick={() => window.open('https://t.me/RadaBot', '_blank')}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-primary-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      <span>Try it now</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="text-center mt-12">
          <a
            href="https://t.me/RadaBot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-lg px-8 py-4 inline-flex items-center space-x-2"
          >
            <span>Start Using Rada Bot</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default Features
