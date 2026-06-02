import socket
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
                # Cleanup old clients (simple expiry)
                now = time.time()
                for client_addr in list(known_clients.keys()):
                    if now - known_clients[client_addr] > 60:
                        del known_clients[client_addr]
                    else:
                        proxy_sock.sendto(data, client_addr)
            else:
                known_clients[addr] = time.time()
                proxy_sock.sendto(data, (remote_host, remote_port))
        except Exception as e:
            pass

def main():
    parser = argparse.ArgumentParser(description='BMW ENET Remote Coding Bridge')
    parser.add_argument('--mode', choices=['server', 'client'], required=True,
                        help='server: Coder-side (E-Sys side), client: Car-side')
    parser.add_argument('--remote-ip', required=True, help='IP of the OTHER side (Public IP of Coder or Car)')
    parser.add_argument('--car-ip', default='169.254.41.177', help='Local IP of the car (ENET default 169.254.41.177)')
    parser.add_argument('--port', type=int, default=13400, help='DoIP Port (default: 13400)')

    args = parser.parse_args()

    if args.mode == 'client':
        # Car side: Local Port 13400 -> Car IP 13400
        # Coder connects to this machine's Public IP
        target_ip = args.car_ip
        print(f"[*] Mode: Car-side")
        print(f"[*] Point your Coder to your public IP.")
    else:
        # Coder side: Local Port 13400 -> Client's Public IP 13400
        # E-Sys connects to 127.0.0.1
        target_ip = args.remote_ip
        print(f"[*] Mode: Coder-side")
        print(f"[*] Point E-Sys to 127.0.0.1")

    t1 = threading.Thread(target=start_tcp_forwarding, args=(args.port, target_ip, args.port), daemon=True)
    t2 = threading.Thread(target=start_udp_forwarding, args=(args.port, target_ip, args.port), daemon=True)

    t1.start()
    t2.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[*] Shutting down...")

if __name__ == '__main__':
    main()
