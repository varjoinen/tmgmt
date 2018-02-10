*** Keywords ***
Set Environment Variables
  Set Environment Variable  TMGMT_DB_PATH  ${db_path}

Unset Environment Variables
  Remove Environment Variable  TMGMT_DB_PATH

Make Sure Target Directory Exists
  Create Directory  ${target_path}

There Is No Database
  Run Keyword And Ignore Error  Remove File  ${db_path}
  File Should Not Exist  ${db_path}

Database Connection Is Initialised
  Connect To Database Using Custom Params  sqlite3  database="${db_path}", isolation_level=None

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

Export Is Run With Following Parameters
  [Arguments]  ${parameters}
  ${rc}  ${output} =  Run and Return RC and Output  ./bin/tmgmt.js export ${parameters}
  Should Be Equal As Integers  ${rc}  0
  Set Test Variable  ${JSON}  ${output}

Export Should Contain ${count} Time Report(s)
  ${reports} =  Get Json Value  ${JSON}  /reports
  ${json_output} =  evaluate  json.loads('''${reports}''')  json
  Length Should Be  ${json_output}  ${count}

Returned Export Value Should Be Valid Json
  Should Be Valid JSON  ${JSON}

Exported Report With Index ${index} Should Have ${minutes} Minutes
  ${reported_minutes} =  Get Json Value  ${JSON}  /reports/${index}/time_in_minutes
  Should Be Equal As Integers  ${reported_minutes}  ${minutes}

Exported Report With Index ${index} Should Have Following Description ${description}
  ${reported_description} =  Get Json Value  ${JSON}  /reports/${index}/description
  Should Be Equal As Strings  ${reported_description}  ${description}

Exported Report With Index ${index} Should Have ${count} Tags
  ${tags} =  Get Json Value  ${JSON}  /reports/${index}/tags
  ${json_output} =  evaluate  json.loads('''${tags}''')  json
  Length Should Be  ${json_output}  ${count}
