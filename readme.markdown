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



## Scrapers
 Complete course scraper for Duke University & Authenticated scrapers for ACES

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