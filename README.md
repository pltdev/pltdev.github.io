# pltdev.github.io
## Plantronics Live Demos Page
This GitHub repo contains the code for some Plantronics Integration demos.
It is hosted on GitHub Pages to so in order to try out the demos just visit: https://pltdev.github.io/
### List of demos
1. Plantronics JavaScript Sample (using https REST API)

See below for getting started guides.
### Getting Started with Plantronics JavaScript Sample (using https REST API)
This demo illustrates how a web-based application (e.g. WebRTC client or collaboration app) can connect to Plantronics REST API in order to implement headset call control.
#### The 3 files that comprise it are:
1. Plantronics JavaScript Sample.html
2. spokes.js
3. util.js
#### Screenshot
Here is a screenshot of the JavaScript demo in action
![Here is a screenshot of the JavaScript demo in action](https://pltdev.github.io/Plantronics%20JavaScript%20Sample.png "Here is a screenshot of the JavaScript demo in action")
#### List of pre-requisites
* Install Plantronics Hub from: www.plantronics.com/software
* Note Firefox users: If you get "Error connecting to Plantronics Hub." then visit this URL: https://127.0.0.1:32018/Spokes/DeviceServices/Info and click Advanced > Add Exception... to add a security exception to allow the connection.
#### List of features included with this demo
* Example web-based JavaScript application that connects to Plantronics REST API (client-based API)
* Call control integration with: ring/incoming call, outgoing call, answer call (answer incoming call), hold/resume call, mute/unmute call, end call
* Wireless audio link established when on call (required for Plantronics legacy products)
#### Steps to deploy this demo:
1. Download the files from this repo then open Plantronics JavaScript Sample.html in the browser of your choice. 
#### Troubleshooting
* If it fails to connect to the REST API, ensure you have met the pre-requisites listed above. If it still continues to fail to open the browser developer tools / inspect element and open go to the Console, then reload the page "Plantronics JavaScript Sample.html" and look for errors in the Console.