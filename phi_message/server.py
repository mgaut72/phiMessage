import collections
import json
from flask import Flask, Response, request, render_template, session
from flask.ext.socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

database = collections.defaultdict(dict)
client_to_device = dict()


@app.route('/')
def index():
    return render_template('application.html')


@app.route('/keys/<username>', methods=['GET'])
def keys(username):
    return json.dumps(database[username])


@socketio.on('message', namespace='/messages')
def handle_my_message(data):
    try:
        sender = data['sender']
        messages = data['ciphertext']
    except:
        return
    for message in messages:
        try:
            device_id = message['device_id']
            mc = message['message']['content']
            ms = message['message']['signature']
            kc = message['key']['content']
            ks = message['key']['signature']
        except:
            return
        m = {'sender': sender,
             'message': {'content': mc, 'signature': ms},
             'key': {'content': kc, 'signature': ks}
             }
        emit(str(device_id), m, namespace='/messages', broadcast=True)


@socketio.on('login', namespace='/messages')
def messages_connect(data):
    try:
        user = data['username']
        did = data['device_id']
        rn = data['rsa']['n']
        re = data['rsa']['e']
        ex = data['ecdsa']['x']
        ey = data['ecdsa']['y']
    except:
        return
    keys = {'device_id': did,
            'rsa': {'n': rn, 'e': re},
            'ecdsa': {'x': ex, 'y': ey}}
    print "got keys: " + str(keys)
    client = request.namespace
    client_to_device[client] = {'user': user, 'device_id': did}
    database[user][did] = keys
    emit('users', {'users': database.keys()}, broadcast=True)


@socketio.on('disconnect', namespace='/messages')
def messages_disconnect():
    client = request.namespace
    username = client_to_device[client]['user']
    did = client_to_device[client]['device_id']
    del client_to_device[client]
    del database[username][did]
    if database[username] == {}:
        del database[username]
    emit('users', {'users': database.keys()}, broadcast=True)

if __name__ == '__main__':
    app.debug = True
    socketio.run(app, host='0.0.0.0', port=5000)
