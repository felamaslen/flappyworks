import json
from firebase import firebase
import time

ka = {}

while True:

  fb = firebase.FirebaseApplication('https://interception.firebaseio.com', None)
  result = fb.get('', None)
  
  for item in result:
    if not (item in ka):
      ka[item] = {'p1':0,'p2':0}
    if "player1" in result[item]:  
      if "keepAlive" in result[item]['player1']:
        if result[item]['player1']['keepAlive'] != ka[item]['p1']:
          ka[item]['p1'] = result[item]['player1']['keepAlive']
        else:
          print "Need to kill session " + str(item)
          fb.delete("/"+str(item),None)
    if "player2" in result[item]:    
      if "keepAlive" in result[item]['player2']:
        if result[item]['player2']['keepAlive'] != ka[item]['p2']:
          ka[item]['p2'] = result[item]['player2']['keepAlive']
        else:
          print "Need to kill session " + str(item)
          fb.delete("/"+str(item), None)
  time.sleep(30)
