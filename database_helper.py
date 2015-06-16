import sqlite3
from flask import g

DATABASE = 'my_db.db'

###########################################
# Just for connecting/closing the database
###########################################
def connect_db():
    return sqlite3.connect(DATABASE)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_db()
    return db

def close_db():
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

############################################
# All predefined queries
############################################

def get_all_data():
    try:
        query = '''select distinct device_latitude,device_longitude,device_position_accuracy,timestamp,user_id,sim_operator,sim_mcc,sim_mnc,cell_signal_strength_dbm from networkmonitor where sim_state='READY' and device_latitude not NULL'''
        cursor = get_db().cursor()
        cursor.execute(query)
        result = cursor.fetchall()
	cursor.close()
        if result is None:
            return (False, "Failed to find data in database","")
        else:
            return (True, "Found data", result)
    except:
        return (False, "Failed to get data from database","")
