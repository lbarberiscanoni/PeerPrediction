import boto3

region_name = 'us-east-1'
aws_access_key_id = "AKIA5ZAFRMQINE2NLHOB"
aws_secret_access_key = "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"

# endpoint_url = 'https://mturk-requester-sandbox.us-east-1.amazonaws.com'

# Uncomment this line to use in production
endpoint_url = 'https://mturk-requester.us-east-1.amazonaws.com'

client = boto3.client(
    'mturk',
    endpoint_url=endpoint_url,
    region_name=region_name,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
)

# This will return $10,000.00 in the MTurk Developer Sandbox
# print(client.get_account_balance()['AvailableBalance'])

hits = client.list_hits()['HITs']

for hit in hits:
	hit_id = hit["HITId"]
	print(hit_id)
	assignments = client.list_assignments_for_hit(HITId=hit_id)
	print(assignments)
	for assignment in assignments:
		worker_id = assignment["WorkerId"]