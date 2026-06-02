import socket
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

if __name__ == "__main__":
    main()
