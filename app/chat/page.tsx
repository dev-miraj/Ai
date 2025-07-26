import Sidebar from "@/components/sidebar"
import ChatScreen from "@/components/chat-screen"

export default function Chat() {
  return (
    <div className="flex h-screen mx-auto bg-white max-h-screen font-satoshi">
      <Sidebar activeChat="Learning NLP vs LLM" />
      <ChatScreen />
    </div>
  )
}
