import collections
import json
from flask import Flask, Response, request, jsonify

app = Flask(__name__)

database = collections.defaultdict(list)

@app.route('/keys/<username>', methods=['GET', 'POST'])
def keys(username):
    if request.method == 'POST':
        data = request.get_json()
        print "got data" + str(data)
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
        print "added " + str(keys) + " to the db"
        return jsonify(**keys)

    elif request.method == 'GET':
        return json.dumps(database[username])

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

