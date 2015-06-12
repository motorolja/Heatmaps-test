import sqlite3
import json
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler 
from werkzeug.serving import run_with_reloader
from flask import Flask, render_template, request

import database_helper

PORT = int(5000)
Socket_array = []

app = Flask(__name__)
app.debug = True

@app.route("/")
def root():
    return render_template('heatmap.html')

# For initiating an idle websocket
@app.route('/persistant_connection')
def persistant_connection():
    print ("in persistant connection")
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        clean_dead_sockets()
        Socket_array.append(ws)
        close_message = ws.receive()
        Socket_array.remove(ws)
    return ""

# Remove dead sockets
def clean_dead_sockets():
    for i in Socket_array:
        if Socket_array[i].closed:
            Socket_array.remove(i)
    return ""


@run_with_reloader
def run_server():
    print("Starting http_server on port: %s..." % PORT)
    http_server = WSGIServer(('127.0.0.1', PORT), app,backlog=None, spawn='default', log='default', handler_class=WebSocketHandler, environ=None)
    http_server.serve_forever()
    
if __name__ == '__main__':
    run_server()

