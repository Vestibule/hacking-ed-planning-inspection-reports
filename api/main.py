from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import requests

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HOSTNAME = "35.223.22.59"
PORT = "8881"
INDEX_NAME = "conanreport"

ILLEGAL_TOPIC_WORDS = {"drug","alcohol","breach","misbehaviour","attitud","poverty","robbery","steal","violence"}

@app.get("/search")
async def getTopicDocs(searchWord, topic, size):
    """Simple Elasticsearch Query"""

    topicShouldFilter=""

    if topic == "Illegal":
        for word in ILLEGAL_TOPIC_WORDS:
            topicShouldFilter = topicShouldFilter + """{ "match": {"report": \"""" + word + """\"}},"""
    topicShouldFilter = topicShouldFilter[:-1]

    esQuery = '''
                {
                  "from" : 0, "size" : ''' + size + ''',
                  "sort": [
                            {
                              "_score": {
                                "order": "desc"
                              }
                            }
                          ],
                  "query": {
                    "bool": {
                      "must": [
                        { "match": { "report": \"'''+ searchWord +'''\" } },
                        {"bool": {
                          "should": [
                            ''' + topicShouldFilter + '''
                          ]
                          }
                        }
                      ],
                      "must_not": [
                        { "match": { "report": "shoes" } }
                      ]
                    }
                  }
                }
            '''
    URI = "http://" + HOSTNAME + ":" + PORT + "/" + INDEX_NAME + "/_search"

    headerInfo = {'content-type': 'application/json'}
    response = requests.get(URI, data=esQuery, headers=headerInfo)

    results = json.loads(response.text)
    return results
