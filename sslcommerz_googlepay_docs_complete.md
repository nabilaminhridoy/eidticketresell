
# SSLCommerz Google Pay™ Integration - Complete Technical Documentation
Source: https://developer.sslcommerz.com/doc/v4/google-pay-integration.html

---

## 1. Overview

**Google Pay™ is available on SSLCommerz at no additional cost.**

It allows your customers to make payments using the debit or credit cards saved in their Google Account. By using Google Pay, customers enjoy a simpler, faster, and more secure checkout experience, whether they are purchasing from a mobile device or the web.

---

## 2. How it Works

When a customer chooses Google Pay at checkout, they will see a list of their saved cards. They can then select a card and complete the payment using the chosen card.

---

## 3. Google Pay™ Enablement

**For Hosted Checkout:**
To enable Google Pay for your store, please contact our Operations team at operation@sslwireless.com. Once enabled, the Google Pay button will appear under the card section of the SSLCommerz checkout page.

**For Customer Checkout:**
If you want to integrate Google Pay on your checkout page, the necessary Google Pay data required to load the Google Pay button and process payments will be available from the APIs provided in the response of the initiate transaction API of the Integration Guide section.

---

## 4. Enable Google Pay and Wallet Console

To get the Google Pay button working on your website or Android App, you need to follow a few simple steps:

### Step 1: Enable the Google Pay and Wallet Console
First, you must enable this feature to activate the Google Pay Button from: https://pay.google.com/business/console

### Step 2: Share Your Google Merchant ID
Provide your Google Merchant ID to our Operations Team. They'll use it to configure the button for you, and you'll receive it in the initiateTransaction API response.

### Step 3: Allow Google Pay to Load for Android app or Website
Allow your Android app or website to load Google Pay, otherwise Google Pay will show an error pop-up.

**Important:**
All merchants must adhere to the Google Pay APIs Acceptable Use Policy (https://payments.developers.google.com/terms/aup) and accept the terms that the Google Pay API Terms of Service (https://payments.developers.google.com/terms/sellertos) defines.

---

## 5. Integration Guide

Easily add Google Pay to your checkout flow using the Merchant Hosted Payment API from SSLCommerz. This guide walks you through the integration in **4 steps** (3 main integration steps + 1 prerequisite data step).

### Quick Start

1. **Receive Google Pay Data** → Get GPay config data from SSLCommerz API (prerequisite)
2. **Render the Google Pay Button** → Render on your frontend with SSLCommerz GPay API data
3. **Initiate a Transaction from your backend** → Send the required data to SSLCommerz API
4. **Process the Token by sending it back to SSLCommerz** → Receive payment result via redirect + IPN

### Architecture Flow (Process Overview)

Here's how the complete Google Pay integration process works from start to finish:

**Step 1 - Load Google Pay Button:**
Request and receive Google Pay (GPay) data from the SSLCommerz GPay API if your store is enabled for GPay. The GPay API has a **daily limit of three requests**. Cache the GPay data for recurrent use and refresh it as needed, up to the daily limit. The Merchant Site uses the Google Pay JS SDK to load the Google Pay button using the GPay data received.
- ⚠️ Daily Limit: 3 requests
- ⚠️ Cache Required

**Step 2 - Customer selects Google Pay:**
On the Merchant Site, the customer clicks on Pay with Google Pay.

**Step 3 - GPay Provides Payment Token:**
The Customer selects a saved card in Google Pay. The Google Pay JS returns a Google Pay token to the Merchant Site.

**Step 4 - Initiate Transaction API:**
The Merchant Site calls the Hosted API to initiate the transaction. Request includes merchant credentials, order details, and customer information. A response is sent back with Google Pay data if it's enabled for your store. The Google Pay data provides:
- Session Key
- Token Submit URL (actionurl)

**Step 5 - Submit Google Pay Token for Processing:**
The Merchant Site sends the Google Pay token + Session Key to the Hosted API. The API response indicates either SUCCESS or FAIL. Upon a successful request, the API returns a redirection URL. An unsuccessful attempt results in a FAILED status.
- Possible outcomes: SUCCESS / FAIL

**Step 6 - Redirect Customer to Transaction Redirection URL:**
Customer is either redirected to 3DS OTP page for completing Payment, or for direct payment processing if 3DS not required for Authentication.
- 3DS OTP (if 3DS required)
- Direct Processing (if 3DS not required)

**Step 7 - Final Redirection:**
Once the payment is processed, the Customer is redirected back to the Merchant Site via:
- Success URL
- Fail URL
- Cancel URL

**Important Note:**
Finally, an **IPN (Instant Payment Notification)** will be sent for server-to-server notification after a successful transaction to ensure reliability. To ensure reliability, always set `ipn_url` during the initiate transaction API. SSLCommerz will POST transaction status to this endpoint. This helps to reconcile backend transactions even if the user closes the browser.

---

## 6. Step 1: Receive Google Pay Data (googlepayConfig)

### Endpoint:
```
POST https://<base-url>.com/api/v1/merchant-hosted-payment
```

> **Note:** `<base-url>` is a placeholder. For Sandbox: `sandboxbox.sslcommerz.com`, For Live: `sslcommerz.com` (standard SSLCommerz base URLs)

### Request Parameters:

| Parameter Name | Data Type | Required | Description |
|---|---|---|---|
| action | String | Yes | Action name: `googlepayConfig` |
| store_id | String (30) | Yes | Your SSLCOMMERZ Store ID - integration credential collected through SSLCommerz managers |
| store_passwd | String (30) | Yes | Your SSLCOMMERZ Store Password - integration credential collected through SSLCommerz managers |

### Response Parameters:

| Parameter Name | Type | Description |
|---|---|---|
| APIConnect | String | Status of API Connection. Example: Success/INVALID_REQUEST |
| status_code | Numeric | HTTP code of response |
| status_sub_code | Numeric | Sub HTTP code of response |
| failed_reason | Json | Describes reason for failing |
| data | Json | Response data containing GPay configuration |

### Example Request:
```json
{
  "action": "googlepayConfig",
  "store_id": "demotest",
  "store_passwd": "qwerty"
}
```

### Example Response:
```json
{
  "APIConnect": "SUCCESS",
  "status_code": 200,
  "data": {
    "apiVersion": "2",
    "apiVersionMinor": "0",
    "gatewayMerchantId": "googletest2",
    "gateway": "sslcommerz",
    "merchantId": "01234567890123456789",
    "merchantName": "Example Merchant",
    "allowedAuthMethods": "PAN_ONLY,CRYPTOGRAM_3DS",
    "allowedCardNetworks": "MASTERCARD,VISA"
  }
}
```

---

## 7. Step 2: Render Google Pay Button

### Add the Google Pay JS:
```html
<script async src="https://pay.google.com/gp/p/js/pay.js"></script>
<div id="container"></div>
```

### Configuration Instructions:

Once you have received the Google Pay parameters in the Google Pay config API response in Step 1, you must configure the Google Pay JS script with those values.

#### Required Parameters (from googlepayConfig response):
- `gateway`
- `gatewayMerchantId`
- `merchantId`
- `merchantName`

#### Authentication Methods:
- `"PAN_ONLY"` → Enables 3D Secure (3DS) transactions. Customers will need to enter an OTP to authenticate.
- `"CRYPTOGRAM_3DS"` → Used for Tap & Pay feature.

#### Supported Card Networks:
Currently, the following card networks are supported for Google Pay via SSLCommerz:
- `"MASTERCARD"`
- `"VISA"`

### Example JavaScript Configuration:
```javascript
function onGooglePayLoaded() {
  const paymentsClient = new google.payments.api.PaymentsClient({ 
    environment: 'TEST' 
  });

  const paymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [{
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        allowedCardNetworks: ["MASTERCARD", "VISA"]
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: <set-gateway>,              // from API response (value: "sslcommerz")
          gatewayMerchantId: <set-gatewayMerchantId>  // from API response
        }
      }
    }],
    merchantInfo: {
      merchantId: <set-merchantId>,            // from API response
      merchantName: <set-merchantName>          // from API response
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: '100.00',
      currencyCode: 'BDT',
      countryCode: 'BD'
    }
  };

  const button = paymentsClient.createButton({
    onClick: () => {
      paymentsClient.loadPaymentData(paymentDataRequest)
      .then(paymentData => {
        // send token to Step 4 for processing
        token = paymentData.paymentMethodData.tokenizationData.token;
      });
    }
  });

  document.getElementById('container').appendChild(button);
}
```

With this setup, the Google Pay button will appear on your checkout page and return a payment token once the customer selects a card.

---

## 8. Step 3: Initiate Transaction (initiateTransaction)

### Endpoint:
```
POST https://<base-url>.com/api/v1/merchant-hosted-payment
```

> **Note:** Same endpoint as Step 1. For Sandbox: `https://sandboxbox.sslcommerz.com/api/v1/merchant-hosted-payment`, For Live: `https://sslcommerz.com/api/v1/merchant-hosted-payment`

### Request Parameters:

| Parameter Name | Data Type | Required | Description |
|---|---|---|---|
| action | String | Yes | Action name: `initiateTransaction` |
| store_id | String (30) | Yes | Your SSLCOMMERZ Store ID |
| store_passwd | String (30) | Yes | Your SSLCOMMERZ Store Password |
| user_refer | String (256) (Encrypted Format) | Conditional | **Required if `enable_cus_googlepay` parameter is not set to 1**. Minimum Length: 20 characters. All tokens of the card will be generated against this user_refer. Each user_refer id represents an individual user of your system. Same user must always provide the same user_refer. The value must be in encrypted format using AES-256-CBC. SSLCOMMERZ provides Salt Key for encryption. **Sandbox Salt Key:** `"F5d66a527ff181486321bf7c3s7f54de"` | **Live:** Salt key will be provided separately. user_refer contains JSON format data with two parameters (see below). |
| user_refer (inner param) | user_refer | String (50) | Yes | User reference id for tokenize. Minimum length is 20. |
| user_refer (inner param) | user_mobile | String (11) | Yes | User reference mobile. Must be 11 digits and Bangladeshi mobile number. |
| total_amount | Decimal (10,2) | Yes | The amount to process. Example: 55.40. Range: 10.00 BDT to 500000.00 BDT |
| currency | String (3) | Yes | Currency type. 3 characters. Example: BDT, USD, EUR, SGD, INR, MYR etc. Non-BDT currencies will be converted to BDT based on current rates. |
| tran_id | String (30) | Yes | Unique transaction ID to identify your order in both your end and SSLCOMMERZ |
| success_url | String (255) | Yes | Callback URL where user redirects after successful payment |
| fail_url | String (255) | Yes | Callback URL where user redirects after payment failure |
| cancel_url | String (255) | Yes | Callback URL where user redirects if transaction cancelled |
| ipn_url | String (255) | No | **Important!** Better to use to avoid missing payment notification. Instant Payment Notification URL where SSLCOMMERZ sends transaction status server-to-server. Customer session will not work. Critical for updating backend when transactions are pending or customer session is lost. |
| cus_name | String (50) | Yes | Customer name for payment receipt email |
| cus_email | String (50) | Yes | Valid email address of customer for payment receipt |
| cus_add1 | String (50) | Yes | Customer address line 1 |
| cus_add2 | String (50) | No | Customer address line 2 |
| cus_city | String (50) | Yes | Customer city |
| cus_postcode | String (30) | Yes | Customer postcode |
| cus_country | String (50) | Yes | Customer country |
| cus_phone | String (50) | Yes | Customer phone/mobile number |
| cus_state | String (20) | No | Customer state |
| cus_fax | String (20) | No | Customer fax number |
| shipping_method | String (50) | Yes | Shipping method. Example: YES / NO / Courier |
| num_of_item | Integer (1) | No | Number of products to be shipped |
| ship_name | String (50) | Conditional | Mandatory if shipping_method is YES - Shipping name |
| ship_add1 | String (50) | Conditional | Mandatory if shipping_method is YES - Shipping address |
| ship_add2 | String (50) | No | Additional shipping address |
| ship_city | String (50) | Conditional | Mandatory if shipping_method is YES - Shipping city |
| ship_state | String (50) | No | Shipping state |
| ship_postcode | String (50) | Conditional | Mandatory if shipping_method is YES - Shipping postcode |
| ship_country | String (50) | Conditional | Mandatory if shipping_method is YES - Shipping country |
| product_name | String (255) | Yes | Product name(s), comma separated. Example: Computer,Speaker |
| product_category | String (100) | Yes | Product category. Example: Electronic, topup, bus ticket, air ticket |
| product_profile | String (100) | Yes | Goods vertical. Necessary for online transactions to avoid chargeback. Allowed values: `general`, `physical-goods`, `non-physical-goods`, `airline-tickets`, `travel-vertical`, `telecom-vertical` |
| product_type | String (30) | Conditional | Mandatory if product_profile is `telecom-vertical`. Example: Prepaid or Postpaid |
| topup_number | String (150) | Conditional | Mandatory if product_profile is `telecom-vertical`. Mobile number to be recharged. Example: 8801700000000 or comma-separated for multiple |
| country_topup | String (30) | Conditional | Mandatory if product_profile is `telecom-vertical`. Country where service is given. Example: Bangladesh |
| cart | Json | No | JSON data with product (max 255 chars), quantity (numeric), amount (Decimal 12,2) |
| product_amount | Decimal (10,2) | No | Product price for merchant panel reconciliation |
| vat | Decimal (10,2) | No | VAT included in product price |
| discount_amount | Decimal (10,2) | No | Discount on invoice |
| convenience_fee | Decimal (10,2) | No | Convenience fee on invoice |
| value_a | String (255) | No | Extra metadata parameter |
| value_b | String (255) | No | Extra metadata parameter |
| value_c | String (255) | No | Extra metadata parameter |
| value_d | String (255) | No | Extra metadata parameter |
| disallowed_bin | String | No | Comma-separated BIN numbers to disallow. Example: 525680,534273,530505 |
| disallowed_bin_msg | String | No | Message for disallowed BIN |
| allowed_bin | String (255) | No | **Do not Use!** Comma-separated BIN numbers to allow only |
| allowed_bin_msg | String | No | Message for allowed BIN |
| enable_cus_googlepay | Boolean | No | If you want to show the Google Pay button during customer checkout, set value to `1`. Also makes `user_refer` param optional. |

### user_refer JSON format (before encryption):
```json
{"user_refer":"ABCDEFGHIJ1234567890","user_mobile":"01XXXXXXXXX"}
```

### cart JSON format:
```json
[
  {"product":"DHK TO BRS AC A1","quantity":"1","amount":"200.00"},
  {"product":"DHK TO BRS AC A2","quantity":"1","amount":"200.00"},
  {"product":"DHK TO BRS AC A3","quantity":"1","amount":"200.00"},
  {"product":"DHK TO BRS AC A4","quantity":"2","amount":"200.00"}
]
```

### Response Parameters:

| Parameter Name | Type | Description |
|---|---|---|
| APIConnect | String | Status of API Connection. Example: Success/INVALID_REQUEST |
| status_code | Numeric | HTTP code of response |
| status_sub_code | Numeric | Sub HTTP code of response |
| failed_reason | Json | Describes reason for failing |
| data | Json | Response data containing sessionkey, redirectGatewayURL, and googlepay object |

### Example Request:
```json
{
  "action": "initiateTransaction",
  "store_id": "demotest",
  "store_passwd": "qwerty",
  "user_refer": "Ju+OrMEn9UUMb3goE/AVqHx8fEZhUjBSazFaejdQRjFIRlp2RGgzaCtvbFgrQ0kyejh0YWZxeXlkMHROZ2c2OTFSSkVjNHFnQVRGd2tPSkZib0E4elZSTXdraGxYem53bFh2YThxTCtaUVBQbDVsRmdaV2kzZGdveENsNkY4PQ==",
  "total_amount": "10",
  "currency": "BDT",
  "tran_id": "8r09q73x496T823OI49",
  "success_url": "https://sslcommerz.com",
  "fail_url": "https://sslcommerz.com",
  "cancel_url": "https://sslcommerz.com",
  "ipn_url": "https://sslcommerz.com",
  "cus_name": "Rana Poddar",
  "cus_email": "ran@poddar.com",
  "cus_add1": "27/A",
  "cus_city": "Dhaka",
  "cus_postcode": "1000",
  "cus_country": "Bangladesh",
  "cus_phone": "01912345678",
  "product_name": "Recharge",
  "product_profile": "non-physical-goods",
  "enable_cus_googlepay": 1
}
```

### Example Response:
```json
{
  "APIConnect": "SUCCESS",
  "status_code": 200,
  "data": {
    "sessionkey": "CA5B772D7E3553CB5B08A78068FF9E68",
    "redirectGatewayURL": "https://dev-epay-gw.sslcommerz.com/e02533...",
    "googlepay": {
      "totalPrice": "100.00",
      "currencyCode": "BDT",
      "countryCode": "BD",
      "session_key": "yw7yeoy39y293c236446612232343434",
      "actionurl": "https://epay.sslcommerz.com/yw7yeoy39y293c23..."
    }
  }
}
```

**Key response fields for Google Pay:**
- `data.googlepay.session_key` → Used in Step 4 as `session_key`
- `data.googlepay.actionurl` → Used in Step 4 as the POST endpoint URL
- `data.googlepay.totalPrice` → Price to show in Google Pay button
- `data.googlepay.currencyCode` → Currency for Google Pay
- `data.googlepay.countryCode` → Country code for Google Pay

---

## 9. Step 4: Process Google Pay Token

First, set the URL you received from the **'Action URL'** (`actionurl`) of Google Pay in the transaction initiation response.

### Endpoint:
```
POST <actionurl>
```

> The actionurl is dynamic and received from the `data.googlepay.actionurl` field in the initiateTransaction response.

### Request Parameters:

| Parameter Name | Data Type | Required | Description |
|---|---|---|---|
| session_key | String | Yes | The session key received at the time of initiate the transaction (from `data.googlepay.session_key`) |
| en_signature_data | String | Yes | The payload received from Google which needs to be encoded by base64 (the Google Pay token from `paymentData.paymentMethodData.tokenizationData.token`) |

### Response Parameters:

| Parameter Name | Type | Description |
|---|---|---|
| status | String | SUCCESS or FAIL |
| message | String | Response message |
| data.type | String | "otp" (if 3DS required) or "regular" (if 3DS not required) |
| data.data | String | HTML form for 3DS redirection (only when type is "otp") |
| data.return_url | String | URL to redirect customer after payment completion |

### Example Request:
```json
{
  "session_key": "yw7yeoy39y293c236446612232343434",
  "en_signature_data": "eyJzaWduYXR1cmUiOiJNRVVDSVF..."
}
```

### Response Example - If 3DS Required (OTP):
```json
{
  "status": "SUCCESS",
  "message": "Payment Redirection.",
  "data": { 
    "type": "otp", 
    "data": "<form action='...threeDs' ...>",
    "return_url": "https://merchant.com/payment/success" 
  }
}
```

### Response Example - If 3DS Not Required:
```json
{
  "status": "SUCCESS",
  "message": "Payment Redirection.",
  "data": {
    "type": "regular",
    "return_url": "https://merchant.com/payment/success"
  }
}
```

Finally, redirect the customer to the "return_url" to complete the transaction and display the success or failure status.

---

## 10. Key Implementation Notes

### API Endpoints Summary:
- **Step 1 (googlepayConfig):** `POST https://<base-url>.com/api/v1/merchant-hosted-payment`
  - Sandbox: `https://sandboxbox.sslcommerz.com/api/v1/merchant-hosted-payment`
  - Live: `https://sslcommerz.com/api/v1/merchant-hosted-payment`
- **Step 3 (initiateTransaction):** Same endpoint as Step 1
- **Step 4 (Process Token):** `POST <actionurl>` (dynamic URL from initiateTransaction response)

### GPay Config API Limits:
- **Daily limit: 3 requests** - Cache the config data and refresh as needed

### user_refer Encryption:
- Algorithm: **AES-256-CBC**
- **Sandbox Salt Key:** `"F5d66a527ff181486321bf7c3s7f54de"`
- **Live Salt Key:** Provided separately by SSLCommerz
- Input: JSON with `user_refer` (min 20 chars) and `user_mobile` (11 digit BD number)

### Google Pay Token Processing:
- Token from Google Pay JS: `paymentData.paymentMethodData.tokenizationData.token`
- Must be **base64 encoded** before sending as `en_signature_data`

### Transaction Amount Limits:
- Minimum: **10.00 BDT**
- Maximum: **500,000.00 BDT**

### Supported Card Networks:
- MASTERCARD
- VISA

### Authentication Methods:
- PAN_ONLY (3DS with OTP)
- CRYPTOGRAM_3DS (Tap & Pay)

### Product Profile Values:
- `general`
- `physical-goods`
- `non-physical-goods`
- `airline-tickets`
- `travel-vertical`
- `telecom-vertical`

### IPN (Instant Payment Notification):
- Always set `ipn_url` in initiateTransaction request
- SSLCommerz POSTs transaction status to this endpoint (server-to-server)
- Critical for reconciling backend transactions when customer session is lost

### Integration Flow Order:
1. Call `googlepayConfig` API → Get GPay config data → **Cache it**
2. Use config data to render Google Pay button on frontend
3. Customer selects card → Google Pay JS returns token
4. Call `initiateTransaction` API with `enable_cus_googlepay: 1` → Get session_key + actionurl
5. Call `<actionurl>` with `session_key` + base64-encoded Google Pay token
6. Handle response: redirect for 3DS OTP or direct processing
7. Customer redirected to success/fail/cancel URL
8. Verify final status via IPN callback

---

**Congratulations!** You have successfully integrated Google Pay with SSLCommerz. Your customers can now enjoy a seamless, secure, and fast payment experience using their saved Google Pay cards.
