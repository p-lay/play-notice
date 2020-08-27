FROM matthew5/arale

RUN apk update && npm install pm2 -g

WORKDIR /usr/src/play-notice

COPY node_modules node_modules
COPY dist dist
# COPY pm2.yaml pm2.yaml 
COPY pm2.config.js pm2.config.js
COPY package.json package.json
# COPY start.sh start.sh

# CMD ["sh", "-c", "pm2-runtime", "pm2.config.js"]

# docker build -t matthew5/play-notice .
# docker push matthew5/play-notice
# docker run -d -p 3400:3000 --name play-notice matthew5/play-notice