import sqlite3
import json
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler 
from werkzeug.serving import run_with_reloader
from flask import Flask, render_template, request

import database_helper

PORT = int(5000)
Socket_dictionary = {}

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
        user = ws.receive()
        print user
        if Socket_dictionary.has_key(user):
            old = Socket_dictionary[user]
            old.send( json.dumps({"message": "terminate", "data": ""}) )
        Socket_dictionary[user] = ws
        # Send initial user data to chart
        ws.send( json.dumps({"message": "message receieved", "data":user}) )
        ws.send( json.dumps({"message": "chart_data", "data": chart_data()}) )
        for i in Socket_dictionary:
            Socket_dictionary[i].send( json.dumps({"message" : "active_users", "data" : len(Socket_dictionary)}))
        # Wait for some random data from the client
        close_message = ws.receive()
        Socket_dictionary.pop(user,None)
    return ""

# Makes sure that the database is properly closed after we are done with it
@app.teardown_appcontext
def close_connection(exception):
    database_helper.close_db()


@run_with_reloader
def run_server():
    print("Starting http_server on port: %s..." % PORT)
    http_server = WSGIServer(('127.0.0.1', PORT), app,backlog=None, spawn='default', log='default', handler_class=WebSocketHandler, environ=None)
    http_server.serve_forever()
    
if __name__ == '__main__':
    run_server()

