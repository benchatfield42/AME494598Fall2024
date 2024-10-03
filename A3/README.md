# How to Send Data to AWS

Step 1:
Go to AWS Academy and start the Sandbox environment

Step 2: 
Launch a EC2 instance and make it an Ubuntu machine with around 28 GiB of storage and you can launch without a key pair

Step 3:
Navigate to the security tab and open a custom TCP on port 8080 for all IPv4

Step 4:
Connect to your instance and use the following commands to get it ready to host an HTTP server
`Sudo apt-get update`
`Sudo apt-get install node.js npm`
`Sudo npm install -g http-server`

Step 4:
Clone the class repository with the command `git clone https://github.com/tejaswigowda/ame494598Fall2024.git` and cd into the directory `ame494598Fall2024/watchSensors/captureDataServer-TempHum/` 

Step 5:
I had to install method-overide, express, mongoskin and errorhandler, before I could run the server using the command `node server.js`. Note I also ran `npm audit fix --force` to fix 4 vulnerabilities in mongoskin, but these verions didn't work and I had to go back

Step 6:
In `DHT11Default.ino` change the Wifi ID and password to your router and change the server to your AWS public IP with /sendData and then flash the T-Watch 

Step 7:
Now you should be able to see the data being sent in your AWS server!
