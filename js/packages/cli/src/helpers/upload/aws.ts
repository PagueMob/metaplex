import log from 'loglevel';
import { basename } from 'path';
import { createReadStream } from 'fs';
import { Readable } from 'form-data';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { getType } from 'mime';
import { setImageUrlManifest } from './file-uri';

async function uploadFile(
  s3Client: S3Client,
  awsS3Bucket: string,
  filename: string,
  contentType: string,
  body: string | Readable | ReadableStream<any> | Blob | Uint8Array | Buffer,
): Promise<string> {
  const mediaUploadParams = {
    Bucket: awsS3Bucket,
    Key: filename,
    Body: body,
    ACL: 'public-read',
    ContentType: contentType,
  };

  try {
    await s3Client.send(new PutObjectCommand(mediaUploadParams));
    log.info('uploaded filename:', filename);
  } catch (err) {
    log.info('Error', err);
  }

  const url = `https://${awsS3Bucket}/${filename}`;
  log.debug('Location:', url);
  return url;
}

export async function awsUpload(
  awsS3Bucket: string,
  eventId: number,
  lotId: number,
  image: string,
  animation: string,
  manifestBuffer: Buffer,
) {
  const REGION = 'us-east-1'; // TODO: Parameterize this.
  const s3Client = new S3Client({ region: REGION });

  async function uploadMedia(media) {
    const mediaPath = `${eventId}/${lotId}/media/${basename(media)}`;
    log.debug('media:', media);
    log.debug('mediaPath:', mediaPath);
    const mediaFileStream = createReadStream(media);
    const mediaUrl = await uploadFile(
      s3Client,
      awsS3Bucket,
      mediaPath,
      getType(media),
      mediaFileStream,
    );
    return mediaUrl;
  }

  // Copied from ipfsUpload
  const imageUrl = `${await uploadMedia(image)}?ext=${path
    .extname(image)
    .replace('.', '')}`;
  const animationUrl = animation
    ? `${await uploadMedia(animation)}?ext=${path
        .extname(animation)
        .replace('.', '')}`
    : undefined;

  const manifestJson = await setImageUrlManifest(
    manifestBuffer.toString('utf8'),
    imageUrl,
    animationUrl,
  );

  const updatedManifestBuffer = Buffer.from(JSON.stringify(manifestJson));

  const extensionRegex = new RegExp(`${path.extname(image)}$`);
  var jsonPath = `${eventId}/${lotId}/json/${basename(image)}`;
  jsonPath = jsonPath.replace(extensionRegex, '.json');
  log.debug('jsonPath', jsonPath);
  const metadataUrl = await uploadFile(
    s3Client,
    awsS3Bucket,
    jsonPath,
    'application/json',
    updatedManifestBuffer,
  );

  return [metadataUrl, imageUrl, animationUrl];
}
