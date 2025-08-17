from flask import Flask
from flask import request
from flask import jsonify
from flask import render_template, url_for
import requests

app = Flask(__name__)

token = None

@app.route('/')
def index():
     return app.send_static_file('index.html')

def authenticate():
        url = 'https://api.artsy.net/api/tokens/xapp_token'
        data = {
            app.config['ARTSY_CLIENT_ID'] = os.getenv('ARTSY_CLIENT_ID')
            app.config['ARTSY_CLIENT_SECRET'] = os.getenv('ARTSY_CLIENT_SECRET')
        }
        headers = {'Content-Type': 'application/json'}
    
        response = requests.post(url, json=data, headers=headers)

        #token1 = requests.request("POST", url, headers=headers, json = data)

        if response.status_code == 201:
            token = response.json()['token']
            #response_object = response.json()
            #print(token)
            return response.json()
        else:
            return 'Cannot fetch!',response.status_code


@app.route('/search', methods = ["GET"])
def artist_search():
    response_object = authenticate()
    query = request.args.get('q', '')
    if not query:
        return jsonify([])
    url = 'https://api.artsy.net/api/search'
    data = {
         'q' : query,
         'size' : 10,
         'type' : 'artist'
    }
    headers = {'X-API-Key' : response_object['token'],
               'Content-Type': 'application/json'
              }

    response = requests.get(url, params=data, headers=headers)
    #print(response.status_code)

    artist_detail = response.json()
    artist_mapping = []
    
    for artist in artist_detail["_embedded"]["results"]:
         #print(f"href_links : {artist["_links"]["self"]["href"]}")
         artist_id = artist["_links"]["self"]["href"]
         artist_name = artist["title"]
         artist_image = artist["_links"]["thumbnail"]["href"]
         artist_id = artist_id.split("/")[-1]
         artist_mapping.append ({
              'name' : artist_name,
              'id' : artist_id,
              'image' : artist_image
         })

    artist_id = []
    artist_id = [artist['id'].split("/")[-1] for artist in artist_mapping]
    
    #print(artist_mapping)
    #print('\n')
    #print('-----------------------------------------------------------------------')
    #print(artist_id)

    return jsonify(artist_mapping)

@app.route('/artists/', methods = ['POST','GET'])
def artist_detail():
    data = request.get_json()
    artist_id = data.get('artist_id')
    response_object = authenticate()
    url = f'https://api.artsy.net/api/artists/{artist_id}'
    headers = {'X-API-Key' : response_object['token'],
               'Content-Type': 'application/json'
              }
    response = requests.get(url, headers=headers)

    artist_article = response.json()

    artist_detail = {
        'name' : artist_article.get('name'),
        'nationality' : artist_article.get('nationality'),
        'birthday' : artist_article.get('birthday'),
        'deathday' : artist_article.get('deathday'),
        'biography' : artist_article.get('biography')
    }

    return jsonify(artist_detail)

if __name__ == '__main__':
    app.run(debug=True,port=5000)


