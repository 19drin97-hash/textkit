'use client';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';

const BRIDGE_SCRIPT = `import socket
import threading
import argparse
import sys
import time

def pipe(source, destination):
    try:
        while True:
            data = source.recv(4096)
            if not data:
                break
            destination.sendall(data)
    except Exception as e:
        pass
    finally:
        source.close()
        destination.close()

def start_tcp_forwarding(local_port, remote_host, remote_port):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        server.bind(('0.0.0.0', local_port))
    except Exception as e:
        print(f"[-] Error: Could not bind TCP port {local_port}: {e}")
        return

    server.listen(5)
    print(f"[*] TCP Bridge listening on port {local_port} -> {remote_host}:{remote_port}")

    while True:
        client_sock, addr = server.accept()
        print(f"[*] Accepted TCP connection from {addr[0]}:{addr[1]}")

        try:
            remote_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            remote_sock.connect((remote_host, remote_port))

            threading.Thread(target=pipe, args=(client_sock, remote_sock), daemon=True).start()
            threading.Thread(target=pipe, args=(remote_sock, client_sock), daemon=True).start()
        except Exception as e:
            print(f"[-] Could not connect to remote host {remote_host}:{remote_port}: {e}")
            client_sock.close()

def start_udp_forwarding(local_port, remote_host, remote_port):
    proxy_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        proxy_sock.bind(('0.0.0.0', local_port))
    except Exception as e:
        print(f"[-] Error: Could not bind UDP port {local_port}: {e}")
        return

    print(f"[*] UDP Bridge listening on port {local_port} -> {remote_host}:{remote_port}")

    known_clients = {}

    while True:
        try:
            data, addr = proxy_sock.recvfrom(4096)
            if addr[0] == remote_host:
                now = time.time()
                for client_addr in list(known_clients.keys()):
                    if now - known_clients[client_addr] > 60:
                        del known_clients[client_addr]
                    else:
                        proxy_sock.sendto(data, client_addr)
            else:
                known_clients[addr] = time.time()
                proxy_sock.sendto(data, (remote_host, remote_port))
        except:
            pass

def main():
    parser = argparse.ArgumentParser(description='BMW ENET Remote Coding Bridge')
    parser.add_argument('--mode', choices=['server', 'client'], required=True)
    parser.add_argument('--remote-ip', required=True)
    parser.add_argument('--car-ip', default='169.254.41.177')
    parser.add_argument('--port', type=int, default=13400)

    args = parser.parse_args()

    target_ip = args.car_ip if args.mode == 'client' else args.remote_ip

    t1 = threading.Thread(target=start_tcp_forwarding, args=(args.port, target_ip, args.port), daemon=True)
    t2 = threading.Thread(target=start_udp_forwarding, args=(args.port, target_ip, args.port), daemon=True)

    t1.start()
    t2.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    main()`;

export default function BMWCodingPage() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(BRIDGE_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      <div className="max-w-4xl mx-auto p-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Zurück zum Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-6">BMW Remote ENET Coding</h1>

        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Anleitung</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4 text-gray-700">
              <h3 className="font-bold border-b pb-2">A: Am Auto (Car-Side)</h3>
              <p>1. Verbinde das ENET-Kabel.</p>
              <p>2. Leite Port 13400 (TCP & UDP) im Router auf diesen Laptop weiter.</p>
              <p>3. Starte das Script:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs">
                python bridge.py --mode client --remote-ip [CODER_PUBLIC_IP]
              </pre>
              <p className="text-xs text-gray-500 italic">* remote-ip ist hier die IP des Coders, wird aber intern für die Rückverbindung vorbereitet.</p>
            </div>
            <div className="space-y-4 text-gray-700">
              <h3 className="font-bold border-b pb-2">B: Beim Coder (Coder-Side)</h3>
              <p>1. Starte das Script:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs">
                python bridge.py --mode server --remote-ip [CAR_PUBLIC_IP]
              </pre>
              <p>2. Starte E-Sys und verbinde dich über "Connection via ICOM/Ethernet" mit der IP <code>127.0.0.1</code>.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Python Bridge Script</h2>
            <button
              onClick={copyToClipboard}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {copied ? 'Kopiert!' : 'Script kopieren'}
            </button>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-96">
            {BRIDGE_SCRIPT}
          </pre>
        </div>
      </div>
    </div>
  );
}
