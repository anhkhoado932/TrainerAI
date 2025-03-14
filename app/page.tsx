import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl">UniHack 2025</div>
          <nav className="space-x-4">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">Welcome to UniHack 2025</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              The premier hackathon platform for university students around the globe.
              Connect, collaborate, and create amazing projects.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/dashboard" 
                className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
              <a 
                href="#features" 
                className="px-6 py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Team Collaboration",
                  description: "Find teammates and collaborate seamlessly on your hackathon projects."
                },
                {
                  title: "Project Showcase",
                  description: "Showcase your projects to judges and the community with detailed profiles."
                },
                {
                  title: "Live Events",
                  description: "Participate in workshops, mentoring sessions, and networking events."
                }
              ].map((feature, index) => (
                <div key={index} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="font-bold text-xl mb-2">UniHack 2025</div>
              <p className="text-gray-400">Empowering student innovation</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400 transition-colors">About</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            &copy; {new Date().getFullYear()} UniHack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 