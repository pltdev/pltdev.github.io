# pltdev.github.io
## Plantronics Live Demos Page
This GitHub repo contains the code for some Plantronics Integration demos.
It is hosted on GitHub Pages to so in order to try out the demos just visit: https://pltdev.github.io/
### List of demos
1. Plantronics JavaScript Sample (using https REST API)
2. Plantronics Amazon Connect

See below for getting started guides.
### Getting Started with Plantronics JavaScript Sample (using https REST API)
This demo illustrates how a web-based application (e.g. WebRTC client or collaboration app) can connect to Plantronics REST API in order to implement headset call control.
### Getting Started with Plantronics Amazon Connect integration demo
This demo illustrates how to integrate Plantronics Amazon Connect Contact Control Panel (CCP) with the Plantronics REST API in order to implement headset call control for Amazon Connect.
The 4 files that comprise it are:
1. Plantronics Amazon Connect.html
2. amazon-connect-v1.2.0.js
3. spokes.js
4. util.js
#### Steps to deploy this demo:
1. You need to host your copy of these files on your own secure web server (https) on the Internet, e.g. https://your-domain/Plantronics%20Amazon%20Connect.html, and have https://your-domain whitelisted in your Amazon Connect instance, in order to allow the page to embed your CCP (Contact Control Panel). For more info see the “Getting Started, Whitelisting” section of: https://github.com/aws/amazon-connect-streams/blob/master/Documentation.md 
2. In the file "Plantronics Amazon Connect.html" you need to change the **ccpUrl** value to your own Amazon Connect instance (for example https://your-amazon-connect-domain/connect/ccp#/ Note: the Amazon Connect domain will be the same as the domain in the URL you use to administrate your Amazon Connect instance.
3. Load the solution in your web browser, e.g. visit https://your-domain/Plantronics%20Amazon%20Connect.html
#### Troubleshooting
* If your CCP (Contact Control Panel) fails to embed but opens in a seperate Tab, try closing the Tab and reloading the page "https://your-domain/Plantronics%20Amazon%20Connect.html". 
* If it continues to fail to embed you can try logging into CCP one time within seperate Tab, then closing the Tab and reloading page "https://your-domain/Plantronics%20Amazon%20Connect.html".
* If it still continues to fail to open the browser developer tools / inspect element and open go to the Console, then reload the page "https://your-domain/Plantronics%20Amazon%20Connect.html" and look for errors.
