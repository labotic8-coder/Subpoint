import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import "./Transaction.css";

import {
    FaWallet,
    FaMobileAlt,
    FaBolt,
    FaTv,
    FaExchangeAlt,
    FaSearch,
    FaCheckCircle,
    FaTimesCircle,
    FaClock
} from "react-icons/fa";

/*
|--------------------------------------------------------------------------
| SUBTOUSE — TRANSACTION HISTORY
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| transactions table = single source of truth.
|
| Airtime transactions that are still Pending are checked through:
|
| check_airtime_status.php
|
| The backend decides whether the transaction is:
|
| Pending
| Success
| Failed
|
| React NEVER changes Pending to Success by itself.
|--------------------------------------------------------------------------
*/

const TRANSACTIONS_API =
    "http://beamaxtechpractical.online/API/get_transactions.php";

const AIRTIME_STATUS_API =
    "http://beamaxtechpractical.online/API/check_airtime_status.php";

/*
|--------------------------------------------------------------------------
| STATUS CHECK INTERVAL
|--------------------------------------------------------------------------
|
| While there is a Pending airtime transaction, check again every
| 15 seconds.
|
| This prevents the frontend from hammering the provider continuously.
|--------------------------------------------------------------------------
*/

const STATUS_CHECK_INTERVAL = 15000;

/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

function getAuthToken() {
    try {
        return String(
            localStorage.getItem("authToken") || ""
        ).trim();
    } catch (error) {
        console.error(
            "TRANSACTION AUTH TOKEN ERROR:",
            error
        );

        return "";
    }
}

/*
|--------------------------------------------------------------------------
| GET SAVED USER
|--------------------------------------------------------------------------
*/

function getSavedUser() {
    try {
        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        return JSON.parse(storedUser);
    } catch (error) {
        console.error(
            "TRANSACTION USER ERROR:",
            error
        );

        return null;
    }
}

/*
|--------------------------------------------------------------------------
| NORMALIZE STATUS
|--------------------------------------------------------------------------
*/

function normalizeStatus(status) {
    return String(
        status || ""
    )
        .trim()
        .toLowerCase();
}

/*
|--------------------------------------------------------------------------
| TRANSACTION COMPONENT
|--------------------------------------------------------------------------
*/

export default function Transaction() {

    const [transactions, setTransactions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [filter, setFilter] =
        useState("all");

    /*
    |--------------------------------------------------------------------------
    | PREVENT OVERLAPPING STATUS CHECKS
    |--------------------------------------------------------------------------
    */

    const checkingStatusRef =
        useRef(false);

    /*
    |--------------------------------------------------------------------------
    | FETCH TRANSACTIONS
    |--------------------------------------------------------------------------
    */

    const fetchTransactions =
        useCallback(
            async (
                showLoading = true
            ) => {

                const savedUser =
                    getSavedUser();

                if (
                    !savedUser ||
                    !savedUser.id
                ) {

                    console.warn(
                        "TRANSACTION: USER NOT FOUND"
                    );

                    setTransactions([]);

                    if (showLoading) {
                        setLoading(false);
                    }

                    return [];
                }

                try {

                    if (showLoading) {
                        setLoading(true);
                    }

                    const response =
                        await fetch(
                            `${TRANSACTIONS_API}?user_id=${encodeURIComponent(
                                savedUser.id
                            )}`,
                            {
                                method: "GET",
                                headers: {
                                    Accept:
                                        "application/json"
                                }
                            }
                        );

                    const data =
                        await response.json();

                    if (
                        data.success &&
                        Array.isArray(
                            data.transactions
                        )
                    ) {

                        setTransactions(
                            data.transactions
                        );

                        return data.transactions;
                    }

                    console.error(
                        "TRANSACTION API ERROR:",
                        data
                    );

                    return [];

                } catch (error) {

                    console.error(
                        "TRANSACTION FETCH ERROR:",
                        error
                    );

                    return [];

                } finally {

                    if (showLoading) {
                        setLoading(false);
                    }

                }

            },
            []
        );

    /*
    |--------------------------------------------------------------------------
    | CHECK ONE AIRTIME TRANSACTION
    |--------------------------------------------------------------------------
    */

    const checkAirtimeStatus =
        useCallback(
            async (transaction) => {

                if (
                    !transaction ||
                    transaction.transaction_type !==
                        "airtime"
                ) {
                    return;
                }

                const status =
                    normalizeStatus(
                        transaction.status
                    );

                /*
                |--------------------------------------------------------------------------
                | NEVER CHECK FINAL TRANSACTIONS
                |--------------------------------------------------------------------------
                */

                if (
                    status === "success" ||
                    status === "failed" ||
                    status === "reversed"
                ) {
                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | REFERENCE IS REQUIRED
                |--------------------------------------------------------------------------
                */

                if (
                    !transaction.reference
                ) {

                    console.warn(
                        "AIRTIME STATUS CHECK SKIPPED: NO REFERENCE",
                        transaction
                    );

                    return;
                }

                const authToken =
                    getAuthToken();

                if (!authToken) {

                    console.warn(
                        "AIRTIME STATUS CHECK SKIPPED: NO AUTH TOKEN"
                    );

                    return;
                }

                try {

                    const response =
                        await fetch(
                            AIRTIME_STATUS_API,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    Accept:
                                        "application/json",

                                    Authorization:
                                        `Bearer ${authToken}`
                                },

                                body:
                                    JSON.stringify({
                                        reference:
                                            transaction.reference
                                    })
                            }
                        );

                    const rawResponse =
                        await response.text();

                    if (
                        !rawResponse ||
                        rawResponse.trim() === ""
                    ) {

                        console.warn(
                            "AIRTIME STATUS CHECK: EMPTY RESPONSE"
                        );

                        return;
                    }

                    let result;

                    try {

                        result =
                            JSON.parse(
                                rawResponse
                            );

                    } catch (error) {

                        console.error(
                            "AIRTIME STATUS CHECK INVALID JSON:",
                            rawResponse
                        );

                        return;
                    }

                    console.log(
                        "AIRTIME STATUS CHECK:",
                        transaction.reference,
                        result
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | AUTHENTICATION FAILURE
                    |--------------------------------------------------------------------------
                    */

                    if (
                        response.status ===
                        401
                    ) {

                        console.error(
                            "AIRTIME STATUS AUTHENTICATION FAILED:",
                            result
                        );

                        return;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | IMPORTANT
                    |--------------------------------------------------------------------------
                    |
                    | We do not manually update the transaction here.
                    |
                    | check_airtime_status.php updates the database.
                    |
                    | We simply fetch the transactions again afterwards.
                    |--------------------------------------------------------------------------
                    */

                } catch (error) {

                    /*
                    |--------------------------------------------------------------------------
                    | NETWORK ERROR
                    |--------------------------------------------------------------------------
                    |
                    | Do not mark anything Failed.
                    |
                    | The backend already treats provider communication
                    | problems as Pending.
                    |--------------------------------------------------------------------------
                    */

                    console.error(
                        "AIRTIME STATUS CHECK ERROR:",
                        error
                    );

                }

            },
            []
        );

    /*
    |--------------------------------------------------------------------------
    | RECONCILE PENDING AIRTIME TRANSACTIONS
    |--------------------------------------------------------------------------
    */

    const reconcilePendingAirtime =
        useCallback(
            async (currentTransactions) => {

                /*
                |--------------------------------------------------------------------------
                | PREVENT OVERLAPPING RUNS
                |--------------------------------------------------------------------------
                */

                if (
                    checkingStatusRef.current
                ) {
                    return;
                }

                const authToken =
                    getAuthToken();

                if (!authToken) {
                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | FIND ONLY PENDING AIRTIME
                |--------------------------------------------------------------------------
                */

                const pendingAirtime =
                    currentTransactions.filter(
                        (transaction) => {

                            const status =
                                normalizeStatus(
                                    transaction.status
                                );

                            return (
                                transaction.transaction_type ===
                                    "airtime" &&
                                status ===
                                    "pending" &&
                                transaction.reference
                            );
                        }
                    );

                if (
                    pendingAirtime.length ===
                    0
                ) {
                    return;
                }

                checkingStatusRef.current =
                    true;

                try {

                    /*
                    |--------------------------------------------------------------------------
                    | CHECK EACH PENDING AIRTIME
                    |--------------------------------------------------------------------------
                    */

                    await Promise.all(
                        pendingAirtime.map(
                            (transaction) =>
                                checkAirtimeStatus(
                                    transaction
                                )
                        )
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | REFRESH FROM DATABASE
                    |--------------------------------------------------------------------------
                    |
                    | This is the important part.
                    |
                    | If check_airtime_status.php changed:
                    |
                    | Pending → Success
                    |
                    | or:
                    |
                    | Pending → Failed
                    |
                    | the transaction page now gets the real DB status.
                    |--------------------------------------------------------------------------
                    */

                    await fetchTransactions(
                        false
                    );

                } finally {

                    checkingStatusRef.current =
                        false;
                }

            },
            [
                checkAirtimeStatus,
                fetchTransactions
            ]
        );

    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        let mounted = true;

        const loadTransactions =
            async () => {

                const data =
                    await fetchTransactions(
                        true
                    );

                if (!mounted) {
                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | CHECK PENDING AIRTIME IMMEDIATELY
                |--------------------------------------------------------------------------
                */

                await reconcilePendingAirtime(
                    data
                );

            };

        loadTransactions();

        return () => {
            mounted = false;
        };

    }, [
        fetchTransactions,
        reconcilePendingAirtime
    ]);

    /*
    |--------------------------------------------------------------------------
    | AUTOMATIC PENDING CHECK
    |--------------------------------------------------------------------------
    |
    | Continue checking only while there is at least one Pending airtime.
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const hasPendingAirtime =
            transactions.some(
                (transaction) => {

                    const status =
                        normalizeStatus(
                            transaction.status
                        );

                    return (
                        transaction.transaction_type ===
                            "airtime" &&
                        status ===
                            "pending"
                    );
                }
            );

        if (
            !hasPendingAirtime
        ) {
            return undefined;
        }

        const interval =
            setInterval(
                () => {

                    reconcilePendingAirtime(
                        transactions
                    );

                },
                STATUS_CHECK_INTERVAL
            );

        return () => {

            clearInterval(
                interval
            );

        };

    }, [
        transactions,
        reconcilePendingAirtime
    ]);

    /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

    const totalFunding =
        transactions
            .filter(
                (transaction) =>
                    String(
                        transaction.transaction_type ||
                        ""
                    ).toLowerCase() ===
                    "funding"
            )
            .reduce(
                (
                    sum,
                    transaction
                ) =>
                    sum +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );

    const successful =
        transactions.filter(
            (transaction) =>
                normalizeStatus(
                    transaction.status
                ) === "success"
        ).length;

    const failed =
        transactions.filter(
            (transaction) =>
                normalizeStatus(
                    transaction.status
                ) === "failed"
        ).length;

    /*
    |--------------------------------------------------------------------------
    | SEARCH + FILTER
    |--------------------------------------------------------------------------
    */

    const filteredTransactions =
        useMemo(() => {

            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            return transactions.filter(
                (item) => {

                    const reference =
                        String(
                            item.reference ||
                            ""
                        ).toLowerCase();

                    const description =
                        String(
                            item.description ||
                            ""
                        ).toLowerCase();

                    const recipient =
                        String(
                            item.recipient ||
                            ""
                        ).toLowerCase();

                    const network =
                        String(
                            item.network ||
                            ""
                        ).toLowerCase();

                    const matchSearch =
                        !searchValue ||
                        reference.includes(
                            searchValue
                        ) ||
                        description.includes(
                            searchValue
                        ) ||
                        recipient.includes(
                            searchValue
                        ) ||
                        network.includes(
                            searchValue
                        );

                    const transactionType =
                        String(
                            item.transaction_type ||
                            ""
                        ).toLowerCase();

                    const matchFilter =
                        filter === "all" ||
                        transactionType ===
                            filter;

                    return (
                        matchSearch &&
                        matchFilter
                    );
                }
            );

        }, [
            transactions,
            search,
            filter
        ]);

    /*
    |--------------------------------------------------------------------------
    | ICON
    |--------------------------------------------------------------------------
    */

    const getIcon = (
        type
    ) => {

        switch (
            String(
                type || ""
            ).toLowerCase()
        ) {

            case "funding":
                return <FaWallet />;

            case "airtime":
                return <FaMobileAlt />;

            case "data":
                return <FaMobileAlt />;

            case "electricity":
                return <FaBolt />;

            case "cable":
                return <FaTv />;

            default:
                return <FaExchangeAlt />;
        }

    };

    /*
    |--------------------------------------------------------------------------
    | STATUS ICON
    |--------------------------------------------------------------------------
    */

    const getStatusIcon = (
        status
    ) => {

        const normalized =
            normalizeStatus(
                status
            );

        if (
            normalized ===
            "success"
        ) {
            return (
                <FaCheckCircle />
            );
        }

        if (
            normalized ===
            "pending"
        ) {
            return (
                <FaClock />
            );
        }

        if (
            normalized ===
            "reversed"
        ) {
            return (
                <FaClock />
            );
        }

        return (
            <FaTimesCircle />
        );

    };

    /*
    |--------------------------------------------------------------------------
    | STATUS CLASS
    |--------------------------------------------------------------------------
    */

    const getStatusClass = (
        status
    ) => {

        const normalized =
            normalizeStatus(
                status
            );

        if (
            normalized ===
            "success"
        ) {
            return "badge success";
        }

        if (
            normalized ===
            "pending"
        ) {
            return "badge pending";
        }

        if (
            normalized ===
            "reversed"
        ) {
            return "badge failed";
        }

        return "badge failed";
    };

    /*
    |--------------------------------------------------------------------------
    | DISPLAY STATUS
    |--------------------------------------------------------------------------
    */

    const getDisplayStatus = (
        status
    ) => {

        const normalized =
            normalizeStatus(
                status
            );

        if (
            normalized ===
            "success"
        ) {
            return "Success";
        }

        if (
            normalized ===
            "pending"
        ) {
            return "Pending";
        }

        if (
            normalized ===
            "reversed"
        ) {
            return "Reversed";
        }

        if (
            normalized ===
            "failed"
        ) {
            return "Failed";
        }

        return (
            status ||
            "Pending"
        );
    };

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <div className="transaction-page">

            <div className="transaction-header">

                <div>

                    <h2>
                        Transactions
                    </h2>

                    <p>
                        Track all your wallet activities
                    </p>

                </div>

            </div>

            {/* SUMMARY */}

            <div className="summary-grid">

                <div className="summary-card">

                    <h5>
                        Total Transactions
                    </h5>

                    <h2>
                        {transactions.length}
                    </h2>

                </div>

                <div className="summary-card">

                    <h5>
                        Total Funding
                    </h5>

                    <h2>
                        ₦
                        {totalFunding.toLocaleString(
                            "en-NG"
                        )}
                    </h2>

                </div>

                <div className="summary-card">

                    <h5>
                        Successful
                    </h5>

                    <h2>
                        {successful}
                    </h2>

                </div>

                <div className="summary-card">

                    <h5>
                        Failed
                    </h5>

                    <h2>
                        {failed}
                    </h2>

                </div>

            </div>

            {/* SEARCH */}

            <div className="transaction-search">

                <FaSearch
                    className="search-icon"
                />

                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />

            </div>

            {/* FILTER */}

            <div className="filter-buttons">

                {[
                    "all",
                    "funding",
                    "airtime",
                    "data",
                    "cable",
                    "electricity"
                ].map(
                    (item) => (

                        <button
                            key={item}
                            className={
                                filter === item
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setFilter(
                                    item
                                )
                            }
                        >
                            {item}
                        </button>

                    )
                )}

            </div>

            {/* TRANSACTIONS */}

            {loading ? (

                <div className="loading-container">

                    {[
                        1,
                        2,
                        3,
                        4,
                        5
                    ].map(
                        (i) => (

                            <div
                                key={i}
                                className="loading-card"
                            />

                        )
                    )}

                </div>

            ) : filteredTransactions.length ===
              0 ? (

                <div className="empty-state">

                    <h1>
                        📄
                    </h1>

                    <h3>
                        No Transactions Yet
                    </h3>

                    <p>
                        Your completed transactions
                        will appear here.
                    </p>

                </div>

            ) : (

                <div className="transaction-list">

                    {filteredTransactions.map(
                        (item) => {

                            const transactionType =
                                String(
                                    item.transaction_type ||
                                    ""
                                ).toLowerCase();

                            const status =
                                normalizeStatus(
                                    item.status
                                );

                            const isAirtime =
                                transactionType ===
                                "airtime";

                            return (

                                <div
                                    className="transaction-card"
                                    key={item.id}
                                >

                                    {/* LEFT */}

                                    <div className="transaction-left">

                                        <div className="transaction-icon">

                                            {getIcon(
                                                item.transaction_type
                                            )}

                                        </div>

                                        <div>

                                            <h4>
                                                {
                                                    item.description ||
                                                    "Transaction"
                                                }
                                            </h4>

                                            <small>
                                                {
                                                    item.reference ||
                                                    "No reference"
                                                }
                                            </small>

                                            <br />

                                            <small>
                                                {
                                                    item.created_at ||
                                                    ""
                                                }
                                            </small>

                                            {/* AIRTIME DETAILS */}

                                            {isAirtime &&
                                                item.recipient && (

                                                <div
                                                    style={{
                                                        marginTop:
                                                            "6px"
                                                    }}
                                                >

                                                    <small>
                                                        <strong>
                                                            Recipient:
                                                        </strong>{" "}
                                                        {
                                                            item.recipient
                                                        }
                                                    </small>

                                                    {item.network && (

                                                        <>
                                                            {" • "}

                                                            <small>
                                                                <strong>
                                                                    Network:
                                                                </strong>{" "}
                                                                {
                                                                    String(
                                                                        item.network
                                                                    ).toUpperCase()
                                                                }
                                                            </small>
                                                        </>

                                                    )}

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                    {/* RIGHT */}

                                    <div className="transaction-right">

                                        <h3>
                                            ₦
                                            {Number(
                                                item.amount ||
                                                0
                                            ).toLocaleString(
                                                "en-NG"
                                            )}
                                        </h3>

                                        <span
                                            className={
                                                getStatusClass(
                                                    item.status
                                                )
                                            }
                                        >

                                            {
                                                getStatusIcon(
                                                    item.status
                                                )
                                            }

                                            &nbsp;

                                            {
                                                getDisplayStatus(
                                                    item.status
                                                )
                                            }

                                        </span>

                                        <p>

                                            Balance

                                            <br />

                                            <strong>
                                                ₦
                                                {Number(
                                                    item.balance_after ||
                                                    0
                                                ).toLocaleString(
                                                    "en-NG"
                                                )}
                                            </strong>

                                        </p>

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            )}

        </div>
    );
}