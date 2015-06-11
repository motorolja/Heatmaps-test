import sqlite3
from flask import g

DATABASE = 'my_db_db'

def connect_db():
    return sqlite3.connect(DATABASE)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_db()
    return db

# to close the database
def close_db():
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
