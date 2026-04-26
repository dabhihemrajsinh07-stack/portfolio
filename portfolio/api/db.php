<?php
declare(strict_types=1);

// XAMPP defaults: user root, empty password. Change if your MySQL differs.

$DB_HOST = '127.0.0.1';
$DB_NAME = 'portfolio';
$DB_USER = 'root';
$DB_PASS = '';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function db(): mysqli
{
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;

    $conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
    $conn->set_charset('utf8mb4');
    return $conn;
}
