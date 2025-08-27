from flask import Flask, request, jsonify
from uuid import uuid4

app = Flask(__name__)

# In-memory storage for demonstration purposes
# Real implementation should use a persistent database
requests_db = {}

# Helper to fetch new requests from email (placeholder)
def fetch_email_requests():
    """Placeholder function.

    In a real application this would connect to an email server via IMAP/POP3,
    parse incoming messages and create new requests automatically.
    """
    pass

@app.route('/requests', methods=['POST'])
def create_request():
    data = request.get_json(force=True)
    req_id = str(uuid4())
    requests_db[req_id] = {
        'client': data.get('client'),
        'email': data.get('email'),
        'description': data.get('description'),
        'status': 'pending',
        'assignee': None
    }
    return jsonify({'id': req_id}), 201

@app.route('/requests', methods=['GET'])
def list_requests():
    return jsonify(requests_db)

@app.route('/requests/<req_id>', methods=['GET'])
def get_request(req_id):
    req = requests_db.get(req_id)
    if not req:
        return jsonify({'error': 'not_found'}), 404
    return jsonify(req)

@app.route('/requests/<req_id>', methods=['PUT'])
def update_request(req_id):
    data = request.get_json(force=True)
    req = requests_db.get(req_id)
    if not req:
        return jsonify({'error': 'not_found'}), 404

    # Update status if provided
    if 'status' in data:
        req['status'] = data['status']

    # Assign to employee if provided
    if 'assignee' in data:
        req['assignee'] = data['assignee']

    return jsonify(req)

if __name__ == '__main__':
    app.run(debug=True)
