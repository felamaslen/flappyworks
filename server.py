import time
import BaseHTTPServer

HOST_NAME = ''
PORT_NUMBER = 4242

class MyHandler(BaseHTTPServer.BaseHTTPRequestHandler):
  def do_GET(s):
    s.send_response(200)
    s.send_header("Content-type", "text/html; charset=UTF-8")
    s.end_headers()
    f = open('chat.html', 'r')
    pages['chat'] = f.read()
    f.close()
    s.wfile.write(pages['chat'])
  def do_POST(s):
    global incID
    s.send_response(200)
    s.send_header("Content-type", "text/plain; charset=UTF-8")
    s.end_headers()
    length = int(s.headers['Content-Length'])
    post = urlparse.parse_qs(s.rfile.read(length).decode('utf-8'))
    for key, value in post.iteritems():
      post[key] = value[0]
    s.wfile.write("Error: No task")

if __name__ == '__main__':
  server_class = BaseHTTPServer.HTTPServer
  httpd = server_class((HOST_NAME, PORT_NUMBER), MyHandler)
  print time.asctime(), "Server Starts - %s:%s" % (HOST_NAME, PORT_NUMBER)
  try:
    httpd.serve_forever()
  except KeyboardInterrupt:
    pass
  httpd.server_close()
  print time.asctime(), "Server Stops - %s:%s" % (HOST_NAME, PORT_NUMBER)