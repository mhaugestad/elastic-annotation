meltwater_mapping = {
                        "mappings": {
                            "properties": {
                            "Date":   {"type": "date", "format": "dd-MMM-yyyy hh:mma"},
                            "Headline": {"type": "text"},
                            "URL": {"type": "keyword"},
                            "OpeningText": {"type":"text"},
                            "HitSentence": {"type": "text"},
                            "Source": {
                                "type": "text",
                                    "fields": {
                                        "keyword": {
                                        "type": "keyword",
                                            "ignore_above": 256
                                                    }
                                                }
                                                },

                            "Influencer": {
                                    "type": "text",
                                    "fields": {
                                        "keyword": {
                                        "type": "keyword",
                                        "ignore_above": 256
                                        }
                                    }
                                    },
                            "Country": {
                                    "type": "text",
                                    "fields": {
                                        "keyword": {
                                        "type": "keyword",
                                        "ignore_above": 256
                                        }
                                    }
                                    },
                            "Subregion": {"type":"keyword"},
                            "Language": {"type":"keyword"},
                            "Reach": {"type": "integer"},
                            "DesktopReach": {"type": "integer"},
                            "MobileReach": {"type":"integer"},
                            "TwitterSocialEcho": {"type":"integer"},
                            "FacebookSocialEcho":{"type":"integer"},
                            "RedditSocialEcho": {"type":"integer"},
                            "NationalViewership": {"type":"integer"},
                            "Engagement": {"type":"integer"},
                            "AVE": {"type":"float"},
                            "Sentiment": {
                                    "type": "text",
                                    "fields": {
                                        "keyword": {
                                        "type": "keyword",
                                        "ignore_above": 256
                                        }
                                    }
                                    },
                            "KeyPhrases":{
                                    "type": "text",
                                    "fields": {
                                        "keyword": {
                                        "type": "keyword",
                                        "ignore_above": 256
                                        }
                                    }
                                    },
                            "InputName": {"type":"keyword"},
                            "Keywords": {
                                    "type": "text",
                                    "fields": {
                                        "keyword": {
                                        "type": "keyword",
                                        "ignore_above": 256
                                        }
                                    }
                                    },
                            "TwitterAuthority": {"type":"integer"},
                            "TweetId": {"type":"keyword"},
                            "TwitterId": {"type":"keyword"},
                            "TwitterClient": {"type":"keyword"},
                            "TwitterScreenName": {
                                        "type": "text",
                                        "fields": {
                                            "keyword": {
                                            "type": "keyword",
                                            "ignore_above": 256
                                            }
                                        }
                                        },
                            "UserProfileUrl": {"type":"keyword"},
                            "TwitterBio": {"type":"text"},
                            "TwitterFollowers": {"type":"integer"},
                            "TwitterFollowing": {"type":"integer"},
                            "AlternateDateFormat": {"type":"date", "format": "MMM d, yyyy"},
                            "Time": {"type": "date", "format": "h:mm a"},
                            "State": {"type":"keyword"},
                            "City": {"type":"keyword"},
                            "DocumentTags": {"type":"keyword"},
                            "document_embeddings": {"type": "dense_vector", "dims": 300},
                            }
                        }
                    }