
match_all = {
    "query": {
        "match_all": {}
        }
    }

all_urls = {
  "query": {
    "bool" : {
      "must_not" : {
        "term" : {
          "Source.keyword" : "Twitter"
        }
      }
    }
  },
  "_source": [
    "URL",
  ]
}