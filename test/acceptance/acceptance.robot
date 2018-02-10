*** Settings ***
Library           DatabaseLibrary
Library           OperatingSystem
Library           DateTime
Library           HttpLibrary.HTTP
Library           Collections

Resource          keywords.robot

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
  And Time Report Is Logged With Following Parameters  7,50 "Test 1.1"
  And Time Report Is Logged With Following Parameters  30 "Test 1.1"
  And Database Connection Is Initialised
  Then Time Report With Id 1 Should have 450 Minutes Reported
  And Time Report With Id 2 Should have 470 Minutes Reported
  And Time Report With Id 3 Should have 30 Minutes Reported

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

3.0 Should export json
  Given There Is No Database
  When Time Report Is Logged With Following Parameters  7,30 "Test 3.0 #tag1 #tag2"
  And Export Is Run With Following Parameters  ""
  Then Returned Export Value Should Be Valid Json
  And Export Should Contain 1 Time Report(s)
  And Exported Report With Index 0 Should Have 450 Minutes
  And Exported Report With Index 0 Should Have Following Description "Test 3.0 #tag1 #tag2"
  And Exported Report With Index 0 Should Have 2 Tags

3.1 Should export only current week by default
  Given There Is No Database
  When Time Report Is Logged With Following Parameters  20180101 7,30 "Test 3.1 past"
  And Time Report Is Logged With Following Parameters  7,30 "Test 3.1 current"
  And Time Report Is Logged With Following Parameters  29990101 7,30 "Test 3.1 future"
  And Export Is Run With Following Parameters  ""
  Then Returned Export Value Should Be Valid Json
  And Export Should Contain 1 Time Report(s)
  And Exported Report With Index 0 Should Have Following Description "Test 3.1 current"

3.2 Should filter export by tag
  Given There Is No Database
  When Time Report Is Logged With Following Parameters  7,30 "Test 3.2 #tag1 #tag2"
  And Time Report Is Logged With Following Parameters  7,30 "Test 3.2 #tag3 #tag4"
  And Export Is Run With Following Parameters  -t tag4
  Then Returned Export Value Should Be Valid Json
  And Export Should Contain 1 Time Report(s)
  And Exported Report With Index 0 Should Have Following Description "Test 3.2 #tag3 #tag4"

3.3 Should filter export by start date
  Given There Is No Database
  When Time Report Is Logged With Following Parameters  20180101 7,30 "Test 3.1 #tag1 #tag2"
  And Time Report Is Logged With Following Parameters  7,30 "Test 3.1 #tag3 #tag4"
  And Export Is Run With Following Parameters  -s 20180101
  Then Returned Export Value Should Be Valid Json
  And Export Should Contain 2 Time Report(s)

3.3 Should filter export by end date
  Given There Is No Database
  When Time Report Is Logged With Following Parameters  29990101 7,30 "Test 3.1 #tag1 #tag2"
  And Time Report Is Logged With Following Parameters  7,30 "Test 3.1 #tag3 #tag4"
  And Export Is Run With Following Parameters  -e 29990101
  Then Returned Export Value Should Be Valid Json
  And Export Should Contain 2 Time Report(s)
