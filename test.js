const pm2 = require('pm2')

pm2.connect(function (err) {
  if (err) {
    console.error(err)
    process.exit(2)
  }

  pm2.start({
    script: 'api.js',
    name: 'API v0.2'
  }, function (err, apps) {
    if (err) {
      console.error(err)
      return pm2.disconnect()
    }

    pm2.list((err, list) => {
      console.log(err, list)

      pm2.restart('api', (err, proc) => {
        // Disconnects from PM2
        pm2.disconnect()
      })
    })
  })
})