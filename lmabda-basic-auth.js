/**
* BASIC Authentication
*
* Simple authentication script intended to be run by Amazon Lambda to
* provide Basic HTTP Authentication for a static website hosted in an
* Amazon S3 bucket through Couldfront.
*
* https://hackernoon.com/serverless-password-protecting-a-static-website-in-an-aws-s3-bucket-bfaaa01b8666
*/
 
'use strict';
 
exports.handler = (event, context, callback) => {
 
    // Get request and request headers
    const request = event.Records[0].cf.request;
    const headers = request.headers;
 
    // Configure authentication
    const authUser = 'syngenta';
    const authPass = 'Syngenta@2018';
 
    // Construct the Basic Auth string
    const authString = 'Basic ' + new Buffer(authUser + ':' + authPass).toString('base64');
    console.log('User:' + authUser);
    console.log('passwd:' + authPass); 
    console.log('authstring:' + authString); 
    console.log('header auth string:' + headers.authorization[0].value); 
    console.log('header auth:' + headers.authorization); 

    // Require Basic authentication
    if (typeof headers.authorization == 'undefined' || headers.authorization[0].value != authString) {
        const body = 'Unauthorized';
        const response = {
            status: '401',
            statusDescription: 'Unauthorized' + authUser + authPass,
            body: body,
            headers: {
                'www-authenticate': [{key: 'WWW-Authenticate', value:'Basic'}]
            },
        };
        callback(null, response);
    }
    
        console.log('Authorized');
 
    // Continue request processing if authentication passed
    callback(null, request);
};
