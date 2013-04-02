## Duke Data API

Yang Su
yang.su@duke.edu

### Problem

As students in large academic institutions, we are often forced to use complex, unintuitive software interfaces to access information and data that are important to our daily lives on campus. Student created systems such as schedulator have demonstrated that students are capable of producing tools that are far superior in terms of speed and usability. While it's a significant undertaking to construct such a tool to compete with the likes of ACES, the most challenging part of such projects is often the data acquisition and aggregation process, not building the actual application. Data are often scattered across many data sources, hidden behind outdated infrastructure and web services, or in horrifically uniform formats. The result is that any student or team trying to access or extract data have to go through the headache of finding, accessing, and organizing the messy datasets. This is one of the main hindrances to innovations within the Duke community and information infrastructure. 

### Solution

Duke Data API attempts to unify data across many sources within the ecosystem under a single REST API, providing endpoints for accessing directory, maps/location, class/registration, events, and course evaluations data.

The project is consisted of three main components:

#### Data Collectors

The foundation of the project is the Data Collector. I have written automated scripts in Node.js and bash to collect data from various sources with the ability to pause and resume operations, as well as incremental updates. The collector has various parameters to allow for higher throughput using batch processing and many parallel processes. It also has simple reporting features to keep track of progress and give estimates on estimated time until completion. The data collected are saved in MongoDB collections with indices and relations between the data sources are then generated in post processing to enable speedy lookups and complex queries. Mongo was chosen for its flexibility.

#### API

The API layer is the core API service sitting on top of the collected data. It provides many REST API endpoints for accessing various kinds of data in JSON form. It has built in caching, throttling, and version control, as well as various format and queries parameters to allow for customization of data responses to fit any application's needs. The API also has interactive documentation that allows any user to try out the API and see sample responses.

#### Sample Applications

Sample frontend JavaScript applications to demonstrate the capabilities of the API infrastructure and its ease of use. 

### Technologies Used

* Node.js/NPM
* MongoDB
* Curl
* Git/GitHub

#### Libraries Used

* Lodash
* Backbone
* Async
* Mongoose
