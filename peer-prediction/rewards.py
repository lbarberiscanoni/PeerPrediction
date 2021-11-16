import json
import numpy as np
from pprint import pprint

with open("peer-prediction-test2.json") as f:
	raw_json = json.load(f)
	items = raw_json["items"]
	users = raw_json["users"]

	bids = {}
	for item_key in items.keys():
		bids = items[item_key]["current_bids"]
		values = []
		for bid in bids.values():
			value = float(bid["score"])
			values.append(value)

		top_quarter = np.percentile(values, 75)
		bottom_quarter = np.percentile(values, 25)
		median = np.median(values)
		print(median, top_quarter, bottom_quarter)

		winners = []
		prize = 0
		for bid in bids.values():
			if float(bid["score"]) <= bottom_quarter or float(bid["score"]) >= top_quarter:
				prize += float(bid["stake"])
			else:
				winners.append(bid["user"])
				users[bid["user"]]["capital"] = float(users[bid["user"]]["capital"]) + float(bid["stake"])

		for winner_id in winners:
			users[winner_id]["capital"] = float(users[winner_id]["capital"]) + (prize / float(len(winners)))

		pprint(users)
