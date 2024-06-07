# Verwende das offizielle Node.js-Image als Basis
FROM node:14

# Erstelle und wechsle in das Arbeitsverzeichnis
WORKDIR /usr/src/app

# Kopiere package.json und package-lock.json in das Arbeitsverzeichnis
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den Rest der Anwendung in das Arbeitsverzeichnis
COPY . .

# Exponiere den Port, auf dem die Anwendung läuft
EXPOSE 7383

# Starte die Anwendung
CMD [ "node", "webserver.js" ]
