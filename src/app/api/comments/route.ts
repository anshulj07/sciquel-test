import { NextRequest, NextResponse } from "next/server";
import validator from 'validator';

interface Comment {
  name: string;
  email: string;
  comment: string;
}

const comments: Comment[] = []; // Temporary storage for comments

export async function GET(req: NextRequest) {
  // Get the 50 most recent comments
  const recentComments = comments.slice(-50);
  return NextResponse.json({ comments: recentComments }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    // Check if req.body is null
    if (!req.body) {
      return NextResponse.json({ error: "Request body is missing" }, { status: 400 });
    }

    // Extract data from the request body
    const dataBuffer = await streamToBuffer(req.body);
    const dataString = dataBuffer.toString("utf-8");
    const { name, email, comment } = JSON.parse(dataString);

    // Validate required fields
    if (!name || !email || !comment) {
      return NextResponse.json({ error: "Name, email, and comment are required fields" }, { status: 400 });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return NextResponse.json({ error: "You missed something, Lets try again" }, { status: 400 });
    }

    // Save the comment to temporary storage
    comments.push({
      name,
      email,
      comment
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const chunks = [];
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks);
}
