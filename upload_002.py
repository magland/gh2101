import os
import time
import boto3
import json
import tempfile

def main():
    s3 = _get_s3_client()
    dirname = '/mnt/home/neurostatslab/ceph/saneslab_data/big_setup/experiment_237/concatenated_data_cam_mic_sync'

    top_level_file_names = os.listdir(dirname)

    manifest_data = []
    for fname in top_level_file_names:
        if fname.endswith(".wav"):
            rel_path = 'audio/' + fname
        elif fname.endswith(".mp4"):
            rel_path = 'videos/' + fname
        else:
            print(f"Skipping unsupported file type: {fname}")
            continue
        upload_key = f'from_gily/datasets/237/{rel_path}'
        full_path = os.path.join(dirname, fname)
        fsize = os.path.getsize(full_path)
        size_mb = fsize / (1024 * 1024)
        print(f"Processing file: {rel_path} ({size_mb:.2f} MB)")
        if not _exists_in_bucket(s3, 'tempory', upload_key):
            print(f"Uploading to S3...")
            _upload_file_to_s3(
                s3,
                'tempory',
                upload_key,
                full_path
            )
        else:
            print(f"File {rel_path} already exists in S3 bucket.")
        # Add to manifest (size already calculated above)
        manifest_data.append({
            "path": rel_path,
            "size": fsize
        })
    manifest_key = 'from_gily/datasets/237/manifest.json'
    with tempfile.TemporaryDirectory() as tmpdir:
        manifest_path = os.path.join(tmpdir, "manifest.json")
        with open(manifest_path, "w") as f:
            json.dump(manifest_data, f, indent=2)
        _upload_file_to_s3(s3, 'tempory', manifest_key, manifest_path)
        print(f"Uploaded manifest.json to S3")

def _get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
        endpoint_url=os.environ["S3_ENDPOINT_URL"],
        region_name="auto",  # for cloudflare
    )

def _upload_file_to_s3(s3, bucket, object_key, fname):
    if fname.endswith(".html"):
        content_type = "text/html"
    elif fname.endswith(".js"):
        content_type = "application/javascript"
    elif fname.endswith(".css"):
        content_type = "text/css"
    elif fname.endswith(".png"):
        content_type = "image/png"
    elif fname.endswith(".jpg"):
        content_type = "image/jpeg"
    elif fname.endswith(".svg"):
        content_type = "image/svg+xml"
    elif fname.endswith(".json"):
        content_type = "application/json"
    elif fname.endswith(".gz"):
        content_type = "application/gzip"
    else:
        content_type = None
    extra_args = {}
    if content_type is not None:
        extra_args["ContentType"] = content_type
    num_retries = 3
    while True:
        try:
            s3.upload_file(fname, bucket, object_key, ExtraArgs=extra_args)
            break
        except Exception as e:
            print(f"Error uploading {object_key} to S3: {e}")
            time.sleep(3)
            num_retries -= 1
            if num_retries == 0:
                raise

def _exists_in_bucket(s3, bucket, object_key):
    try:
        s3.head_object(Bucket=bucket, Key=object_key)
        return True
    except Exception as e:
        if "404" in str(e):
            return False
        else:
            raise

if __name__ == "__main__":
    main()
