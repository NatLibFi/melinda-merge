FROM node:8
WORKDIR app
ENV ARCHIVE_PATH /data
CMD ["node", "index.js"]

RUN chown -R node:node /app
RUN mkdir /data
RUN chown node:node /data

USER node

ADD --chown=node build .
ADD --chown=node package.json  .

RUN npm install --production
