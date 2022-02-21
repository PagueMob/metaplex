import AwsS3 from 'aws-sdk/clients/s3.js'
import log from 'loglevel';

const s3 = new AwsS3({
  region: 'us-east-1'
})
export const putObject = (bucket: string, key: string, body: string) => {
  let params = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: `application/json; charset=utf-8`
  }
  return new Promise((resolve, reject) => {
    log.debug(`s3: ${JSON.stringify(s3)}`);
    log.debug(`S3 request key: ${key}`)
    s3.putObject(params, (err, data) => {
      if (err) {
        return reject(err)
      } else {
        log.debug(`S3 response data: ${JSON.stringify(data, null, 2)}`)
        return resolve(params)
      }
    })
  })
}
