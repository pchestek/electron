console.log('Starting: crashReporter...')
const {crashReporter} = require('electron')
crashReporter.start({
    productName: 'TRUST crash upload test app',
    companyName: 'Thomson Reuters',
    submitURL: 'http://trustdev.thomsonreuters.com:8080/CrashesService.svc/REST/SubmitNativeCrash',
    autoSubmit: true,
    uploadToServer: true
})
console.log('Started: OK')
