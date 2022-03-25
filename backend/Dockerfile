FROM rayproject/ray:1.10.0-py38
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt 
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
RUN python -m spacy download en_core_web_md
COPY ./app /code/app
EXPOSE 8888