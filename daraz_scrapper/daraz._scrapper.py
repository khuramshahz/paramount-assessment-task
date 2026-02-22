import requests
import pandas as pd

data = []

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.daraz.pk/",
    "X-Requested-With": "XMLHttpRequest"
}

for page in range(1, 3):

    url = f"https://www.daraz.pk/catalog/?ajax=true&page={page}&q=headphones"

    response = requests.get(url, headers=headers)

    # DEBUG: check response
    print("Status:", response.status_code)

    json_data = response.json()

    products = json_data["mods"]["listItems"]

    for p in products:
        name = p.get("name", "N/A")
        price = p.get("priceShow", "N/A")
        rating = p.get("ratingScore", "No rating")
        sold = p.get("itemSoldCntShow", "N/A")
        link = "https:" + p.get("productUrl", "")

        data.append([name, price, rating, sold, link])

df = pd.DataFrame(data, columns=[
    "Product Name",
    "Price",
    "Rating",
    "Sold",
    "URL"
])

df.to_csv("daraz_products.csv", index=False)

print("✅ SUCCESS — CSV CREATED!")