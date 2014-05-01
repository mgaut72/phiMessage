from flask import Flask, request

app = Flask(__name__)

@app.route('/keys/<username>/', methods=['GET', 'POST'])
def keys(username):
    if request.method == 'POST':
        data = get_json()
        print data


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)

