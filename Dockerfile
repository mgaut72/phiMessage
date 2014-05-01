FROM    mgaut72/python-base

ADD     . /data/phiMessage
RUN     cd /data/phiMessage && pip install -e .

WORKDIR /data/phiMessage
EXPOSE  5000
CMD     cd /data/phiMessage && python phi_server/server.py
