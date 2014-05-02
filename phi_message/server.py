import collections
import json
from flask import Flask, Response, request, render_template

app = Flask(__name__)

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


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

