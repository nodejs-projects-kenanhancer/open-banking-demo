# open-banking-demo
Open Banking Demo Project

I use NatWest Open Banking API sandbox environment, so you need to register and use your own sandbox environment.

## Register NatWest Open Banking API developer portal

Register from https://developer.sandbox.natwest.com

### NatWest Open Banking API developer portal Register page
![](/assets/image1.png)

### NatWest Open Banking API developer portal API Catalog
In order to see any API details in API Catalogue, click `Getting started` link in API card.
![](/assets/image2.png)

### NatWest Open Banking Account & Transaction API
Click `Getting started` link in `Account & Transaction API` in API Catalogue, and follow steps in screenshot :)
![](/assets/image3.png)

### NatWest Open Banking API developer portal Dashboard page
Follow steps in screenshot :) when you click `demo-team-....` team in Dashboard page, you can find `Applications`, `Test Data` and `Activity` sections, so, you can manage your applications in this page.
![](/assets/image4.png)

## .env

Create `.env` file in root folder and get the following environment variables from NatWest Open Banking Developer Portal, or just download Postman environment json file and find all variables there.

```shell
WELL_KNOW_ENDPOINT=
API_URL_PREFIX=
CLIENT_ID=
CLIENT_SECRET=
PSU_USER_NAME=
REDIRECT_URL=
```

## Build
```shell
npm run build
```

## Run
```shell
npm start
```

## Output
![](/assets/image5.png)