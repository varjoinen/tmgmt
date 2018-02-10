*** Settings ***
Library           DatabaseLibrary
Library           OperatingSystem
Library           DateTime

Suite Setup       Run Keywords  Make Sure Target Directory Exists
...                             Set Environment Variables
Suite Teardown    Unset Environment Variables

Test Teardown     Disconnect From Database

*** Variables ***
${target_path}    ./target/acceptance
${db_path}        ${target_path}/tmgmt_test.sqlite

*** Test Cases ***
1.0 Should add time report with default date value (current date)
  Given There Is No Database
  When Time Report Is Logged With Following Parameters  7,30 "Test 1.0"
  And Database Connection Is Initialised
  Then There Should Be 1 Time Report(s) And 0 Tag(s)
  And Database Should Contain A Time Report With Description  Test 1.0
  And Time Report With Id 1 Should Have Current Date

1.1 Should convert reported time to minutes
  Given There Is No Database
  When Time Report Is Logged With Following Parameters  7,30 "Test 1.1"

1.2 Should add time report with given date value
  Given There Is No Database
  When Time Report Is Logged With Following Parameters  20180101 7,50 "Test 1.2"
  And Database Connection Is Initialised
  Then There Should Be 1 Time Report(s) And 0 Tag(s)
  And Time Report With Id 1 Should Have Date 2018-01-01

1.3 Should add time report with tags
  Given There Is No Database
  When Time Report Is Logged With Following Parameters  7,30 "Test 1.3 #tag1 #tag2"
  And Database Connection Is Initialised
  Then There Should Be 1 Time Report(s) And 2 Tag(s)
  And Time Report With Id 1 Should Contain Tag tag1
  And Time Report With Id 1 Should Contain Tag tag2

2.0 Should remove report
  Given There Is No Database
  When Time Report Is Logged With Following Parameters  7,30 "Test 2.0 1 #tag1 #tag2"
  And Time Report Is Logged With Following Parameters  7,30 "Test 2.0 2 #tag3 #tag4"
  And Time Report With Id 1 Is Removed
  And Database Connection Is Initialised
  And Then There Should Be 1 Time Report(s) And 2 Tag(s)
  And Time Report With Id 2 Should Contain Tag tag3
  And Time Report With Id 2 Should Contain Tag tag4
  And There Should Not Be Time Report With Id  1
  And There Should Not Be Tags For Time Report With Id  1

*** Keywords ***
Set Environment Variables
  Set Environment Variable  TMGMT_DB_PATH  ${db_path}

Make Sure Target Directory Exists
  Create Directory  ${target_path}

There Is No Database
  Run Keyword And Ignore Error  Remove File  ${db_path}
  File Should Not Exist  ${db_path}

Database Connection Is Initialised
  Connect To Database Using Custom Params  sqlite3  database="${db_path}", isolation_level=None

Unset Environment Variables
  Remove Environment Variable  TMGMT_DB_PATH

Current Date As String
  ${current_date} =  Get Current Date
  Log  ${current_date}
  ${result}  Convert Date  ${current_date}  result_format=%Y-%m-%d
  [return]  ${result}

Database Should Contain A Time Report With Description
  [Arguments]  ${description}
  ${result} =  Query  SELECT description FROM time_reports WHERE description = '${description}';
  Should Be Equal As Strings  ${result[0][0]}  ${description}

Time Report Is Logged With Following Parameters
  [Arguments]  ${parameters}
  ${rc} =  Run and Return RC  ./bin/tmgmt.js log ${parameters}
  Should Be Equal As Integers  ${rc}  0

Time Report With Id ${id} Should Have Current Date
  ${result} =  Query  SELECT date FROM time_reports WHERE id = ${id}
  ${current_date} =  Current Date As String
  Should Be Equal As Strings  ${result[0][0]}  ${current_date}

Then There Should Be ${number_of_time_reports} Time Report(s) And ${number_of_tags} Tag(s)
  ${count_of_time_reports} =  Row Count  SELECT * FROM time_reports;
  ${count_of_tags} =  Row Count  SELECT * FROM tags;
  Should Be Equal As Integers  ${number_of_time_reports}  ${count_of_time_reports}
  Should Be Equal As Integers  ${number_of_tags}  ${count_of_tags}

Time Report With Id ${id} Should Have Date ${date_String}
  ${result} =  Query  SELECT date FROM time_reports WHERE id = ${id}
  Should Be Equal As Strings  ${result[0][0]}  ${date_String}

Time Report With Id ${id} Should Contain Tag ${tag}
  ${count} =  Row Count  SELECT tag FROM tags WHERE time_report_id = ${id} AND tag = '${tag}'
  Should Be Equal As Integers  ${count}  1

Time Report With Id ${id} Should have ${minutes} Minutes Reported
  ${result} =  Query  SELECT time_in_minutes FROM time_reports WHERE id = ${id}
  Should Be Equal As Integers  ${result[0][0]}  ${minutes}

There Should Not Be Time Report With Id
  [Arguments]  ${id}
  Check If Not Exists In Database  SELECT * FROM time_reports WHERE id = ${id}

There Should Not Be Tags For Time Report With Id
  [Arguments]  ${id}
  Check If Not Exists In Database  SELECT * FROM tags WHERE time_report_id = ${id}

Time Report With Id ${id} Is Removed
  ${rc} =  Run and Return RC  ./bin/tmgmt.js rm ${id}
  Should Be Equal As Integers  ${rc}  0
