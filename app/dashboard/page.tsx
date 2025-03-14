import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-xl text-foreground">AI PT</div>
          <nav className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <SignOutButton variant="ghost" />
            <Avatar>
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </nav>
        </div>
      </header>
      
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-muted/50 border-r border-border p-4">
          <nav className="space-y-1">
            {[
              { name: 'Dashboard', href: '#dashboard', current: true },
              { name: 'Workouts', href: '#workouts', current: false },
              { name: 'Progress', href: '#progress', current: false },
              { name: 'Nutrition', href: '#nutrition', current: false },
              { name: 'Settings', href: '#settings', current: false },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </a>
            ))}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2 text-foreground">Welcome back, Alex</h1>
            <p className="text-muted-foreground">Here's an overview of your fitness journey</p>
          </div>
          
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Weekly Activity</CardTitle>
                  <Badge className="text-green-500 bg-green-500/10">+12%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">4/5</div>
                <p className="text-muted-foreground text-sm">Workouts completed</p>
                <div className="mt-4">
                  <Progress value={80} className="h-2" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Calories Burned</CardTitle>
                  <Badge className="text-green-500 bg-green-500/10">+8%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">1,248</div>
                <p className="text-muted-foreground text-sm">This week</p>
                <div className="mt-4 grid grid-cols-7 gap-1">
                  {[30, 45, 25, 60, 75, 45, 35].map((value, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div 
                        className="w-full bg-primary/20 rounded-sm" 
                        style={{ height: `${value}px` }}
                      ></div>
                      <span className="text-xs text-muted-foreground mt-1">{['M','T','W','T','F','S','S'][i]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Next Workout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-medium mb-1">Upper Body Strength</div>
                <p className="text-muted-foreground text-sm mb-4">Today at 6:00 PM</p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary/50 mr-2"></span>
                    Bench Press - 3 sets x 10 reps
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary/50 mr-2"></span>
                    Shoulder Press - 3 sets x 12 reps
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary/50 mr-2"></span>
                    Tricep Extensions - 3 sets x 15 reps
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent workouts */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Workout</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { date: 'May 12, 2023', workout: 'Lower Body Strength', duration: '45 min', calories: 320, status: 'Completed' },
                    { date: 'May 10, 2023', workout: 'HIIT Cardio', duration: '30 min', calories: 280, status: 'Completed' },
                    { date: 'May 8, 2023', workout: 'Upper Body Strength', duration: '50 min', calories: 350, status: 'Completed' },
                    { date: 'May 6, 2023', workout: 'Core & Flexibility', duration: '40 min', calories: 220, status: 'Completed' },
                  ].map((workout, i) => (
                    <TableRow key={i}>
                      <TableCell>{workout.date}</TableCell>
                      <TableCell className="font-medium">{workout.workout}</TableCell>
                      <TableCell>{workout.duration}</TableCell>
                      <TableCell>{workout.calories}</TableCell>
                      <TableCell>
                        <Badge className="text-green-500 bg-green-500/10">
                          {workout.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* AI Insights */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>AI Insights</CardTitle>
                <Badge className="text-blue-500 bg-blue-500/10">Updated today</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertDescription>
                  <span className="font-medium">Form improvement: </span> 
                  Your squat depth has improved by 15% in the last two weeks. Keep focusing on maintaining a neutral spine.
                </AlertDescription>
              </Alert>
              <Alert className="bg-green-500/10 border-green-500/20">
                <AlertDescription>
                  <span className="font-medium">Progress insight: </span>
                  You're consistently hitting your weekly workout goals. Consider increasing weight for bench press as you've maintained perfect form for 3 consecutive sessions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
} 