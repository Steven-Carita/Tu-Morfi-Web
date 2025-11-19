import http.server
import socketserver
import subprocess
import shutil
import os


STATIC_PORT = 5508


JSON_SERVER_PORT = 3008
JSON_FILE = "db.json"


def start_json_server():
   
    if not os.path.exists(JSON_FILE):
        print(f"[JSON-SERVER] No se encontró {JSON_FILE}, no se inicia json-server.")
        return None

    js_path = shutil.which("json-server") or shutil.which("json-server.cmd")
    if js_path is None:
        print("[JSON-SERVER] No se encontró el comando 'json-server'.")
        print("Probá instalando con: npm install -g json-server")
        return None

   
    cmd = f'"{js_path}" --watch "{JSON_FILE}" --port {JSON_SERVER_PORT}'

    print(f"[JSON-SERVER] Iniciando json-server en http://localhost:{JSON_SERVER_PORT} ...")
   
    proc = subprocess.Popen(cmd, shell=True)
    return proc


def start_static_server():
    
   
    print("Sirviendo archivos estáticos desde:", os.getcwd())

    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    handler = http.server.SimpleHTTPRequestHandler

    with socketserver.TCPServer(("", STATIC_PORT), handler) as httpd:
        print(f"[STATIC] Servidor de archivos iniciado en http://localhost:{STATIC_PORT}")
        print("[STATIC] Presioná Ctrl + C para detener ambos servidores.")
        httpd.serve_forever()


if __name__ == "__main__":
    json_proc = start_json_server()
    try:
        start_static_server()
    except KeyboardInterrupt:
        print("\nDeteniendo servidores...")
    finally:
        if json_proc is not None:
            json_proc.terminate()
            try:
                json_proc.wait(timeout=5)
            except Exception:
                pass
        print("Listo, todo detenido.")
