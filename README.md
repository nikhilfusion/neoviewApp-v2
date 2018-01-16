*************** Neoview *****************
App for streaming videos and show to the user

Setup: 

1. install node.js and npm

#sudo apt-get update
#sudo apt-get install build-essential
#sudo apt-get install nodejs
#sudo apt-get install npm

2. install bower
#npm install -g bower

3. create a file neoview.db, in the home folder for sqlite db

4.clone the app do the basic installation
$git clone git@github.com:nikhilfusion/neoviewApp-v2.git

$cd neoviewApp-v2
$npm install && bower install

5. To allow self signed https run
$export NODE_TLS_REJECT_UNAUTHORIZED=0


6.run the server by
$pm2 start server.js

open the app in browser: https://127.0.0.1:8080

**********************************************