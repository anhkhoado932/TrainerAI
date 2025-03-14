import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl">UniHack 2025</div>
          <nav className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              U
            </div>
          </nav>
        </div>
      </header>
      
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-gray-50 border-r p-4">
          <nav className="space-y-1">
            {[
              { name: 'Overview', href: '#overview', current: true },
              { name: 'Projects', href: '#projects', current: false },
              { name: 'Teams', href: '#teams', current: false },
              { name: 'Events', href: '#events', current: false },
              { name: 'Resources', href: '#resources', current: false },
              { name: 'Settings', href: '#settings', current: false },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium
                  ${item.current 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                `}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </a>
            ))}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-grow p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome to your UniHack dashboard</p>
          </div>
          
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { name: 'Active Projects', value: '3' },
              { name: 'Team Members', value: '12' },
              { name: 'Upcoming Events', value: '2' }
            ].map((stat) => (
              <div key={stat.name} className="bg-white p-6 rounded-lg border shadow-sm">
                <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>
          
          {/* Recent activity */}
          <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
            <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { 
                  title: 'Project submission deadline approaching', 
                  description: 'Your project "EcoTrack" is due in 3 days',
                  time: '2 hours ago'
                },
                { 
                  title: 'New team member joined', 
                  description: 'Alex Kim joined your team "CodeCrafters"',
                  time: '1 day ago'
                },
                { 
                  title: 'Workshop registration open', 
                  description: 'Register for "AI in Healthcare" workshop',
                  time: '2 days ago'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex-grow">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Projects */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Your Projects</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { 
                      name: 'EcoTrack', 
                      team: 'CodeCrafters', 
                      status: 'In Progress',
                      statusColor: 'bg-yellow-100 text-yellow-800',
                      deadline: 'May 15, 2025'
                    },
                    { 
                      name: 'MediConnect', 
                      team: 'HealthTech', 
                      status: 'Completed',
                      statusColor: 'bg-green-100 text-green-800',
                      deadline: 'Apr 30, 2025'
                    },
                    { 
                      name: 'UrbanMobility', 
                      team: 'CityInnovators', 
                      status: 'Planning',
                      statusColor: 'bg-blue-100 text-blue-800',
                      deadline: 'Jun 10, 2025'
                    }
                  ].map((project) => (
                    <tr key={project.name}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{project.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{project.team}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.statusColor}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.deadline}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 