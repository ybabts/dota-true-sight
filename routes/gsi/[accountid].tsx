import { PageProps } from "$fresh/server.ts";
import { useState, useEffect, useRef } from "preact/hooks";

export default function Greet(props: PageProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const ws = useRef<WebSocket | null>(null);
  useEffect(() => {
    console.log('test')
    ws.current = new WebSocket('ws://localhost/api/gsi:8080?accountid='+props.params.accountid);
    ws.current.onopen = () => console.log('WebSocket connection established')
    ws.current.onmessage = message => {
      console.log('test')
      setMessages((prev) => [...prev, message.data]);
    }
    return () => {
      if(ws.current)
        ws.current!.close();
    }
  }, [])
  
  return (
    <div>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
