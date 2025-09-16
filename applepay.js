var PAYSAFEVALIDATEURL = "https://api.paysafe.com/request/api/v1/validate"
var MERCHANT_IDENTIFIER = "merchant.com.domesticandgeneral";
var APIKEY = "U1VULTczNDI0MDpCLXFhMi0wLTYxMmU2ODY3LTAtMzAyYzAyMTQ1NzlhMWVlMzU1ZTg5NGVmN2RlM2VjYWJkNmE1NDZjZWM2NjgyNTRiMDIxNDcwZjA5NWE4YmUyOGQwM2UzZWRjYzhiNDc0NGFlZjM5OWYzMjA5OGM";
// var APIDET = "SUT-734240:B-qa2-0-612e6867-0-302c0214579a1ee355e894ef7de3ecabd6a546cec668254b021470f095a8be28d03e3edcc8b4744aef399f32098c";
// var APIKEY = btoa(APIDET); 

var CURRENCY_CODE = "USD";
var COUNTRY_CODE = "US";
var ARRAYBRANDS = ['masterCard', 'visa', "amex", "discover", "interac"]
var VERSION = 4;

var price = document.getElementsByClassName("price")[0].innerText.replace("$", "");

const applePayMethod = {
  supportedMethods: "https://apple.com/apple-pay",
  data: {
    version: VERSION,
    merchantIdentifier: MERCHANT_IDENTIFIER,
    merchantCapabilities: ["supports3DS", "supportsCredit", "supportsDebit"],
    supportedNetworks: ARRAYBRANDS,
    countryCode: COUNTRY_CODE,
  },
};

var todayDate = new Date();
var dateSevenDaysAhead = new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

var paymentDetails =
{
  total: {
    label: "Watch Shop",
    amount: {
      value: price,
      currency: CURRENCY_CODE
    }
  },
  displayItems: [
    {
      label: "Tax",
      amount: {
        value: "2.50",
        currency: CURRENCY_CODE
      }
    },
    {
      label: "Ground Shipping",
      amount: {
        value: "5.00",
        currency: CURRENCY_CODE
      }
    }
  ],
  shippingOptions: [
    {
      id: "ground",
      label: "Ground Shipping",
      amount: {
        value: "5.00",
        currency: CURRENCY_CODE
      },
      selected: true
    },
    {
      id: "express",
      label: "Express Shipping",
      amount: {
        value: "10.00",
        currency: CURRENCY_CODE
      }
    }
  ],
  modifiers: [
    {
      supportedMethods: "https://apple.com/apple-pay",
      data: {
        recurringPaymentRequest: {
          paymentDescription: "A description of the recurring payment to display to the user in the payment sheet.",
          trialBilling: {
            label: "7 Day Trial",
            amount: "0.00",
            paymentTiming: "recurring",
            recurringPaymentEndDate: dateSevenDaysAhead
          },
          regularBilling: {
            label: "Recurring",
            amount: "4.99",
            paymentTiming: "recurring",
            recurringPaymentStartDate: dateSevenDaysAhead //"2025-09-09T04:00:00.000Z"
          },
          billingAgreement: "A localized billing agreement displayed to the user in the payment sheet prior to the payment authorization.",
          managementURL: "https://example.com/the-url-at-which-a-customer-can-manage-the-subscription/",
          tokenNotificationURL: "https://applepay-notifications.paysafe.com/v1/applepay/merchanttokens/" + MERCHANT_IDENTIFIER
        },
        additionalLineItems: [
          {
            label: "7 Day Trial",
            amount: "0.00",
            paymentTiming: "recurring",
            recurringPaymentEndDate: dateSevenDaysAhead //"2025-10-09T04:00:00.000Z"
          },
          {
            label: "Recurring",
            amount: "4.99",
            paymentTiming: "recurring",
            recurringPaymentStartDate: dateSevenDaysAhead //"2025-11-09T04:00:00.000Z"
          }
        ]
      }
    }
  ]
}

const paymentOptions = {
  requestPayerName: false,
  requestPayerEmail: false,
  requestBillingAddress: false,
  requestPayerPhone: false,
  requestShipping: false
};

async function applePayButtonClicked() {
  // Consider falling back to Apple Pay JS if Payment Request is not available.
  if (!window.PaymentRequest)
    return;
  try {
    paymentRequestOptions = document.getElementById("paymentRequestOptions").value;
    if (!isJsonString(paymentRequestOptions)) {
      printError("Invalid JSON in 'Apple Pay Payment Request'.", true);
      return;
    }

    const request = new PaymentRequest([applePayMethod], JSON.parse(paymentRequestOptions), paymentOptions);

    request.onmerchantvalidation = function (event) {
      // Have your server fetch a payment session from event.validationURL.
      const sessionPromise = getApplePaySession(event.validationURL);
      event.complete(sessionPromise);
    };

    const response = await request.show();
    console.log("Apple Pay response: " + JSON.stringify(response.details));
    const status = "success";
    await response.complete(status);

    var paymentData = response.details;
    var applePayPayloadTextBox = document.getElementById("applePayPayload");
    var applePayPayloadBlock = document.getElementById("applePayPayloadBlock");
    var copyApplePayPayloadButton = document.getElementById("copyApplePayPayloadButton");
    printAppleResult(JSON.stringify(paymentData, null, 2), false);
    if (applePayPayloadBlock) {
      applePayPayloadTextBox.value = JSON.stringify(paymentData);
      applePayPayloadBlock.style.visibility = 'visible';
      copyApplePayPayloadButton.style.visibility = 'visible';
    }

  } catch (e) {
    alert(e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("paymentRequestOptions").value = JSON.stringify(paymentDetails, null, 2);
  document.getElementById("apple-pay-button").style.visibility = "visible";
});

function getApplePaySession(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', PAYSAFEVALIDATEURL);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Paysafe-Credentials", "Basic " + APIKEY);
    xhr.send(JSON.stringify({
      validationUrl: url,
      domainName: window.location.host, //"checkout.paysafe.com" in the case of Paysafe demos
      displayName: window.location.host //"checkout.paysafe.com" in the case of Paysafe demos
    }));
  });
}

function copyApplePayPayload() {
  // Get the text field
  var copyText = document.getElementById("applePayPayload");

  // Select the text field
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text inside the text field
  navigator.clipboard.writeText(copyText.value);

  // Alert the copied text
  alert("Apple Pay payload copied to the clipboard!");
}

function printError(data) {
  var paragraph = document.getElementById("error-paragraph");
  paragraph.style.visibility = "visible";
  paragraph.innerText = data;
  document.body.appendChild(pre);
}

function printAppleResult(data) {
  var pre = document.createElement("pre");
  pre.innerHTML = "Apple pay result payload:\n" + data;
  document.body.appendChild(pre);

  var paragraph = document.getElementById("success-paragraph");
  paragraph.style.visibility = "visible";
  paragraph.innerText = 'Successfully created apple pay payload, please scroll down to see it in full!';
}

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
