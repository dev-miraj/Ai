import Sidebar from "@/components/sidebar"
import WelcomeScreen from "@/components/welcome-screen"

export default function Home() {
  return (
    <div className="flex h-screen mx-auto bg-white max-h-screen font-satoshi">
      <Sidebar />
      <WelcomeScreen />
    </div>
  )
}
