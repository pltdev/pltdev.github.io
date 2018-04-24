# pltdev.github.io
## Plantronics realtime api workshop
Lewis Collins, 24th April 2018
This workshop consists of a sample code that can be exercised with Plantronics Hub and Plantronics realtime and REST APIs.
It allows you to experience a variety of interactions with your headset and learn how to receive realtime data from PubNub and load offline PMP data from REST API.
### Instructions for use
1. Install Hub latest from http://www.plantronics.com/software, when install is complete do not launch yet.
2. First download the sandbox config file from here: https://www.dropbox.com/sh/lji1ianhogammuj/AAAHf-wqNeI-NQzIcrSnAXLfa?dl=0 
3. Rename this file from Spokes.config.sandbox to *Spokes.Config*, and place it here: C:\ProgramData\Plantronics\Spokes3G
4. Now launch Hub
5. Confirm Hub is attached to sandbox tenant under: Hub > Help > Support > Troubleshooting Assistance > Last attempt. It should report Success.
6. Now navigate to the workshop code live demo: https://pltdev.github.io/realtime%20api%20workshop/ (Note: you can visit this on a different device to your PC running Hub and UC client.
7. Connect your Plantronics headset
8. Start performing calls with your UC client.
9. Select your device in the Device ID filter: field. Note: all other sandbox users sending messages will get added here. By filtering for yours you can just focus on the events from your device.
10. Exercise UC client calls, QD Quickdisconnect, Mute and finally crosstalk (try talking over the remote party)
