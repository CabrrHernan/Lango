from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow React frontend to communicate

@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello from Flask backend!"})

if __name__ == "__main__":
    app.run(debug=True)

