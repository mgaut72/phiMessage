import collections
import json
from flask import Flask, Response, request, render_template
from flask.ext.socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

database = collections.defaultdict(list)


@app.route('/')
def index():
    return render_template('application.html')

@app.route('/keys/<username>', methods=['GET', 'POST'])
def keys(username):
    if request.method == 'POST':
        data = request.get_json()
        try:
            did = data['device_id']
            rn = data['rsa']['n']
            re = data['rsa']['e']
            ex = data['ecdsa']['x']
            ey = data['ecdsa']['y']
        except:
            return 'Malformed key object', 400
        keys = {'device_id': did,
                'rsa' : {'n' : rn, 'e' : re},
                'ecdsa' : {'x' : ex, 'y' : ey}}
        database[username].append(keys)
        return json.dumps(keys)
    elif request.method == 'GET':
        return json.dumps(database[username])

@socketio.on('message', namespace='/messages')
def handle_my_message(data):
    print "got data: " + str(data)
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










if __name__ == '__main__':
    app.debug = True
    socketio.run(app, host='0.0.0.0', port=5000)

