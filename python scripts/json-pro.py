import json

f = open("police data.json", 'r')
j = json.load(f)
f.close()
oj = {}

for item in j["data"]:
  bo = {}
  os = True
  index = ""
  if "area_responsible_for_link/_text" in item:
    bo['areas'] = item["area_responsible_for_link/_text"]
  else:
    os = False
  if "budget_millions_currency/_source" in item:
    bo['budget_million'] = float(item["budget_millions_currency/_source"][0].replace(u'\xa3','').replace(',',''))
    bo['budget'] = float(item["budget_millions_currency/_source"][0].replace(u'\xa3','').replace(',',''))*1000000
  else:
    os = False
  if "force_link/_title" in item:
    index = item["force_link/_title"][0]
  else:
    os = False
  if os:
    oj[index] = bo

print oj

f = open("new police data.json", 'w')
f.write(json.dumps(oj, indent=2))
f.close()