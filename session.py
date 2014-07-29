from firebase import firebase
firebase = firebase.FirebaseApplication('https://interception.firebaseio.com', None)
result = firebase.get('', None)
print result
