from ast import excepthandler
import concurrent.futures
from requests_html import HTMLSession
from bs4 import BeautifulSoup
import hashlib
import time


def request_or_wayback(url):
    session = HTMLSession()
    wayback_url = "http://web.archive.org/web/"
    try:
        response = session.get(url, timeout=5)
        if response.status_code !=200:
            response = session.get(wayback_url + url, timeout=5)
            if response.status_code != 200:
                raise Exception()
    except Exception as e:
        try:
            response = session.get(wayback_url + url, timeout=5)
        except:
            return None
    finally:
        session.close()
    return response

def get_title(soup):
    hits = []
    patterns = [{'name': 'title'}, {'name': 'meta', 'attrs': {'property': 'og:title'}}]
    for pattern in patterns:
        hit = soup.find(**pattern)
        if not hit:
            hits.append("")
        else:
            if pattern.get('attrs'):
                hits.append(hit.attrs.get('content', ''))
            else:
                hits.append(hit.text)
    hits = list(set(hits))
    return " ".join(hits)

def get_description(soup: BeautifulSoup) -> str:
    # Initialise output list
    hits = []

    # Collate list of all matches
    patterns = [{'name':lambda tag: tag.name.lower() == 'description'},
                {'name':'meta', 'attrs':{'name': 'description'}},
                {'name':'meta', 'attrs':{'property': 'description'}},
                {'name':'meta', 'attrs':{'property': 'og:description'}},
                {'name':'meta', 'attrs':{'name': 'description'}},
                {'name':'meta', 'attrs':{'name': 'og:description'}}]

    for pattern in patterns:
        hit = soup.find(**pattern)
        if not hit:
            hits.append("")
        else:
            if pattern.get('attrs'):
                hits.append(hit.attrs.get('content', ""))
            else:
                hits.append(hit.text)
    # Deduplicate
    hits = list(set(hits))
    return " ".join(hits)

def get_locale(soup: BeautifulSoup) -> list:
    location = soup.find(**{'name':'meta', 'attrs':{'property': 'og:locale'}})
    if location:
        return location.attrs.get('content')

def get_keywords(soup: BeautifulSoup) -> list:
    # Initialise output list
    hits = []
    # Collate list of all matches
    patterns = [{'name':'meta', 'attrs':{'property': 'keywords'}},
    {'name':'meta', 'attrs':{'name': 'keywords'}}]

    for pattern in patterns:
        hit = soup.find(**pattern)
        if not hit:
            hits.append("")
        else:
            hits.append(hit.attrs.get('content'))
        return " ".join(hits)

    # Deduplicate
    hits = list(set(hits))
    return " ".join(hits)

def get_twitter_handle(soup: BeautifulSoup) -> list:
    handles = soup.find(**{'name':'meta', 'attrs':{'name': 'twitter:site'}})
    if handles:
        return handles.attrs.get('content')

def get_publisher(soup: BeautifulSoup) -> list:
    pubs = soup.find(**{'name':'meta', 'attrs':{'property': 'article:publisher'}})
    if pubs:
        return pubs.attrs.get('content')

def get_full_text(response) -> str:
    soup = BeautifulSoup(response.text)
    paragraphs = [p.text for p in soup.find_all('p')]
    if paragraphs:
        text = " ".join(paragraphs)
    else:
        text = ""
    return text

def get_meta_data(response):
    soup = BeautifulSoup(response.text)
    title = get_title(soup)
    description = get_description(soup)
    locale = get_locale(soup)
    keywords = get_keywords(soup)
    twitter_handle = get_twitter_handle(soup)
    publisher = get_publisher(soup)
    return {'title': title, 'description': description, 
            'locale': locale, 'keywords': keywords, 
            'twitter_handle': twitter_handle, 'publisher': publisher}

def fetch_urls(url_dict, index_pattern):
    parsed_urls = []
    response = request_or_wayback(url_dict.get('DOMAIN_URL'))
    base_url_meta = get_meta_data(response)
    time.sleep(30)
    for url in url_dict.get('URLS'):
        response = request_or_wayback(url)
        article_text = get_full_text(response)
        parsed_urls.append({
            '_op_type': 'update',
            '_index': index_pattern,
            '_id': hashlib.md5(url.encode('utf-8')).hexdigest(),
            'doc': {
                'scrape': {
                        'url': url,
                        'fetched_from': response.url,
                        'base_url': {'url': url_dict.get('DOMAIN_URL'), **base_url_meta},
                        'article_text': article_text
                }
            }
        })
        time.sleep(30)
    return parsed_urls