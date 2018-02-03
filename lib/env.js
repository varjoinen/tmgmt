const getEnv = () => {
  return {
    dbFilePath: process.env.TMGMT_DB_PATH ? process.env.TMGMT_DB_PATH : './tmgmt.sqlite'
  };
}

module.exports = {
  getEnv
}
