import os
from . import db

from flask import Flask
from flask import jsonify
    

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/hello')
    def hello():
        return 'Hello, Ed Planning!'

    @app.route('/schools')
    def schools():
        db = db.get_db()
        
        res = db.execute('SELECT * FROM schools WHERE Roll_No = ?', [request.args.get('id', '0')]).fetchone()
        return jsonify(res)

    from . import db
    db.init_app(app)

    return app
