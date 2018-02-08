*** Settings ***
Library           DatabaseLibrary
Library           OperatingSystem
Library           DateTime

Suite Setup       Run Keywords  Set Tmgmt Db Path Environment Variable
...                             Make Sure Target Directory Exists
...                             Remove old DB if exists
...                             Initialise Database connection
Suite Teardown    Run Keywords  Disconnect From Database
...                             Unset Tmgmt Db Path Environment Variable

*** Variables ***
${target_path}    ./target/acceptance
${db_path}        ${target_path}/tmgmt_test.sqlite

*** Test Cases ***
1.0 Should add time report with default date value (current date)
  ${rc} =  Run and Return RC  ./bin/tmgmt.js log 7,30 "Test 1.0"
  Should Be Equal As Integers  ${rc}  0
  Check If Exists In Database  SELECT * FROM time_reports WHERE description = 'Test 1.0';
  ${result} =  Query  SELECT date FROM time_reports WHERE description = 'Test 1.0';
  ${current_date} =  Current Date As String
  Should Be Equal As Strings  ${result[0][0]}  ${current_date}

*** Keywords ***
Set Tmgmt Db Path Environment Variable
  Set Environment Variable  TMGMT_DB_PATH  ${db_path}

Make Sure Target Directory Exists
  Create Directory  ${target_path}

Remove old DB if exists
  ${Status}  ${value} =  Run Keyword And Ignore Error  File Should Not Exist  ${db_path}
  Run Keyword If  "${Status}" == "FAIL"  Run Keyword And Ignore Error  Remove File  ${db_path}
  File Should Not Exist  ${db_path}

Initialise Database connection
  Connect To Database Using Custom Params    sqlite3    database="${db_path}", isolation_level=None

Unset Tmgmt Db Path Environment Variable
  Remove Environment Variable  TMGMT_DB_PATH

Current Date As String
  ${current_date} =  Get Current Date
  Log  ${current_date}
  ${result}  Convert Date  ${current_date}  result_format=%Y-%m-%d
  [return]  ${result}
