# Import Python Modules 
import os
import sys
import time
import csv
import wget
import simplejson as json
from datetime import datetime
import sunlight
from sunlight import congress
from sunlight import openstates


sunlight.config.API_KEY = 'ee2e1ac3f29047be84f682806f631a01'


con = [	
	{'name':'Bachmann','state':'MN','category':'snow'},
	{'name':'Campbell','state':'CA','category':'drought'},
	{'name':'Coble','state':'NC','category':'tornado'},
	{'name':'Gerlach','state':'PA','category':'flood'},
	{'name':'Griffin','state':'AR','category':'tornado'},
	{'name':'Latham','state':'IA','category':'tornado'},
	{'name':'Matheson','state':'UT','category':'drought'},
	{'name':'McCarthy','state':'NY','category':'flood'},
	{'name':'McIntyre','state':'NC','category':'tornado'},
	{'name':'McKeon','state':'CA','category':'drought'},
	{'name':'Miller','state':'CA','category':'drought'},
	{'name':'Moran','state':'VA','category':'pollution'},
	{'name':'Owens','state':'NY','category':'flood'},
	{'name':'Runyan','state':'NJ','category':'flood'},
	{'name':'Waxman','state':'CA','category':'drought'},
	{'name':'Wolf','state':'VA','category':'pollution'},
	{'name':'Rockefeller','state':'WV','category':'pollution'},
	{'name':'Levin','state':'MI','category':'snow'},
	{'name':'Johnson','state':'SD','category':'tornado'},
	{'name':'Coburn','state':'OK','category':'tornado'},
	{'name':'Johanns','state':'NE','category':'tornado'},
	{'name':'Harkin','state':'IA','category':'tornado'},
	{'name':'Chambliss','state':'GA','category':'snow'},
	{'name':'Bachus','state':'AL','category':'snow'}
]

states = ['ne-None','wv-None','sd-None','ok-None','ia-None','ga-None','mi-None']

sen  = []
districts = []
def getBoundary(district, state):
	district = district.lower()
	if district not in states:
		url = 'http://gis.govtrack.us/boundaries/cd-2012/'+district+'/shape?format=json'
		#state_output = os.system('wget %s -O geo/%s.json' % (url, district))
		if district not in districts:
			districts.append(district)


def makeJsons(district):
	if district not in states:
		url = 'geo/'+district+'.json';
		config = json.loads(open(url).read())
		return config['coordinates'][0]
categories = {}
for c in con:
	categories[c['category']] = {}
	categories[c['category']]['districts'] = []
	categories[c['category']]['copy'] = {}
def findDistricts():
	statereps = []
	for c in con:
		legs = congress.all_legislators_in_office(last_name=c['name'],state=c['state'])
		l = {}
		for leg in legs:
			
			state = str(leg['state'])
			district = str(leg['district'])
			district_id = state.lower() + '-' + district.zfill(2)
			categories[c['category']]['districts'].append(district_id)
			
			getBoundary(district_id, state)
			geo = {}
			geo['type']='Polygon'
			geo['coordinates'] = makeJsons(district_id)
			l['geometry'] = geo
			prop = {}
			prop['district'] = district_id
			prop['name'] = str(leg['first_name']) + ' ' + str(leg['last_name'])
			prop['phone'] = leg['phone']
			prop['twitter'] = leg['twitter_id']
			prop['website'] = leg['website']
			prop['contact_form'] = leg['contact_form']
			prop['term_end'] = leg['term_end']
			prop['term_start'] = leg['term_start']
			l['type'] = 'Feature'
			l['properties'] = prop
			try:
				party = leg['party']
			except KeyError: # In some cases, 'party' is missing
				party = None
		# categories.append(catTemp)
		statereps.append(l)
	return statereps

congressmen = findDistricts()


# Writeout districts.json
writeout = json.dumps(categories, sort_keys=True, separators=(',',':'))
f_out = open('districts.json', 'wb')
f_out.writelines(writeout)
f_out.close()

# Writeout each senator.json
for rep in congressmen:
	writeout = json.dumps(rep, sort_keys=True, separators=(',',':'))
	f_out = open('processed/%s.json' % rep['properties']['district'], 'wb')
	f_out.writelines(writeout)
	f_out.close()
