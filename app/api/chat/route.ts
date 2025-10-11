import { StreamingTextResponse } from "ai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleGenerativeAIStream, type Message } from "ai"

// Create a client with your Google API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Convert the chat history to the format expected by the Gemini API
    const formattedPreviousMessages = messages.slice(0, -1).map((message: Message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    }))

    // Get the last user message
    const lastMessage = messages[messages.length - 1]

    // Create a generative model instance
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Updated to a current model name
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    })

    // Start a chat session
    const chat = model.startChat({
      history: formattedPreviousMessages,
    })

    // Send the message and get the response
    const result = await chat.sendMessageStream([{ text: lastMessage.content }])

    // Convert the response to a readable stream
    const stream = GoogleGenerativeAIStream(result)

    // Return the stream as a streaming text response
    return new StreamingTextResponse(stream)
  } catch (error: any) {
    console.error("Error in chat route:", error)

    // Return a more detailed error message
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
