import json
import urllib2
import math
import matplotlib.pyplot as plt

def median(mylist):
  sorts = sorted(mylist)
  length = len(sorts)
  if not length % 2:
    return (sorts[length / 2] + sorts[length / 2 - 1]) / 2.0
  return sorts[length / 2]

#Config
dp = 6
padd = 12
results = 50
channelName = "Ashens"
#End Config
channelURL = "http://gdata.youtube.com/feeds/base/users/"+channelName+"/uploads?v=2&alt=json&max-results="+str(results)
channelVideosF = urllib2.urlopen(channelURL)
channelVideos = str(channelVideosF.read())
channelVideos = json.loads(channelVideos)
videoEntries = channelVideos['feed']['entry']
print "YouTube Likes/Dislikes/Views Ratio Generator V1"
print 'Analysing '+str(results)+' Videos From Channel "'+channelName+'"'
print "L = Likes, D = Dislikes, V = Views"
print "-"*(padd*6)
print "L/V".ljust(padd," "),
print "D/V".ljust(padd," "),
print "L/D".ljust(padd," "),
print "L".ljust(padd," "),
print "D".ljust(padd," "),
print "V".ljust(padd," ")
history = {
  "lv":[],
  "dv":[],
  "ld":[],
  "l":[],
  "d":[],
  "v":[]
}
sums = {
  "lv":0,
  "dv":0,
  "ld":0,
  "l":0,
  "d":0,
  "v":0
}
dev = []
mdev = []
count = 0
for entry in videoEntries:
  entryID = entry['id']['$t'].split(":")[-1]
  videoURL = "http://gdata.youtube.com/feeds/api/videos/"+entryID+"?v=2&alt=json"
  videoF = urllib2.urlopen(videoURL)
  video = str(videoF.read())
  video = json.loads(video)
  if "yt$rating" in video["entry"].keys() and video["entry"]["yt$statistics"]['viewCount'] != "301":
    views = video["entry"]["yt$statistics"]['viewCount']
    likes = video["entry"]["yt$rating"]["numLikes"]
    dislikes = video["entry"]["yt$rating"]["numDislikes"]
    
    history["l"].append(likes)
    history["d"].append(dislikes)
    history["v"].append(views)
    if float(likes) > 0 and float(views) > 0:
      history["lv"].append(float(likes)/float(views))
    else:
      history["lv"].append(0)
    if float(dislikes) > 0 and float(views) > 0:
      history["dv"].append(float(dislikes)/float(views))
    else:
      history["dv"].append(0)
    if float(dislikes) > 0 and float(likes) > 0:
      history["ld"].append(float(likes)/float(dislikes))
    else:
      history["ld"].append(0)
    
    sums["l"] +=  float(likes)
    sums["d"] +=  float(dislikes)
    sums["v"] +=  float(views)
    if float(likes) > 0 and float(views) > 0:
      sums["lv"] += float(likes)/float(views)
    if float(dislikes) > 0 and float(views) > 0:
      sums["dv"] += float(dislikes)/float(views)
    if float(dislikes) > 0 and float(likes) > 0:
      sums["ld"] += float(likes)/float(dislikes)
    
    if float(likes) > 0 and float(views) > 0:
      print str(round(float(likes)/float(views), dp)).ljust(padd," "),
    else:
      print '0'.ljust(padd," "),
    if float(dislikes) > 0 and float(views) > 0:
      print str(round(float(dislikes)/float(views), dp)).ljust(padd," "),
    else:
      print '0'.ljust(padd," "),
    if float(dislikes) > 0 and float(likes) > 0:
      print str(round(float(likes)/float(dislikes), dp)).ljust(padd," "),
    else:
      print '0'.ljust(padd," "),
    print likes.ljust(padd," "),
    print dislikes.ljust(padd," "),
    print views.ljust(padd," ")
    
    count += 1

print "-"*(padd*6)

print "AV L/V".ljust(padd," "),
print "AV D/V".ljust(padd," "),
print "AV L/D".ljust(padd," "),
print "AV L".ljust(padd," "),
print "AV D".ljust(padd," "),
print "AV V".ljust(padd," ")

print str(round(sums["lv"]/count, dp)).ljust(padd," "),
print str(round(sums["dv"]/count, dp)).ljust(padd," "),
print str(round(sums["ld"]/count, dp)).ljust(padd," "),
print str(int(round(sums["l"]/count))).ljust(padd," "),
print str(int(round(sums["d"]/count))).ljust(padd," "),
print str(int(round(sums["v"]/count))).ljust(padd," ")

print "-"*(padd*6)

for item in history['ld']:
  dev.append((abs(item - (sums["ld"] / count)) / (sums["ld"] / count)) * 100)
  mdev.append(abs(item - median(history['ld'])) / median(history['ld']) * 100)

devSum = 0

for item in dev:
  devSum += item

devAv = round(devSum/len(dev), 2)
devMed = round(median(mdev), 2)

print "The Mean Deviation Of L/D is "+str(devAv)+"%"
print "The Median Deviation Of L/D is "+str(devMed)+"%"

plt.plot(history["lv"], history["dv"], 'ro')
plt.xlabel('Likes/Views')
plt.ylabel('Dislikes/Views')
plt.axis([0, 0.075, 0, 0.0025])
plt.show()

raw_input()
