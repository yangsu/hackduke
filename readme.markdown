## OpenWorld

## CampusConnect
Basic OAuth 2.0 API for accessing personal Duke & UNC Student data from ACES with their permission

### How to use:

1. Download and install Node.js & MongoDB

2. Navigate to correct directory:
```bash
$ cd campusconnect
```

3. Install dependencies:
```bash
$ npm install
```

4. Start the server
```bash
$ node app.js
```

5. Visit localhost:8081 in your browser


## CC-Client
A sample client application to CampusConnect

### How to use:

1. Install dependencies for cc-client

2. In one terminal start cc-client server
```bash
$ npm cc-client/app.js
```

3. In another terminal start campusconnect server
```bash
$ npm campusconnect/app.js
```

4. Use the following URL as redirect from client app to CampusConnect API
```
http://localhost:8081/oauth/authorize?client_id=2f18b05f9da2c9c32c8b32cc1e1c6717&perms=transcript&uni=duke&redirect_uri=http://localhost:3000/oauthcall
```

5. Look at localhost:8081/documentation for an indepth look at implementing clients for CampusConnect

## Scrapers
Complete course scraper for Duke University & Authenticated scrapers for ACES

### How to use Authenticated Scapers:

Note: Both Duke & UNC Scrapers are functional (UPenn a work in progress)

1. Install Gem dependencies (mechanize & nokogiri)
```bash
$ bundle install
```

2. On terminal, run following command 
```bash
$ ruby mechanize.rb netid password transcript,advanced_info,basic_info,schedule
```

It will return the data in JSON format

### How to use Aces Course Scapers:

TODO

## Sample Apps
  A visual search app built for an earlier version of Duke's course data

Install [Yeoman](http://yeoman.io/installation.html)
```bash
curl -L get.yeoman.io | bash
```

run server
```bash
yeoman server
```