
import React, { useMemo, useState } from "react";
import "./Airtime.css";
import "./Dashboard.css";

/*
|--------------------------------------------------------------------------
| SUBTOUSE — AIRTIME PURCHASE
|--------------------------------------------------------------------------
| Authentication:
|
| Login.jsx saves:
| localStorage.setItem("authToken", data.token);
|
| This page sends:
| Authorization: Bearer TOKEN
|
| Backend identifies the user from the token.
|--------------------------------------------------------------------------
*/

const API_URL =
  "http://beamaxtechpractical.online/API/buy_airtime.php";

const LOGIN_URL = "/login";

/*
|--------------------------------------------------------------------------
| NETWORKS
|--------------------------------------------------------------------------
*/

const NETWORKS = [
  {
    id: "mtn",
    name: "MTN",
    initials: "MTN",
    bg: "#FFCC00",
    fg: "#111111",
  },
  {
    id: "airtel",
    name: "Airtel",
    initials: "AIR",
    bg: "#ED1C24",
    fg: "#FFFFFF",
  },
  {
    id: "glo",
    name: "Glo",
    initials: "GLO",
    bg: "#00A651",
    fg: "#FFFFFF",
  },
  {
    id: "9mobile",
    name: "9mobile",
    initials: "9M",
    bg: "#0AA45A",
    fg: "#FFFFFF",
  },
];

/*
|--------------------------------------------------------------------------
| QUICK AMOUNTS
|--------------------------------------------------------------------------
*/

const QUICK_AMOUNTS = [
  100,
  200,
  500,
  1000,
  2000,
  5000,
];

/*
|--------------------------------------------------------------------------
| DEFAULT BENEFICIARIES
|--------------------------------------------------------------------------
*/

const DEFAULT_BENEFICIARIES = [
  {
    id: 1,
    name: "Chidinma Okafor",
    phone: "0803 456 7821",
    network: "mtn",
  },
  {
    id: 2,
    name: "Emeka Nwosu",
    phone: "0902 341 0092",
    network: "airtel",
  },
  {
    id: 3,
    name: "Ifeoma Ude",
    phone: "0705 128 9931",
    network: "glo",
  },
  {
    id: 4,
    name: "Tunde Bakare",
    phone: "0817 663 2210",
    network: "9mobile",
  },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function getNetwork(id) {
  return (
    NETWORKS.find(
      (network) => network.id === id
    ) || NETWORKS[0]
  );
}

function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₦0.00";
  }

  return `₦${number.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPhone(phone) {
  const digits = String(phone || "").replace(
    /\D/g,
    ""
  );

  if (digits.length !== 11) {
    return phone;
  }

  return `${digits.slice(0, 4)} ${digits.slice(
    4,
    7
  )} ${digits.slice(7)}`;
}

/*
|--------------------------------------------------------------------------
| NORMALIZE TRANSACTION STATUS
|--------------------------------------------------------------------------
|
| The backend may return:
|
| Success
| Pending
| Failed
|
| or provider-style values such as:
|
| ORDER_COMPLETED
| ORDER_RECEIVED
| ORDER_PROCESSED
| ORDER_ONHOLD
| ORDER_CANCELLED
|--------------------------------------------------------------------------
*/

function normalizeTransactionStatus(result) {
  const rawStatus =
    result?.status ??
    result?.transaction_status ??
    result?.transactionStatus ??
    result?.data?.status ??
    result?.data?.transaction_status ??
    "";

  const status = String(rawStatus)
    .trim()
    .toLowerCase();

  /*
  |--------------------------------------------------------------------------
  | SUCCESS
  |--------------------------------------------------------------------------
  */

  if (
    status === "success" ||
    status === "successful" ||
    status === "completed" ||
    status === "order_completed"
  ) {
    return "success";
  }

  /*
  |--------------------------------------------------------------------------
  | PENDING
  |--------------------------------------------------------------------------
  */

  if (
    status === "pending" ||
    status === "processing" ||
    status === "order_received" ||
    status === "order_processed" ||
    status === "order_onhold" ||
    status === "onhold" ||
    status === "awaiting"
  ) {
    return "pending";
  }

  /*
  |--------------------------------------------------------------------------
  | FAILED
  |--------------------------------------------------------------------------
  */

  if (
    status === "failed" ||
    status === "failure" ||
    status === "cancelled" ||
    status === "canceled" ||
    status === "order_cancelled" ||
    status === "order_canceled"
  ) {
    return "failed";
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| GET REFERENCE
|--------------------------------------------------------------------------
*/

function getTransactionReference(result) {
  return (
    result?.reference ||
    result?.transaction_reference ||
    result?.transactionReference ||
    result?.data?.reference ||
    result?.data?.transaction_reference ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| GET PROVIDER ORDER ID
|--------------------------------------------------------------------------
*/

function getProviderOrderId(result) {
  return (
    result?.orderId ||
    result?.orderid ||
    result?.provider_reference ||
    result?.data?.orderId ||
    result?.data?.orderid ||
    result?.data?.provider_reference ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| GET BALANCE FROM API RESPONSE
|--------------------------------------------------------------------------
*/

function getReturnedBalance(result) {
  if (
    result?.balance !== undefined &&
    result?.balance !== null
  ) {
    return result.balance;
  }

  if (
    result?.user?.balance !== undefined &&
    result?.user?.balance !== null
  ) {
    return result.user.balance;
  }

  if (
    result?.data?.balance !== undefined &&
    result?.data?.balance !== null
  ) {
    return result.data.balance;
  }

  if (
    result?.data?.user?.balance !== undefined &&
    result?.data?.user?.balance !== null
  ) {
    return result.data.user.balance;
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| NETWORK BADGE
|--------------------------------------------------------------------------
*/

function NetworkBadge({
  id,
  size = "sm",
}) {
  const network = getNetwork(id);

  return (
    <span
      className={`network-badge network-badge--${size}`}
      style={{
        background: network.bg,
        color: network.fg,
      }}
    >
      {network.initials}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

function getAuthentication() {
  let user = null;
  let authToken = "";

  try {
    const storedUser =
      localStorage.getItem("user");

    const storedToken =
      localStorage.getItem("authToken");

    if (storedUser) {
      try {
        user = JSON.parse(storedUser);
      } catch (error) {
        console.error(
          "Invalid saved user:",
          error
        );

        localStorage.removeItem("user");
      }
    }

    authToken = String(
      storedToken || ""
    ).trim();

    console.log(
      "========================================"
    );

    console.log(
      "AIRTIME AUTH CHECK"
    );

    console.log(
      "USER:",
      user ? "YES" : "NO"
    );

    console.log(
      "USER ID:",
      user?.id || "NONE"
    );

    console.log(
      "TOKEN:",
      authToken ? "YES" : "NO"
    );

    console.log(
      "========================================"
    );

    return {
      user,
      authToken,
    };
  } catch (error) {
    console.error(
      "AUTH STORAGE ERROR:",
      error
    );

    return {
      user: null,
      authToken: "",
    };
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE LOCAL BALANCE
|--------------------------------------------------------------------------
*/

function updateLocalBalance(balance) {
  if (
    balance === undefined ||
    balance === null
  ) {
    return;
  }

  const numericBalance =
    Number(balance);

  if (
    !Number.isFinite(
      numericBalance
    )
  ) {
    return;
  }

  try {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    const user =
      JSON.parse(storedUser);

    user.balance =
      numericBalance;

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    console.log(
      "LOCAL BALANCE UPDATED:",
      numericBalance
    );
  } catch (error) {
    console.error(
      "BALANCE UPDATE ERROR:",
      error
    );
  }
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function Airtime() {

  const [
    selectedNetwork,
    setSelectedNetwork,
  ] = useState("mtn");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    activeQuick,
    setActiveQuick,
  ] = useState(null);

  const [
    saveBeneficiary,
    setSaveBeneficiary,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    messageType,
    setMessageType,
  ] = useState("");

  const [
    transactionResult,
    setTransactionResult,
  ] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | ACTIVE NETWORK
  |--------------------------------------------------------------------------
  */

  const activeNetwork = useMemo(
    () =>
      getNetwork(
        selectedNetwork
      ),
    [selectedNetwork]
  );

  /*
  |--------------------------------------------------------------------------
  | FORM VALUES
  |--------------------------------------------------------------------------
  */

  const cleanPhone =
    phone.replace(/\D/g, "");

  const numericAmount =
    Number(amount);

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const phoneIsValid =
    /^0[7-9][0-9]{9}$/.test(
      cleanPhone
    );

  const amountIsValid =
    Number.isFinite(
      numericAmount
    ) &&
    numericAmount >= 50 &&
    numericAmount <= 200000;

  const isFormValid =
    phoneIsValid &&
    amountIsValid;

  /*
  |--------------------------------------------------------------------------
  | CLEAR MESSAGE
  |--------------------------------------------------------------------------
  */

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
    setTransactionResult(null);
  };

  /*
  |--------------------------------------------------------------------------
  | QUICK AMOUNT
  |--------------------------------------------------------------------------
  */

  const handleQuickAmount = (
    value
  ) => {

    if (loading) {
      return;
    }

    setAmount(
      String(value)
    );

    setActiveQuick(
      value
    );

    clearMessage();
  };

  /*
  |--------------------------------------------------------------------------
  | AMOUNT INPUT
  |--------------------------------------------------------------------------
  */

  const handleAmountInput = (
    event
  ) => {

    if (loading) {
      return;
    }

    const value =
      event.target.value;

    setAmount(value);
    setActiveQuick(null);

    clearMessage();
  };

  /*
  |--------------------------------------------------------------------------
  | PHONE INPUT
  |--------------------------------------------------------------------------
  */

  const handlePhoneInput = (
    event
  ) => {

    if (loading) {
      return;
    }

    const digits =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 11);

    setPhone(digits);

    clearMessage();
  };

  /*
  |--------------------------------------------------------------------------
  | NETWORK CHANGE
  |--------------------------------------------------------------------------
  */

  const handleNetworkChange = (
    network
  ) => {

    if (loading) {
      return;
    }

    setSelectedNetwork(
      network
    );

    clearMessage();
  };

  /*
  |--------------------------------------------------------------------------
  | RECHARGE
  |--------------------------------------------------------------------------
  */

  const handleRecharge = async () => {

    if (loading) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PHONE
    |--------------------------------------------------------------------------
    */

    if (!phoneIsValid) {

      setMessage(
        "Please enter a valid Nigerian phone number."
      );

      setMessageType(
        "error"
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE AMOUNT
    |--------------------------------------------------------------------------
    */

    if (!amountIsValid) {

      setMessage(
        "Please enter an amount between ₦50 and ₦200,000."
      );

      setMessageType(
        "error"
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION
    |--------------------------------------------------------------------------
    */

    const {
      user,
      authToken,
    } =
      getAuthentication();

    if (
      !user ||
      !user.id
    ) {

      setMessage(
        "Your login information could not be found. Please log in again."
      );

      setMessageType(
        "error"
      );

      return;
    }

    if (!authToken) {

      setMessage(
        "Your authentication token could not be found. Please log in again."
      );

      setMessageType(
        "error"
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | REQUEST BODY
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | Do NOT send user_id.
    |
    | The backend identifies the user using the bearer token.
    |--------------------------------------------------------------------------
    */

    const requestBody = {
      network:
        selectedNetwork,

      phone:
        cleanPhone,

      amount:
        numericAmount,
    };

    console.log(
      "========================================"
    );

    console.log(
      "SUBTOUSE AIRTIME PURCHASE"
    );

    console.log(
      "API URL:",
      API_URL
    );

    console.log(
      "NETWORK:",
      selectedNetwork
    );

    console.log(
      "PHONE:",
      cleanPhone
    );

    console.log(
      "AMOUNT:",
      numericAmount
    );

    console.log(
      "TOKEN AVAILABLE:",
      "YES"
    );

    console.log(
      "REQUEST BODY:",
      requestBody
    );

    console.log(
      "========================================"
    );

    /*
    |--------------------------------------------------------------------------
    | START LOADING
    |--------------------------------------------------------------------------
    */

    setLoading(true);
    clearMessage();

    /*
    |--------------------------------------------------------------------------
    | API REQUEST
    |--------------------------------------------------------------------------
    */

    try {

      const response =
        await fetch(
          API_URL,
          {
            method: "POST",

            mode: "cors",

            headers: {
              "Content-Type":
                "application/json",

              "Accept":
                "application/json",

              "Authorization":
                `Bearer ${authToken}`,
            },

            body:
              JSON.stringify(
                requestBody
              ),
          }
        );

      console.log(
        "AIRTIME HTTP STATUS:",
        response.status
      );

      console.log(
        "AIRTIME HTTP OK:",
        response.ok
      );

      /*
      |--------------------------------------------------------------------------
      | READ RESPONSE
      |--------------------------------------------------------------------------
      */

      const rawResponse =
        await response.text();

      console.log(
        "AIRTIME RAW RESPONSE:",
        rawResponse
      );

      /*
      |--------------------------------------------------------------------------
      | EMPTY RESPONSE
      |--------------------------------------------------------------------------
      */

      if (
        !rawResponse ||
        rawResponse.trim() === ""
      ) {

        throw new Error(
          "The airtime server returned an empty response."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | PARSE JSON
      |--------------------------------------------------------------------------
      */

      let result;

      try {

        result =
          JSON.parse(
            rawResponse
          );

      } catch (error) {

        console.error(
          "INVALID AIRTIME JSON:",
          rawResponse
        );

        throw new Error(
          "The airtime server returned an invalid response."
        );
      }

      console.log(
        "AIRTIME API RESULT:",
        result
      );

      /*
      |--------------------------------------------------------------------------
      | AUTH ERROR
      |--------------------------------------------------------------------------
      */

      if (
        response.status === 401
      ) {

        console.error(
          "AIRTIME AUTHENTICATION FAILED:",
          result
        );

        localStorage.removeItem(
          "authToken"
        );

        localStorage.removeItem(
          "apiTokenExpiresAt"
        );

        localStorage.removeItem(
          "isLoggedIn"
        );

        setMessage(
          result.message ||
          "Your login session has expired. Please log in again."
        );

        setMessageType(
          "error"
        );

        setTimeout(() => {

          window.location.href =
            LOGIN_URL;

        }, 1200);

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | SERVER ERROR
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {

        setTransactionResult(
          result
        );

        setMessage(
          result.message ||
          `Airtime server error (${response.status}).`
        );

        setMessageType(
          "error"
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | API FAILURE
      |--------------------------------------------------------------------------
      */

      if (
        result.success !== true
      ) {

        console.error(
          "AIRTIME API FAILURE:",
          result
        );

        setTransactionResult(
          result
        );

        setMessage(
          result.message ||
          "Airtime purchase could not be completed."
        );

        setMessageType(
          "error"
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | NORMALIZE STATUS
      |--------------------------------------------------------------------------
      */

      const transactionStatus =
        normalizeTransactionStatus(
          result
        );

      const reference =
        getTransactionReference(
          result
        );

      const orderId =
        getProviderOrderId(
          result
        );

      const returnedBalance =
        getReturnedBalance(
          result
        );

      console.log(
        "AIRTIME NORMALIZED STATUS:",
        transactionStatus
      );

      console.log(
        "AIRTIME REFERENCE:",
        reference || "N/A"
      );

      console.log(
        "AIRTIME ORDER ID:",
        orderId || "N/A"
      );

      console.log(
        "AIRTIME RETURNED BALANCE:",
        returnedBalance ?? "N/A"
      );

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      |
      | Only a confirmed successful transaction reaches here.
      |--------------------------------------------------------------------------
      */

      if (
        transactionStatus ===
        "success"
      ) {

        console.log(
          "========================================"
        );

        console.log(
          "AIRTIME PURCHASE CONFIRMED SUCCESSFULLY"
        );

        console.log(
          "REFERENCE:",
          reference || "N/A"
        );

        console.log(
          "ORDER ID:",
          orderId || "N/A"
        );

        console.log(
          "========================================"
        );

        setTransactionResult(
          result
        );

        setMessage(
          result.message ||
          "Airtime purchase completed successfully."
        );

        setMessageType(
          "success"
        );

        /*
        |--------------------------------------------------------------------------
        | UPDATE BALANCE
        |--------------------------------------------------------------------------
        */

        if (
          returnedBalance !==
          null
        ) {

          updateLocalBalance(
            returnedBalance
          );
        }

        /*
        |--------------------------------------------------------------------------
        | CLEAR FORM ONLY AFTER CONFIRMED SUCCESS
        |--------------------------------------------------------------------------
        */

        setPhone("");
        setAmount("");
        setActiveQuick(null);

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | PENDING
      |--------------------------------------------------------------------------
      |
      | This is extremely important.
      |
      | If ClubKonnect says ORDER_RECEIVED, ORDER_PROCESSED or ONHOLD,
      | the airtime has NOT been confirmed as successful yet.
      |
      | DO NOT display "successful".
      | DO NOT clear the form.
      | DO NOT assume delivery.
      |--------------------------------------------------------------------------
      */

      if (
        transactionStatus ===
        "pending"
      ) {

        console.log(
          "========================================"
        );

        console.log(
          "AIRTIME PURCHASE IS PENDING"
        );

        console.log(
          "REFERENCE:",
          reference || "N/A"
        );

        console.log(
          "ORDER ID:",
          orderId || "N/A"
        );

        console.log(
          "========================================"
        );

        setTransactionResult(
          result
        );

        setMessage(
          result.message ||
          "Your airtime request has been received and is currently being processed."
        );

        setMessageType(
          "warning"
        );

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        |
        | Do NOT update the balance here unless the backend explicitly
        | returns the current balance after the local wallet debit.
        |
        | Do NOT clear phone/amount because the transaction is not
        | confirmed yet.
        |--------------------------------------------------------------------------
        */

        if (
          returnedBalance !==
          null
        ) {

          updateLocalBalance(
            returnedBalance
          );
        }

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | FAILED
      |--------------------------------------------------------------------------
      |
      | The backend should already have refunded the user's wallet
      | before returning this response where appropriate.
      |--------------------------------------------------------------------------
      */

      if (
        transactionStatus ===
        "failed"
      ) {

        console.log(
          "========================================"
        );

        console.log(
          "AIRTIME PURCHASE FAILED"
        );

        console.log(
          "REFERENCE:",
          reference || "N/A"
        );

        console.log(
          "ORDER ID:",
          orderId || "N/A"
        );

        console.log(
          "========================================"
        );

        setTransactionResult(
          result
        );

        setMessage(
          result.message ||
          "Airtime purchase failed. If your wallet was charged, the backend has processed the refund."
        );

        setMessageType(
          "error"
        );

        /*
        |--------------------------------------------------------------------------
        | UPDATE BALANCE AFTER REFUND
        |--------------------------------------------------------------------------
        */

        if (
          returnedBalance !==
          null
        ) {

          updateLocalBalance(
            returnedBalance
          );
        }

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | UNKNOWN STATUS
      |--------------------------------------------------------------------------
      |
      | NEVER call an unknown transaction status successful.
      |--------------------------------------------------------------------------
      */

      console.warn(
        "UNKNOWN AIRTIME TRANSACTION STATUS:",
        result
      );

      setTransactionResult(
        result
      );

      setMessage(
        result.message ||
        "Your airtime request was received, but its final status is still being determined."
      );

      setMessageType(
        "warning"
      );

    } catch (error) {

      console.error(
        "========================================"
      );

      console.error(
        "AIRTIME REQUEST FAILED"
      );

      console.error(
        error
      );

      console.error(
        "========================================"
      );

      /*
      |--------------------------------------------------------------------------
      | NETWORK ERROR
      |--------------------------------------------------------------------------
      */

      if (
        error instanceof TypeError
      ) {

        setMessage(
          "Unable to connect to the airtime server. Please check your internet connection and try again."
        );

      } else {

        setMessage(
          error.message ||
          "Unable to reach the airtime server right now."
        );
      }

      setMessageType(
        "error"
      );

    } finally {

      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | BENEFICIARY RECHARGE
  |--------------------------------------------------------------------------
  */

  const handleBeneficiaryRecharge = (
    beneficiary
  ) => {

    if (loading) {
      return;
    }

    setPhone(
      beneficiary.phone.replace(
        /\D/g,
        ""
      )
    );

    setSelectedNetwork(
      beneficiary.network
    );

    clearMessage();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | BUY AGAIN
  |--------------------------------------------------------------------------
  */

  const handleBuyAgain = (
    transaction
  ) => {

    if (loading) {
      return;
    }

    setPhone(
      String(
        transaction.phone || ""
      ).replace(
        /\D/g,
        ""
      )
    );

    setSelectedNetwork(
      transaction.network ||
      "mtn"
    );

    setAmount(
      String(
        transaction.amount || ""
      )
    );

    const transactionAmount =
      Number(
        transaction.amount
      );

    setActiveQuick(
      QUICK_AMOUNTS.includes(
        transactionAmount
      )
        ? transactionAmount
        : null
    );

    clearMessage();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="dashboard-layout">

      <div className="airtime-page">

        {/* HEADER */}

        <div className="airtime-header fade-in-up">

          <div className="airtime-header__icon">
            <i className="bi bi-phone-fill"></i>
          </div>

          <div>

            <h1 className="airtime-header__title">
              Buy Airtime
            </h1>

            <p className="airtime-header__subtitle">
              Recharge any Nigerian line instantly
              — MTN, Airtel, Glo &amp; 9mobile
              directly from your SubtoUse wallet.
            </p>

          </div>

        </div>

        {/* STATISTICS */}

        <div className="stats-grid fade-in-up delay-1">

          <div className="stat-card">

            <div className="stat-card__icon stat-icon--violet">
              <i className="bi bi-lightning-charge-fill"></i>
            </div>

            <div className="stat-card__body">

              <span className="stat-card__label">
                Airtime Service
              </span>

              <span className="stat-card__value">
                Available
              </span>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-card__icon stat-icon--emerald">
              <i className="bi bi-patch-check-fill"></i>
            </div>

            <div className="stat-card__body">

              <span className="stat-card__label">
                Supported Networks
              </span>

              <span className="stat-card__value">
                4
              </span>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-card__icon stat-icon--amber">
              <i className="bi bi-wallet2"></i>
            </div>

            <div className="stat-card__body">

              <span className="stat-card__label">
                Minimum Recharge
              </span>

              <span className="stat-card__value">
                ₦50
              </span>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-card__icon stat-icon--cyan">
              <i className="bi bi-star-fill"></i>
            </div>

            <div className="stat-card__body">

              <span className="stat-card__label">
                Selected Network
              </span>

              <span className="stat-card__value">
                {activeNetwork.name}
              </span>

            </div>

          </div>

        </div>

        {/* PROMO */}

        <div className="promo-banner fade-in-up delay-2">

          <div
            className="promo-banner__pulse"
            aria-hidden="true"
          />

          <div className="promo-banner__content">

            <div className="promo-banner__badge">
              <i className="bi bi-lightning-charge-fill"></i>
              {" "}Fast Airtime Recharge
            </div>

            <h3 className="promo-banner__title">
              Recharge your line in seconds
            </h3>

            <p className="promo-banner__text">
              Select your network, enter the
              recipient's number and amount,
              then confirm your recharge.
            </p>

          </div>

        </div>

        {/* MAIN GRID */}

        <div className="airtime-main-grid">

          {/* PURCHASE CARD */}

          <div className="glass-card purchase-card fade-in-up delay-2">

            <div className="glass-card__header">

              <h2 className="glass-card__title">
                <i className="bi bi-phone"></i>
                {" "}Recharge a Line
              </h2>

              <span className="glass-card__hint">
                Secure wallet payment
              </span>

            </div>

            {/* NETWORK */}

            <div className="form-group">

              <label className="form-label">
                Select Network
              </label>

              <div className="network-grid">

                {NETWORKS.map(
                  (network) => (

                    <button
                      type="button"
                      key={network.id}
                      className={`network-card ${
                        selectedNetwork ===
                        network.id
                          ? "network-card--active"
                          : ""
                      }`}
                      onClick={() =>
                        handleNetworkChange(
                          network.id
                        )
                      }
                      disabled={loading}
                    >

                      <span
                        className="network-card__logo"
                        style={{
                          background:
                            network.bg,
                          color:
                            network.fg,
                        }}
                      >
                        {network.initials}
                      </span>

                      <span className="network-card__name">
                        {network.name}
                      </span>

                      {selectedNetwork ===
                        network.id && (

                        <span className="network-card__check">
                          <i className="bi bi-check-circle-fill"></i>
                        </span>

                      )}

                    </button>

                  )
                )}

              </div>

            </div>

            {/* PHONE */}

            <div className="form-group">

              <label
                className="form-label"
                htmlFor="phone-input"
              >
                Phone Number
              </label>

              <div className="input-with-icon">

                <i className="bi bi-telephone-fill input-with-icon__icon"></i>

                <input
                  id="phone-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="0803 456 7821"
                  className="form-input"
                  value={formatPhone(phone)}
                  onChange={
                    handlePhoneInput
                  }
                  maxLength={13}
                  disabled={loading}
                />

                <span className="input-with-icon__suffix">

                  <NetworkBadge
                    id={selectedNetwork}
                    size="sm"
                  />

                </span>

              </div>

              {phone.length > 0 &&
                !phoneIsValid && (

                <small className="form-error">
                  Enter a valid 11-digit Nigerian
                  phone number.
                </small>

              )}

            </div>

            {/* AMOUNT */}

            <div className="form-group">

              <label
                className="form-label"
                htmlFor="amount-input"
              >
                Amount
              </label>

              <div className="input-with-icon">

                <span className="input-with-icon__icon input-with-icon__icon--text">
                  ₦
                </span>

                <input
                  id="amount-input"
                  type="number"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  className="form-input"
                  value={amount}
                  onChange={
                    handleAmountInput
                  }
                  min={50}
                  max={200000}
                  step="1"
                  disabled={loading}
                />

              </div>

              <div className="quick-amounts">

                {QUICK_AMOUNTS.map(
                  (value) => (

                    <button
                      type="button"
                      key={value}
                      className={`quick-amount-btn ${
                        activeQuick ===
                        value
                          ? "quick-amount-btn--active"
                          : ""
                      }`}
                      onClick={() =>
                        handleQuickAmount(
                          value
                        )
                      }
                      disabled={loading}
                    >
                      ₦
                      {value.toLocaleString(
                        "en-NG"
                      )}
                    </button>

                  )
                )}

              </div>

              {amount !== "" &&
                !amountIsValid && (

                <small className="form-error">
                  Airtime amount must be between
                  ₦50 and ₦200,000.
                </small>

              )}

            </div>

            {/* BENEFICIARY */}

            <label className="checkbox-row">

              <input
                type="checkbox"
                checked={
                  saveBeneficiary
                }
                onChange={(event) =>
                  setSaveBeneficiary(
                    event.target.checked
                  )
                }
                disabled={loading}
              />

              <span className="checkbox-row__box">
                <i className="bi bi-check-lg"></i>
              </span>

              <span className="checkbox-row__label">
                Save this number as a beneficiary
              </span>

            </label>

            {/* RECHARGE */}

            <button
              type="button"
              className="recharge-btn"
              disabled={
                !isFormValid ||
                loading
              }
              onClick={
                handleRecharge
              }
            >

              {loading ? (

                <>
                  <i className="bi bi-arrow-repeat"></i>
                  Processing...
                </>

              ) : (

                <>
                  <i className="bi bi-lightning-charge-fill"></i>

                  Recharge{" "}

                  {amount
                    ? formatCurrency(
                        amount
                      )
                    : ""}

                </>

              )}

            </button>

            {/* MESSAGE */}

            {message && (

              <div
                className={`airtime-message ${messageType}`}
                role="alert"
              >

                <i
                  className={
                    messageType ===
                    "success"
                      ? "bi bi-check-circle-fill"
                      : messageType ===
                        "warning"
                      ? "bi bi-hourglass-split"
                      : "bi bi-exclamation-circle-fill"
                  }
                />

                <span>
                  {message}
                </span>

              </div>

            )}

            {/* TRANSACTION RESULT */}

            {transactionResult && (

              <div className="transaction-reference">

                {getTransactionReference(
                  transactionResult
                ) && (

                  <div>

                    <span>
                      Reference
                    </span>

                    <strong>
                      {
                        getTransactionReference(
                          transactionResult
                        )
                      }
                    </strong>

                  </div>

                )}

                {getProviderOrderId(
                  transactionResult
                ) && (

                  <div>

                    <span>
                      Order ID
                    </span>

                    <strong>
                      {
                        getProviderOrderId(
                          transactionResult
                        )
                      }
                    </strong>

                  </div>

                )}

              </div>

            )}

          </div>

          {/* BENEFICIARIES */}

          <div className="glass-card beneficiaries-card fade-in-up delay-3">

            <div className="glass-card__header">

              <h2 className="glass-card__title">
                <i className="bi bi-people-fill"></i>
                {" "}Saved Beneficiaries
              </h2>

            </div>

            <div className="beneficiary-list">

              {DEFAULT_BENEFICIARIES.map(
                (beneficiary) => (

                  <div
                    className="beneficiary-item"
                    key={beneficiary.id}
                  >

                    <div className="beneficiary-item__avatar">

                      {beneficiary.name
                        .split(" ")
                        .map(
                          (name) =>
                            name[0]
                        )
                        .join("")
                        .slice(0, 2)}

                    </div>

                    <div className="beneficiary-item__info">

                      <span className="beneficiary-item__name">
                        {beneficiary.name}
                      </span>

                      <span className="beneficiary-item__phone">

                        {beneficiary.phone}{" "}

                        <NetworkBadge
                          id={
                            beneficiary.network
                          }
                          size="xs"
                        />

                      </span>

                    </div>

                    <button
                      type="button"
                      className="beneficiary-item__action"
                      onClick={() =>
                        handleBeneficiaryRecharge(
                          beneficiary
                        )
                      }
                      disabled={loading}
                    >

                      <i className="bi bi-arrow-repeat"></i>

                      <span className="beneficiary-item__action-label">
                        Recharge
                      </span>

                    </button>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

        {/* INFO */}

        <div className="glass-card airtime-info-card fade-in-up delay-3">

          <div className="airtime-info-card__icon">
            <i className="bi bi-shield-check"></i>
          </div>

          <div>

            <h3>
              Secure Airtime Recharge
            </h3>

            <p>
              Your wallet balance is verified and
              processed securely by the SubtoUse
              payment system. Failed live transactions
              should be refunded automatically by the
              backend, while transactions awaiting
              provider confirmation remain pending.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

