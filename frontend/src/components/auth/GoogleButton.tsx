'use client'
import Script from 'next/script'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (config: object) => void; renderButton: (element: HTMLElement, config: object) => void } } }
  }
}

export default function GoogleButton({ onCredential }: { onCredential: (credential: string) => void }) {
  const button = useRef<HTMLDivElement>(null)
  const render = () => {
    if (!window.google || !button.current || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return
    window.google.accounts.id.initialize({ client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, callback: (response: { credential: string }) => onCredential(response.credential) })
    window.google.accounts.id.renderButton(button.current, { theme: 'outline', size: 'large', width: 360, text: 'continue_with' })
  }
  useEffect(render, [onCredential])
  return <><Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={render} /><div ref={button} className="min-h-10" /></>
}
