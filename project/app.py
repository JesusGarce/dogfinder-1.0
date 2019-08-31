import os
import sys

from flask import Flask, flash, request, redirect, render_template, json
from werkzeug.utils import secure_filename

sys.path.extend(['C:/Users/jesus/Desktop/dogfinder-1.0'])

UPLOAD_FOLDER = 'C:/Users/jesus/Desktop/dogfinder-1.0/images_uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return render_template('index.html')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


from project.backend.dog_detection import dog_breed_classifier

@app.route('/upload', methods = ['POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            filepath = os.path.join(app.config['UPLOAD_FOLDER'] + "/" + filename)
            print(filepath)
            output = dog_breed_classifier(filepath)
            print(output)
            response = app.response_class(
                response=json.dumps(output),
                status=200,
                mimetype='application/json'
            )
            return response
    return

from project.backend.connection_db import select_breed

@app.route('/breed/<breed>', methods=['GET'])
def get_breed_info(breed):
    if request.method == 'GET':
        if breed == '':
            flash('No selected breed')
        breed_info = select_breed(breed)
        response = app.response_class(
            response=json.dumps(breed_info),
            status=200,
            mimetype='application/json'
        )
        return response
    return

if __name__ == '__main__':
    app.run(debug=False, threaded=False)
