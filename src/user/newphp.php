<?php



echo json_encode([
        'success' => false,
        'message' => 'i am working.'
    ]);
/*
|--------------------------------------------------------------------------
| Handle CORS preflight request
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
/*
|--------------------------------------------------------------------------
| SUBTOUSE - BUY DATA BUNDLE API
|--------------------------------------------------------------------------
| Provider:
|   Nellobyte Systems / ClubKonnect
|
| Provider endpoint:
|   APIDatabundleV1.asp
|
| Flow:
|   React
|      ↓
|   Bearer token authentication
|      ↓
|   Validate network / plan / phone
|      ↓
|   Lock user's wallet
|      ↓
|   Deduct customer amount
|      ↓
|   Create Pending transaction
|      ↓
|   Call ClubKonnect
|      ↓
|   ORDER_RECEIVED / processing
|      → Keep Pending
|
|   ORDER_COMPLETED
|      → Success
|
|   ORDER_FAILED / permanent error
|      → Failed + refund
|
| IMPORTANT:
|   - Existing transactions table is the source of truth.
|   - Never trust price sent from React.
|   - Never expose ClubKonnect credentials to React.
|   - Never refund an ambiguous provider response.
|--------------------------------------------------------------------------
*/

declare(strict_types=1);


/*
|--------------------------------------------------------------------------
| ERROR HANDLING
|--------------------------------------------------------------------------
*/

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);


/*
|--------------------------------------------------------------------------
| HEADERS / CORS
|--------------------------------------------------------------------------
*/

header('Content-Type: application/json; charset=UTF-8');

$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://beamaxtechpractical.online',
    'https://beamaxtechpractical.online'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');


/*
|--------------------------------------------------------------------------
| PREFLIGHT
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


/*
|--------------------------------------------------------------------------
| ONLY POST
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed.'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/conn.php';


/*
|--------------------------------------------------------------------------
| CLUBKONNECT CONFIG
|--------------------------------------------------------------------------
|
| This file should contain your actual credentials.
|
| Example:
|
| $clubkonnectUserID = '...';
| $clubkonnectAPIKey = '...';
|
| DO NOT put credentials inside React.
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/clubkonnect_config.php';


/*
|--------------------------------------------------------------------------
| HELPER FUNCTIONS
|--------------------------------------------------------------------------
*/

function respond(
    bool $success,
    string $message,
    array $data = [],
    int $httpCode = 200
): never {

    http_response_code($httpCode);

    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data'    => $data
    ]);

    exit;
}


function getBearerToken(): ?string
{
    $header = '';

    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $header = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }

    if ($header === '') {
        return null;
    }

    if (stripos($header, 'Bearer ') !== 0) {
        return null;
    }

    return trim(substr($header, 7));
}


function generateReference(): string
{
    return 'DAT-' .
        date('YmdHis') .
        '-' .
        strtoupper(bin2hex(random_bytes(5)));
}


function normalizePhone(string $phone): string
{
    $phone = preg_replace('/\s+/', '', trim($phone));

    /*
    |--------------------------------------------------------------------------
    | Nigerian local format
    |--------------------------------------------------------------------------
    | 08012345678
    |--------------------------------------------------------------------------
    */

    if (preg_match('/^234([789][0-9]{9})$/', $phone, $matches)) {
        return '0' . $matches[1];
    }

    if (preg_match('/^\+234([789][0-9]{9})$/', $phone, $matches)) {
        return '0' . $matches[1];
    }

    return $phone;
}


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

$token = getBearerToken();

if (!$token) {
    respond(
        false,
        'Authentication token is required.',
        [],
        401
    );
}

$tokenHash = hash('sha256', $token);


/*
|--------------------------------------------------------------------------
| FIND AUTHENTICATED USER
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    SELECT user_id, expires_at
    FROM api_tokens
    WHERE token_hash = ?
    LIMIT 1
");

if (!$stmt) {
    respond(
        false,
        'Authentication service is unavailable.',
        [],
        500
    );
}

$stmt->bind_param('s', $tokenHash);
$stmt->execute();

$result = $stmt->get_result();
$tokenRow = $result->fetch_assoc();

$stmt->close();

if (!$tokenRow) {
    respond(
        false,
        'Invalid authentication token.',
        [],
        401
    );
}


/*
|--------------------------------------------------------------------------
| CHECK TOKEN EXPIRATION
|--------------------------------------------------------------------------
*/

if (
    !empty($tokenRow['expires_at']) &&
    strtotime($tokenRow['expires_at']) < time()
) {
    respond(
        false,
        'Authentication token has expired.',
        [],
        401
    );
}

$userId = (int) $tokenRow['user_id'];


/*
|--------------------------------------------------------------------------
| READ JSON BODY
|--------------------------------------------------------------------------
*/

$rawBody = file_get_contents('php://input');

$body = json_decode($rawBody, true);

if (!is_array($body)) {
    respond(
        false,
        'Invalid JSON request.'
    );
}


/*
|--------------------------------------------------------------------------
| INPUTS
|--------------------------------------------------------------------------
*/

$network = strtolower(trim((string)($body['network'] ?? '')));
$planId  = trim((string)($body['planId'] ?? ''));
$phone   = normalizePhone((string)($body['phone'] ?? ''));


/*
|--------------------------------------------------------------------------
| BASIC VALIDATION
|--------------------------------------------------------------------------
*/

if ($network === '') {
    respond(false, 'Network is required.');
}

if ($planId === '') {
    respond(false, 'Data plan is required.');
}

if ($phone === '') {
    respond(false, 'Phone number is required.');
}


/*
|--------------------------------------------------------------------------
| NETWORK VALIDATION
|--------------------------------------------------------------------------
|
| Nellobyte network codes:
|
| MTN      = 01
| GLO      = 02
| 9MOBILE  = 03
| AIRTEL   = 04
|
|--------------------------------------------------------------------------
*/

$networkCodes = [
    'mtn'     => '01',
    'glo'     => '02',
    '9mobile' => '03',
    'airtel'  => '04'
];

if (!isset($networkCodes[$network])) {
    respond(
        false,
        'Invalid mobile network.'
    );
}

$mobileNetworkCode = $networkCodes[$network];


/*
|--------------------------------------------------------------------------
| PHONE VALIDATION
|--------------------------------------------------------------------------
*/

if (!preg_match('/^0[789][0-9]{9}$/', $phone)) {
    respond(
        false,
        'Invalid Nigerian mobile number.'
    );
}


/*
|--------------------------------------------------------------------------
| DATA PLAN CONFIGURATION
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| The IDs below MUST MATCH the IDs used by your React dataBundle.jsx.
|
| Replace/add plans according to the actual plans you sell.
|
| providerPlanId = the ID expected by APIDatabundleV1.asp
|
| price         = amount charged to SubtoUse customer
|
| providerCost  = your ClubKonnect cost
|
|--------------------------------------------------------------------------
*/

$dataPlans = [

    /*
    |--------------------------------------------------------------------------
    | MTN
    |--------------------------------------------------------------------------
    */

    'mtn-500mb' => [
        'network'      => 'mtn',
        'name'         => 'MTN 500MB',
        'size'         => '500MB',
        'validity'     => '30 Days',

        // Replace with your actual ClubKonnect DataPlan ID.
        'providerPlanId' => 'mtn-500mb',

        'providerCost' => 307.00,
        'price'        => 357.00
    ],

    'mtn-1gb' => [
        'network'      => 'mtn',
        'name'         => 'MTN 1GB',
        'size'         => '1GB',
        'validity'     => '30 Days',

        'providerPlanId' => 'mtn-1gb',

        'providerCost' => 410.00,
        'price'        => 510.00
    ],

    'mtn-2gb' => [
        'network'      => 'mtn',
        'name'         => 'MTN 2GB',
        'size'         => '2GB',
        'validity'     => '30 Days',

        'providerPlanId' => 'mtn-2gb',

        'providerCost' => 820.00,
        'price'        => 1020.00
    ],


    /*
    |--------------------------------------------------------------------------
    | GLO
    |--------------------------------------------------------------------------
    */

    'glo-5.8gb' => [
        'network'      => 'glo',
        'name'         => 'Glo 5.8GB',
        'size'         => '5.8GB',
        'validity'     => '30 Days',

        'providerPlanId' => 'glo-5.8gb',

        'providerCost' => 1400.00,
        'price'        => 1500.00
    ],


    /*
    |--------------------------------------------------------------------------
    | AIRTEL
    |--------------------------------------------------------------------------
    */

    'airtel-1gb' => [
        'network'      => 'airtel',
        'name'         => 'Airtel 1GB',
        'size'         => '1GB',
        'validity'     => '30 Days',

        'providerPlanId' => 'airtel-1gb',

        'providerCost' => 450.00,
        'price'        => 500.00
    ],


    /*
    |--------------------------------------------------------------------------
    | 9MOBILE
    |--------------------------------------------------------------------------
    */

    '9mobile-4.5gb' => [
        'network'      => '9mobile',
        'name'         => '9mobile 4.5GB',
        'size'         => '4.5GB',
        'validity'     => '30 Days',

        'providerPlanId' => '9mobile-4.5gb',

        'providerCost' => 1700.00,
        'price'        => 1800.00
    ]
];


/*
|--------------------------------------------------------------------------
| VERIFY PLAN
|--------------------------------------------------------------------------
*/

if (!isset($dataPlans[$planId])) {
    respond(
        false,
        'Invalid or unavailable data plan.'
    );
}

$plan = $dataPlans[$planId];


/*
|--------------------------------------------------------------------------
| PREVENT NETWORK / PLAN MISMATCH
|--------------------------------------------------------------------------
*/

if ($plan['network'] !== $network) {
    respond(
        false,
        'The selected data plan does not belong to the selected network.'
    );
}


$customerPrice = (float)$plan['price'];
$providerCost  = (float)$plan['providerCost'];
$profit        = $customerPrice - $providerCost;
$providerPlanId = (string)$plan['providerPlanId'];


/*
|--------------------------------------------------------------------------
| GENERATE TRANSACTION REFERENCE
|--------------------------------------------------------------------------
*/

$reference = generateReference();


/*
|--------------------------------------------------------------------------
| START DATABASE TRANSACTION
|--------------------------------------------------------------------------
*/

$conn->begin_transaction();

try {

    /*
    |--------------------------------------------------------------------------
    | LOCK USER WALLET
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        SELECT id, balance
        FROM register
        WHERE id = ?
        FOR UPDATE
    ");

    if (!$stmt) {
        throw new Exception('Unable to access wallet.');
    }

    $stmt->bind_param('i', $userId);
    $stmt->execute();

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    $stmt->close();

    if (!$user) {
        throw new Exception('User account not found.');
    }


    $balanceBefore = (float)$user['balance'];


    /*
    |--------------------------------------------------------------------------
    | CHECK BALANCE
    |--------------------------------------------------------------------------
    */

    if ($balanceBefore < $customerPrice) {

        $conn->rollback();

        respond(
            false,
            'Insufficient wallet balance.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CALCULATE NEW BALANCE
    |--------------------------------------------------------------------------
    */

    $balanceAfter = $balanceBefore - $customerPrice;


    /*
    |--------------------------------------------------------------------------
    | DEDUCT WALLET
    |--------------------------------------------------------------------------
    */

    $stmt = $conn->prepare("
        UPDATE register
        SET balance = ?
        WHERE id = ?
    ");

    if (!$stmt) {
        throw new Exception('Unable to update wallet.');
    }

    $stmt->bind_param(
        'di',
        $balanceAfter,
        $userId
    );

    if (!$stmt->execute()) {
        throw new Exception('Wallet deduction failed.');
    }

    $stmt->close();


    /*
    |--------------------------------------------------------------------------
    | CREATE PENDING TRANSACTION
    |--------------------------------------------------------------------------
    |
    | Existing transactions table is the source of truth.
    |--------------------------------------------------------------------------
    */

    $transactionType = 'data';
    $status = 'Pending';

    $description =
        $plan['name'] .
        ' data purchase for ' .
        $phone;

    $serviceProvider = 'ClubKonnect';


    $stmt = $conn->prepare("
        INSERT INTO transactions
        (
            user_id,
            reference,
            transaction_type,
            description,
            amount,
            provider_cost,
            profit,
            status,
            provider_reference,
            balance_before,
            balance_after,
            recipient,
            network,
            service_provider,
            response
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    ");

    if (!$stmt) {
        throw new Exception('Unable to create transaction.');
    }


    $emptyProviderReference = '';
    $emptyResponse = '';

    $stmt->bind_param(
        'isssdddssddssss',
        $userId,
        $reference,
        $transactionType,
        $description,
        $customerPrice,
        $providerCost,
        $profit,
        $status,
        $emptyProviderReference,
        $balanceBefore,
        $balanceAfter,
        $phone,
        $network,
        $serviceProvider,
        $emptyResponse
    );


    if (!$stmt->execute()) {
        throw new Exception('Unable to create transaction.');
    }

    $transactionId = $conn->insert_id;

    $stmt->close();


    /*
    |--------------------------------------------------------------------------
    | COMMIT WALLET + PENDING TRANSACTION
    |--------------------------------------------------------------------------
    |
    | We commit BEFORE calling the external provider.
    |
    | This is important because the provider request is external.
    |--------------------------------------------------------------------------
    */

    $conn->commit();


} catch (Throwable $e) {

    $conn->rollback();

    error_log(
        'SUBTOUSE BUY DATA DATABASE ERROR: ' .
        $e->getMessage()
    );

    respond(
        false,
        'Unable to process the data purchase.',
        [],
        500
    );
}


/*
|--------------------------------------------------------------------------
| BUILD PROVIDER REQUEST
|--------------------------------------------------------------------------
|
| Provider endpoint supplied:
|
| APIDatabundleV1.asp
|
| Required parameters:
|
| UserID
| APIKey
| MobileNetwork
| DataPlan
| MobileNumber
| RequestID
| CallBackURL
|
|--------------------------------------------------------------------------
*/

$providerUrl =
    'https://www.nellobytesystems.com/APIDatabundleV1.asp';


/*
|--------------------------------------------------------------------------
| CALLBACK
|--------------------------------------------------------------------------
|
| This must be your actual publicly accessible callback endpoint.
|
| Example:
| https://beamaxtechpractical.online/API/data_callback.php
|
| Do not put a localhost URL here.
|--------------------------------------------------------------------------
*/

$callbackUrl =
    'https://beamaxtechpractical.online/API/data_callback.php';


/*
|--------------------------------------------------------------------------
| PROVIDER CREDENTIALS
|--------------------------------------------------------------------------
|
| Adjust these variable names ONLY if your existing
| clubkonnect_config.php uses different names.
|--------------------------------------------------------------------------
*/

if (
    !isset($clubkonnectUserID) ||
    !isset($clubkonnectAPIKey)
) {

    /*
    |--------------------------------------------------------------------------
    | Refund because the provider request could not even be made.
    |--------------------------------------------------------------------------
    */

    $conn->begin_transaction();

    try {

        $stmt = $conn->prepare("
            SELECT balance
            FROM register
            WHERE id = ?
            FOR UPDATE
        ");

        $stmt->bind_param('i', $userId);
        $stmt->execute();

        $walletResult = $stmt->get_result();
        $wallet = $walletResult->fetch_assoc();

        $stmt->close();

        if (!$wallet) {
            throw new Exception('Wallet not found during refund.');
        }

        $refundBalanceBefore = (float)$wallet['balance'];
        $refundBalanceAfter =
            $refundBalanceBefore + $customerPrice;


        $stmt = $conn->prepare("
            UPDATE register
            SET balance = ?
            WHERE id = ?
        ");

        $stmt->bind_param(
            'di',
            $refundBalanceAfter,
            $userId
        );

        if (!$stmt->execute()) {
            throw new Exception('Refund wallet update failed.');
        }

        $stmt->close();


        $failedStatus = 'Failed';
        $responseText = 'Provider credentials are not configured.';

        $stmt = $conn->prepare("
            UPDATE transactions
            SET
                status = ?,
                balance_before = ?,
                balance_after = ?,
                response = ?
            WHERE id = ?
              AND status = 'Pending'
        ");

        $stmt->bind_param(
            'sddsi',
            $failedStatus,
            $refundBalanceBefore,
            $refundBalanceAfter,
            $responseText,
            $transactionId
        );

        if (!$stmt->execute()) {
            throw new Exception('Transaction failure update failed.');
        }

        $stmt->close();

        $conn->commit();

    } catch (Throwable $e) {

        $conn->rollback();

        error_log(
            'SUBTOUSE BUY DATA CREDENTIAL ERROR: ' .
            $e->getMessage()
        );
    }

    respond(
        false,
        'Data service is temporarily unavailable.',
        [],
        500
    );
}


/*
|--------------------------------------------------------------------------
| BUILD QUERY
|--------------------------------------------------------------------------
*/

$query = http_build_query([
    'UserID'        => $clubkonnectUserID,
    'APIKey'        => $clubkonnectAPIKey,
    'MobileNetwork' => $mobileNetworkCode,
    'DataPlan'      => $providerPlanId,
    'MobileNumber'  => $phone,
    'RequestID'     => $reference,
    'CallBackURL'   => $callbackUrl
]);

$url = $providerUrl . '?' . $query;


/*
|--------------------------------------------------------------------------
| CALL CLUBKONNECT
|--------------------------------------------------------------------------
*/

$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_TIMEOUT        => 45,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_HTTPGET        => true
]);

$providerResponse = curl_exec($ch);

$curlError = curl_error($ch);
$httpCode  = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);


/*
|--------------------------------------------------------------------------
| PROVIDER COMMUNICATION ERROR
|--------------------------------------------------------------------------
|
| VERY IMPORTANT:
|
| If the request times out / network fails, we DO NOT immediately
| refund the customer.
|
| The provider may have received the order.
|
| Therefore:
|
| Pending remains Pending.
|
|--------------------------------------------------------------------------
*/

if ($providerResponse === false || $curlError !== '') {

    $responseText =
        'Provider communication error: ' .
        $curlError;

    $stmt = $conn->prepare("
        UPDATE transactions
        SET response = ?
        WHERE id = ?
          AND status = 'Pending'
    ");

    if ($stmt) {

        $stmt->bind_param(
            'si',
            $responseText,
            $transactionId
        );

        $stmt->execute();
        $stmt->close();
    }

    respond(
        true,
        'Your data order has been received and is being processed.',
        [
            'reference' => $reference,
            'status'    => 'Pending'
        ]
    );
}


/*
|--------------------------------------------------------------------------
| DECODE PROVIDER RESPONSE
|--------------------------------------------------------------------------
*/

$responseData = json_decode(
    trim($providerResponse),
    true
);


/*
|--------------------------------------------------------------------------
| PROVIDER RESPONSE MUST BE JSON
|--------------------------------------------------------------------------
*/

if (!is_array($responseData)) {

    /*
    |--------------------------------------------------------------------------
    | Unknown provider response.
    |
    | DO NOT REFUND.
    |--------------------------------------------------------------------------
    */

    $responseText =
        'Unrecognized provider response: ' .
        substr(trim($providerResponse), 0, 1000);

    $stmt = $conn->prepare("
        UPDATE transactions
        SET response = ?
        WHERE id = ?
          AND status = 'Pending'
    ");

    if ($stmt) {

        $stmt->bind_param(
            'si',
            $responseText,
            $transactionId
        );

        $stmt->execute();
        $stmt->close();
    }

    respond(
        true,
        'Your data order has been received and is being processed.',
        [
            'reference' => $reference,
            'status'    => 'Pending'
        ]
    );
}


/*
|--------------------------------------------------------------------------
| EXTRACT PROVIDER VALUES
|--------------------------------------------------------------------------
*/

$providerStatus = strtoupper(
    trim((string)($responseData['status'] ?? ''))
);

$providerOrderId = trim(
    (string)(
        $responseData['orderid']
        ?? $responseData['orderID']
        ?? $responseData['order_id']
        ?? ''
    )
);

$providerRemark = trim(
    (string)(
        $responseData['remark']
        ?? $responseData['message']
        ?? ''
    )
);


/*
|--------------------------------------------------------------------------
| SAVE RAW PROVIDER RESPONSE
|--------------------------------------------------------------------------
*/

$rawProviderResponse = json_encode(
    $responseData,
    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
);

if ($rawProviderResponse === false) {
    $rawProviderResponse = $providerResponse;
}


/*
|--------------------------------------------------------------------------
| ACCEPTED / PROCESSING STATUS
|--------------------------------------------------------------------------
*/

$acceptedStatuses = [
    'ORDER_RECEIVED',
    'ORDER_ONHOLD',
    'ORDER_PROCESSING'
];


/*
|--------------------------------------------------------------------------
| COMPLETED STATUS
|--------------------------------------------------------------------------
*/

$completedStatuses = [
    'ORDER_COMPLETED'
];


/*
|--------------------------------------------------------------------------
| PERMANENT FAILURE STATUS
|--------------------------------------------------------------------------
*/

$failedStatuses = [
    'ORDER_FAILED',
    'INVALID_CREDENTIALS',
    'MISSING_CREDENTIALS',
    'MISSING_USERID',
    'MISSING_APIKEY',
    'MISSING_MOBILENETWORK',
    'MISSING_DATAPLAN',
    'MISSING_MOBILENUMBER',
    'INVALID_MOBILENUMBER',
    'INVALID_MOBILE_NUMBER',
    'INVALID_NETWORK',
    'INVALID_DATAPLAN',
    'INVALID_AMOUNT',
    'INSUFFICIENT_BALANCE',
    'INVALID_REQUESTID',
    'INVALID_CALLBACKURL'
];


/*
|--------------------------------------------------------------------------
| ORDER COMPLETED
|--------------------------------------------------------------------------
*/

if (in_array($providerStatus, $completedStatuses, true)) {

    $stmt = $conn->prepare("
        UPDATE transactions
        SET
            status = 'Success',
            provider_reference = ?,
            response = ?
        WHERE id = ?
          AND status = 'Pending'
    ");

    if ($stmt) {

        $stmt->bind_param(
            'ssi',
            $providerOrderId,
            $rawProviderResponse,
            $transactionId
        );

        $stmt->execute();
        $stmt->close();
    }


    respond(
        true,
        'Data purchase successful.',
        [
            'reference'         => $reference,
            'providerReference' => $providerOrderId,
            'status'            => 'Success',
            'network'           => $network,
            'plan'              => $plan['name'],
            'phone'             => $phone,
            'amount'            => $customerPrice
        ]
    );
}


/*
|--------------------------------------------------------------------------
| ORDER RECEIVED / PROCESSING
|--------------------------------------------------------------------------
*/

if (in_array($providerStatus, $acceptedStatuses, true)) {

    $stmt = $conn->prepare("
        UPDATE transactions
        SET
            provider_reference = ?,
            response = ?
        WHERE id = ?
          AND status = 'Pending'
    ");

    if ($stmt) {

        $stmt->bind_param(
            'ssi',
            $providerOrderId,
            $rawProviderResponse,
            $transactionId
        );

        $stmt->execute();
        $stmt->close();
    }


    respond(
        true,
        'Your data order has been received and is being processed.',
        [
            'reference'         => $reference,
            'providerReference' => $providerOrderId,
            'status'            => 'Pending',
            'network'           => $network,
            'plan'              => $plan['name'],
            'phone'             => $phone,
            'amount'            => $customerPrice
        ]
    );
}


/*
|--------------------------------------------------------------------------
| PERMANENT FAILURE
|--------------------------------------------------------------------------
*/

if (in_array($providerStatus, $failedStatuses, true)) {

    /*
    |--------------------------------------------------------------------------
    | Refund inside transaction.
    |--------------------------------------------------------------------------
    */

    $conn->begin_transaction();

    try {

        /*
        |--------------------------------------------------------------------------
        | LOCK WALLET
        |--------------------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            SELECT balance
            FROM register
            WHERE id = ?
            FOR UPDATE
        ");

        if (!$stmt) {
            throw new Exception('Unable to lock wallet for refund.');
        }

        $stmt->bind_param('i', $userId);
        $stmt->execute();

        $walletResult = $stmt->get_result();
        $wallet = $walletResult->fetch_assoc();

        $stmt->close();

        if (!$wallet) {
            throw new Exception('Wallet not found during refund.');
        }


        $refundBalanceBefore = (float)$wallet['balance'];

        $refundBalanceAfter =
            $refundBalanceBefore + $customerPrice;


        /*
        |--------------------------------------------------------------------------
        | REFUND WALLET
        |--------------------------------------------------------------------------
        */

        $stmt = $conn->prepare("
            UPDATE register
            SET balance = ?
            WHERE id = ?
        ");

        if (!$stmt) {
            throw new Exception('Unable to prepare wallet refund.');
        }

        $stmt->bind_param(
            'di',
            $refundBalanceAfter,
            $userId
        );

        if (!$stmt->execute()) {
            throw new Exception('Wallet refund failed.');
        }

        $stmt->close();


        /*
        |--------------------------------------------------------------------------
        | UPDATE TRANSACTION
        |--------------------------------------------------------------------------
        */

        $failedStatus = 'Failed';

        $stmt = $conn->prepare("
            UPDATE transactions
            SET
                status = ?,
                provider_reference = ?,
                balance_before = ?,
                balance_after = ?,
                response = ?
            WHERE id = ?
              AND status = 'Pending'
        ");

        if (!$stmt) {
            throw new Exception('Unable to update failed transaction.');
        }

        $stmt->bind_param(
            'ssddsi',
            $failedStatus,
            $providerOrderId,
            $refundBalanceBefore,
            $refundBalanceAfter,
            $rawProviderResponse,
            $transactionId
        );

        if (!$stmt->execute()) {
            throw new Exception('Failed transaction update failed.');
        }

        $stmt->close();


        $conn->commit();


    } catch (Throwable $e) {

        $conn->rollback();

        error_log(
            'SUBTOUSE DATA REFUND ERROR: ' .
            $e->getMessage()
        );

        respond(
            false,
            'The data order failed, but automatic refund processing requires attention.',
            [
                'reference' => $reference
            ],
            500
        );
    }


    respond(
        false,
        'Data purchase failed. Your wallet has been refunded.',
        [
            'reference' => $reference,
            'status'    => 'Failed'
        ]
    );
}


/*
|--------------------------------------------------------------------------
| UNKNOWN STATUS
|--------------------------------------------------------------------------
|
| THIS IS VERY IMPORTANT.
|
| We do NOT assume an unknown status means failure.
|
| The provider could introduce a new processing state.
|
| Therefore we keep the transaction Pending and save the response.
|--------------------------------------------------------------------------
*/

$stmt = $conn->prepare("
    UPDATE transactions
    SET
        provider_reference = ?,
        response = ?
    WHERE id = ?
      AND status = 'Pending'
");

if ($stmt) {

    $stmt->bind_param(
        'ssi',
        $providerOrderId,
        $rawProviderResponse,
        $transactionId
    );

    $stmt->execute();
    $stmt->close();
}


respond(
    true,
    'Your data order has been received and is being processed.',
    [
        'reference'         => $reference,
        'providerReference' => $providerOrderId,
        'status'            => 'Pending'
    ]
);
?>

