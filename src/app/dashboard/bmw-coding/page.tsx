'use client';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';

const CAR_SCRIPT = `import socket
import threading
import time
import sys

def pipe(source, destination):
    try:
        while True:
            data = source.recv(4096)
            if not data: break
            destination.sendall(data)
    except: pass
    finally:
        source.close()
        destination.close()

def start_tcp(lp, rh, rp):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('0.0.0.0', lp))
    s.listen(5)
    while True:
        c, a = s.accept()
        r = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            r.connect((rh, rp))
            threading.Thread(target=pipe, args=(c, r), daemon=True).start()
            threading.Thread(target=pipe, args=(r, c), daemon=True).start()
        except: c.close()

def start_udp(lp, rh, rp):
    ps = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    ps.bind(('0.0.0.0', lp))
    clients = {}
    while True:
        try:
            data, addr = ps.recvfrom(4096)
            if addr[0] == rh:
                now = time.time()
                for c_addr in list(clients.keys()):
                    if now - clients[c_addr] > 60: del clients[c_addr]
                    else: ps.sendto(data, c_addr)
            else:
                clients[addr] = time.time()
                ps.sendto(data, (rh, rp))
        except: pass

def main():
    print("=== BMW Remote Coding - CAR SIDE ===")
    car_ip = input("Car IP [Default 169.254.41.177]: ") or "169.254.41.177"
    port = 13400

    print(f"[*] Starting Car-side Bridge on port {port}...")
    threading.Thread(target=start_tcp, args=(port, car_ip, port), daemon=True).start()
    threading.Thread(target=start_udp, args=(port, car_ip, port), daemon=True).start()

    print("[OK] Bridge is running.")
    print("[!] Make sure PORT 13400 (TCP & UDP) is forwarded in your Router to THIS PC.")
    print("[!] Provide your PUBLIC IP to the Coder.")

    try:
        while True: time.sleep(1)
    except KeyboardInterrupt: pass

if __name__ == '__main__':
    main()`;

const CODER_SCRIPT = `import socket
import threading
import time
import sys

def pipe(source, destination):
    try:
        while True:
            data = source.recv(4096)
            if not data: break
            destination.sendall(data)
    except: pass
    finally:
        source.close()
        destination.close()

def start_tcp(lp, rh, rp):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind(('0.0.0.0', lp))
    s.listen(5)
    while True:
        c, a = s.accept()
        r = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            r.connect((rh, rp))
            threading.Thread(target=pipe, args=(c, r), daemon=True).start()
            threading.Thread(target=pipe, args=(r, c), daemon=True).start()
        except: c.close()

def start_udp(lp, rh, rp):
    ps = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    ps.bind(('0.0.0.0', lp))
    clients = {}
    while True:
        try:
            data, addr = ps.recvfrom(4096)
            if addr[0] == rh:
                now = time.time()
                for c_addr in list(clients.keys()):
                    if now - clients[c_addr] > 60: del clients[c_addr]
                    else: ps.sendto(data, c_addr)
            else:
                clients[addr] = time.time()
                ps.sendto(data, (rh, rp))
        except: pass

def main():
    print("=== BMW Remote Coding - CODER SIDE ===")
    remote_ip = input("CAR Public IP: ")
    if not remote_ip:
        print("Error: Remote IP required.")
        return

    port = 13400

    print(f"[*] Starting Coder-side Bridge on port {port}...")
    threading.Thread(target=start_tcp, args=(port, remote_ip, port), daemon=True).start()
    threading.Thread(target=start_udp, args=(port, remote_ip, port), daemon=True).start()

    print("[OK] Bridge is running.")
    print("[!] Point E-Sys to 127.0.0.1 (via Connection ICOM/Ethernet)")

    try:
        while True: time.sleep(1)
    except KeyboardInterrupt: pass

if __name__ == '__main__':
    main()`;

export default function BMWCodingPage() {
  const { user } = useUser();
  const [copiedScript, setCopiedScript] = useState<'car' | 'coder' | null>(null);

  const copyToClipboard = (text: string, type: 'car' | 'coder') => {
    navigator.clipboard.writeText(text);
    setCopiedScript(type);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-700">TextKit KI</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Hallo, {user?.firstName}!</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Zurück zum Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-gray-900">BMW Remote ENET Coding EXE Generator</h1>

        <div className="bg-white rounded-xl border p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Wie man eine EXE erstellt (Windows)</h2>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-sm text-blue-800 font-medium">
              Da wir keine ausführbaren Dateien direkt zum Download anbieten (Sicherheit), kannst du sie ganz einfach selbst erstellen:
            </p>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Installiere Python von <a href="https://python.org" target="_blank" className="text-blue-600 underline">python.org</a>.</li>
            <li>Öffne das Terminal (CMD) und installiere PyInstaller: <code>pip install pyinstaller</code></li>
            <li>Speichere den Code unten als <code>car.py</code> (für den Kunden) oder <code>coder.py</code> (für dich).</li>
            <li>Erstelle die EXE: <code>pyinstaller --onefile car.py</code></li>
            <li>Du findest die fertige Datei im Ordner <code>dist/</code>.</li>
          </ol>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Car Side */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">1. Für den Kunden (Car-Side)</h2>
              <button
                onClick={() => copyToClipboard(CAR_SCRIPT, 'car')}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                {copiedScript === 'car' ? 'Kopiert!' : 'Code kopieren'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Dieses Script muss beim Kunden laufen. Er muss Port 13400 in seinem Router freigeben.
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-[10px] leading-tight h-64">
              {CAR_SCRIPT}
            </pre>
          </div>

          {/* Coder Side */}
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">2. Für dich (Coder-Side)</h2>
              <button
                onClick={() => copyToClipboard(CODER_SCRIPT, 'coder')}
                className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors"
              >
                {copiedScript === 'coder' ? 'Kopiert!' : 'Code kopieren'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Dieses Script läuft bei dir. Gib die öffentliche IP des Kunden ein, wenn du danach gefragt wirst.
            </p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-[10px] leading-tight h-64">
              {CODER_SCRIPT}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
