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


